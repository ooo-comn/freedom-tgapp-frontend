import { useCallback, useEffect, useRef } from "react";

interface UseQRScannerOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: unknown) => void;
  text?: string;
}

export const useQRScanner = (options: UseQRScannerOptions = {}) => {
  const { onSuccess, onError, text = "Наведите камеру на QR-код" } = options;
  const isScanningRef = useRef(false);
  const resolveRef = useRef<((value: string) => void) | null>(null);
  const rejectRef = useRef<((error: unknown) => void) | null>(null);
  const validatorRef = useRef<((qr: string) => boolean) | null>(null);
  const errorMessageRef = useRef<string | undefined>(undefined);
  const timeoutRef = useRef<number | null>(null);
  const isHandlingRef = useRef(false);
  const closeIntervalRef = useRef<number | null>(null);
  const onSuccessRef = useRef<typeof onSuccess>(onSuccess);

  // Храним актуальный onSuccess в ref, чтобы не перевешивать обработчики
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Функция для нативного закрытия QR сканера
  const closeQRScanner = useCallback(() => {
    console.log("=== Closing QR Scanner Natively ===");

    try {
      // Закрываем только попап сканера, не всё WebApp
      if (typeof window.Telegram?.WebApp?.closeScanQrPopup === "function") {
        console.log("Using closeScanQrPopup API...");
        window.Telegram.WebApp.closeScanQrPopup();
        // Дублирующий вызов как страховка для некоторых клиентов Telegram
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
        }, 50);
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
        }, 150);
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
        }, 300);
        // Повторяющееся закрытие до прихода события закрытия (макс 10 попыток)
        if (closeIntervalRef.current) {
          clearInterval(closeIntervalRef.current);
          closeIntervalRef.current = null;
        }
        let attempts = 0;
        closeIntervalRef.current = window.setInterval(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
          attempts += 1;
          if (attempts >= 10) {
            if (closeIntervalRef.current) {
              clearInterval(closeIntervalRef.current);
              closeIntervalRef.current = null;
            }
          }
        }, 100);
        isScanningRef.current = false;
        console.log("QR Scanner closed via closeScanQrPopup");
      } else {
        console.log(
          "No closeScanQrPopup API available, relying on return true"
        );
        isScanningRef.current = false;
      }
    } catch (error) {
      console.error("Error closing QR scanner:", error);
      isScanningRef.current = false;
    }
  }, []);

  // Обработка событий QR сканера
  useEffect(() => {
    const handleQRTextReceived = (eventData: { data?: string }) => {
      console.log("=== QR Text Received Event in useQRScanner ===");
      console.log("Event data:", eventData);
      console.log("isScanningRef.current:", isScanningRef.current);

      if (eventData.data && !isHandlingRef.current) {
        isHandlingRef.current = true;
        const qrText: string = eventData.data;
        console.log("QR Code scanned via event:", qrText);

        // Чистим таймаут при успешном чтении
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Если задан валидатор — валидируем. При невалидном значении не закрываем попап
        if (validatorRef.current) {
          const isValid = validatorRef.current(qrText);
          console.log("QR validation result:", isValid);
          if (!isValid) {
            if (errorMessageRef.current && window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(errorMessageRef.current);
            }
            isHandlingRef.current = false;
            return; // оставляем сканер открытым
          }
        }

        // Сначала блокируем дальнейшие события и закрываем попап
        isScanningRef.current = false;
        closeQRScanner();

        // Затем отдаем результат наружу
        onSuccessRef.current?.(qrText);
        if (resolveRef.current) {
          resolveRef.current(qrText);
          resolveRef.current = null;
          rejectRef.current = null;
        }
        // Сбрасываем валидатор после успешного результата
        validatorRef.current = null;
        errorMessageRef.current = undefined;
        // isHandlingRef сбросим после события закрытия попапа,
        // чтобы не ловить дубликаты qr_text_received пока попап ещё на экране
      } else {
        console.log("QR event received but scanner is not active or no data");
      }
    };

    const handleScanQRPopupClosed = () => {
      console.log("=== QR Scanner Popup Closed Event ===");
      isScanningRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (closeIntervalRef.current) {
        clearInterval(closeIntervalRef.current);
        closeIntervalRef.current = null;
      }

      // Снимаем флаг обработки, очищаем ссылки на Promise
      isHandlingRef.current = false;
      if (resolveRef.current) {
        rejectRef.current?.(new Error("QR Scanner closed by user"));
        resolveRef.current = null;
        rejectRef.current = null;
      }
    };

    // Используем официальный Telegram.WebApp.onEvent API
    if (window.Telegram?.WebApp?.onEvent) {
      // Основное событие
      (window.Telegram.WebApp as any).onEvent(
        "qrTextReceived",
        handleQRTextReceived
      );
      // Фолбэк для платформ, присылающих snake_case
      (window.Telegram.WebApp as any).onEvent(
        "qr_text_received",
        handleQRTextReceived as unknown as (data: unknown) => void
      );
      (window.Telegram.WebApp as any).onEvent(
        "scanQrPopupClosed",
        handleScanQRPopupClosed
      );
      // Snake case вариант названия события закрытия на некоторых клиентах
      (window.Telegram.WebApp as any).onEvent(
        "scan_qr_popup_closed",
        handleScanQRPopupClosed as unknown as (data: unknown) => void
      );
    }

    console.log(
      "QR Scanner event listeners setup completed using Telegram.WebApp.onEvent"
    );

    // Очистка при размонтировании
    return () => {
      if (window.Telegram?.WebApp?.offEvent) {
        (window.Telegram.WebApp as any).offEvent(
          "qrTextReceived",
          handleQRTextReceived
        );
        (window.Telegram.WebApp as any).offEvent(
          "qr_text_received",
          handleQRTextReceived as unknown as (data: unknown) => void
        );
        (window.Telegram.WebApp as any).offEvent(
          "scanQrPopupClosed",
          handleScanQRPopupClosed
        );
      }
    };
  }, [closeQRScanner]);

  const scanQR = useCallback(async (): Promise<string | null> => {
    try {
      console.log("=== QR Scanner Debug ===");

      // Проверяем доступность QR сканера
      const isAvailable =
        typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
      console.log("QR Scanner isAvailable:", isAvailable);

      if (isAvailable) {
        console.log("Opening QR scanner...");
        isScanningRef.current = true;

        return new Promise((resolve, reject) => {
          // Сохраняем ссылки на resolve и reject
          resolveRef.current = resolve;
          rejectRef.current = reject;

          timeoutRef.current = window.setTimeout(() => {
            if (isScanningRef.current) {
              isScanningRef.current = false;
              closeQRScanner();
              const error = new Error("QR Scanner timeout");
              onError?.(error);
              reject(error);
              resolveRef.current = null;
              rejectRef.current = null;
            }
            timeoutRef.current = null;
          }, 30000); // 30 секунд таймаут

          // Открываем попап без callback — ждём только событие qrTextReceived
          window.Telegram.WebApp.showScanQrPopup({ text });
        });
      } else {
        console.log("No QR scanner available!");
        const error = new Error("QR Scanner is not available");
        onError?.(error);
        return null;
      }
    } catch (error) {
      console.error("QR Scanner error:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : error
      );
      isScanningRef.current = false;
      onError?.(error);
      return null;
    }
  }, [onError, text, closeQRScanner]);

  const scanQRWithValidation = useCallback(
    async (
      validator: (qr: string) => boolean,
      errorMessage?: string
    ): Promise<string | null> => {
      try {
        console.log("=== QR Scanner Validation Debug ===");

        // Проверяем доступность QR сканера
        const isAvailable =
          typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
        console.log("QR Scanner isAvailable:", isAvailable);

        if (isAvailable) {
          console.log("Opening QR scanner with validation...");
          isScanningRef.current = true;

          return new Promise((resolve, reject) => {
            // Сохраняем ссылки на resolve/reject
            resolveRef.current = resolve;
            rejectRef.current = reject;

            // Настраиваем валидатор на время этого сканирования
            validatorRef.current = validator;
            errorMessageRef.current = errorMessage;

            timeoutRef.current = window.setTimeout(() => {
              if (isScanningRef.current) {
                isScanningRef.current = false;
                closeQRScanner();
                const error = new Error("QR Scanner timeout");
                onError?.(error);
                reject(error);
                resolveRef.current = null;
                rejectRef.current = null;
                validatorRef.current = null;
                errorMessageRef.current = undefined;
              }
              timeoutRef.current = null;
            }, 30000);

            // Открываем попап без callback — валидация произойдёт в обработчике события
            window.Telegram.WebApp.showScanQrPopup({ text });
          });
        } else {
          const error = new Error("QR Scanner is not available");
          onError?.(error);
          return null;
        }
      } catch (error) {
        console.error("QR Scanner validation error:", error);
        isScanningRef.current = false;
        onError?.(error);
        return null;
      }
    },
    [onError, text, closeQRScanner]
  );

  // Проверяем доступность при инициализации хука
  const isAvailable =
    typeof window.Telegram?.WebApp?.showScanQrPopup === "function";

  console.log("=== useQRScanner Hook Debug ===");
  console.log("isAvailable:", isAvailable);
  console.log("isScanning:", isScanningRef.current);

  return {
    scanQR,
    scanQRWithValidation,
    closeQRScanner,
    isAvailable,
    isOpened: isScanningRef.current,
  };
};
