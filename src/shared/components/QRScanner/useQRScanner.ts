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
  const isProcessingRef = useRef(false); // Переименован для ясности
  const onSuccessRef = useRef<typeof onSuccess>(onSuccess);

  // Debug helpers
  const debugSessionIdRef = useRef<string>("");
  const countersRef = useRef({
    event_qr: 0,
    callbacks: 0,
    timeouts: 0,
    closeCalls: 0,
  });

  const log = useCallback((...args: unknown[]) => {
    console.log(`[QR][${debugSessionIdRef.current}]`, ...args);
  }, []);

  const logError = useCallback((...args: unknown[]) => {
    console.error(`[QR][${debugSessionIdRef.current}]`, ...args);
  }, []);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    debugSessionIdRef.current = `QR-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    log("Hook initialized");
  }, [log]);

  // Упрощенная функция закрытия
  const closeQRScanner = useCallback(() => {
    countersRef.current.closeCalls += 1;
    log("Closing QR Scanner", { closeCalls: countersRef.current.closeCalls });

    try {
      if (typeof window.Telegram?.WebApp?.closeScanQrPopup === "function") {
        window.Telegram.WebApp.closeScanQrPopup();
        log("closeScanQrPopup called");
      }
    } catch (error) {
      logError("Error closing QR scanner:", error);
    }

    isScanningRef.current = false;
  }, [log, logError]);

  // Функция для обработки успешного результата
  const handleSuccess = useCallback(
    (qrText: string) => {
      log("Processing QR result:", qrText);

      // Проверяем, не обрабатываем ли уже результат
      if (isProcessingRef.current) {
        log("Already processing result, ignoring");
        return false;
      }

      isProcessingRef.current = true;

      try {
        // Валидация, если задана
        if (validatorRef.current) {
          const isValid = validatorRef.current(qrText);
          log("Validation result:", isValid);

          if (!isValid) {
            if (errorMessageRef.current && window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(errorMessageRef.current);
            }
            isProcessingRef.current = false;
            return false; // Не закрываем сканер
          }
        }

        // Очищаем таймаут
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Закрываем сканер
        closeQRScanner();

        // Вызываем колбэки
        onSuccessRef.current?.(qrText);
        if (resolveRef.current) {
          resolveRef.current(qrText);
        }

        // Очищаем состояние
        resolveRef.current = null;
        rejectRef.current = null;
        validatorRef.current = null;
        errorMessageRef.current = undefined;

        return true;
      } catch (error) {
        logError("Error in handleSuccess:", error);
        onError?.(error);
        return false;
      } finally {
        // Даем небольшую задержку перед сбросом флага обработки
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 100);
      }
    },
    [closeQRScanner, onError, log, logError]
  );

  // Event handlers
  useEffect(() => {
    const handleQRTextReceived = (eventData: { data?: string }) => {
      countersRef.current.event_qr += 1;
      log("QR Text Received Event:", eventData);

      if (eventData.data && isScanningRef.current) {
        handleSuccess(eventData.data);
      }
    };

    const handleScanQRPopupClosed = () => {
      log("QR Scanner Popup Closed Event");

      isScanningRef.current = false;
      isProcessingRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Если есть активный Promise, отклоняем его
      if (resolveRef.current && rejectRef.current) {
        rejectRef.current(new Error("QR Scanner closed by user"));
        resolveRef.current = null;
        rejectRef.current = null;
      }

      // Очищаем состояние
      validatorRef.current = null;
      errorMessageRef.current = undefined;
    };

    if (window.Telegram?.WebApp?.onEvent) {
      const webApp = window.Telegram.WebApp as any;

      // Подписываемся на события
      webApp.onEvent("qrTextReceived", handleQRTextReceived);
      webApp.onEvent("qr_text_received", handleQRTextReceived);
      webApp.onEvent("scanQrPopupClosed", handleScanQRPopupClosed);
      webApp.onEvent("scan_qr_popup_closed", handleScanQRPopupClosed);
    }

    return () => {
      if (window.Telegram?.WebApp?.offEvent) {
        const webApp = window.Telegram.WebApp as any;

        webApp.offEvent("qrTextReceived", handleQRTextReceived);
        webApp.offEvent("qr_text_received", handleQRTextReceived);
        webApp.offEvent("scanQrPopupClosed", handleScanQRPopupClosed);
        webApp.offEvent("scan_qr_popup_closed", handleScanQRPopupClosed);
      }
    };
  }, [handleSuccess, log]);

  const scanQR = useCallback(async (): Promise<string | null> => {
    try {
      log("Starting QR scan");

      const isAvailable =
        typeof window.Telegram?.WebApp?.showScanQrPopup === "function";

      if (!isAvailable) {
        const error = new Error("QR Scanner is not available");
        onError?.(error);
        return null;
      }

      if (isScanningRef.current) {
        log("Scanner already active");
        return null;
      }

      isScanningRef.current = true;
      isProcessingRef.current = false;

      return new Promise((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;

        // Таймаут
        timeoutRef.current = window.setTimeout(() => {
          if (isScanningRef.current) {
            const error = new Error("QR Scanner timeout");
            countersRef.current.timeouts += 1;
            logError("Timeout reached");

            closeQRScanner();
            onError?.(error);
            reject(error);

            resolveRef.current = null;
            rejectRef.current = null;
          }
          timeoutRef.current = null;
        }, 30000);

        // Используем ТОЛЬКО callback, убираем дублирование логики
        window.Telegram.WebApp.showScanQrPopup({ text }, (qrText: string) => {
          countersRef.current.callbacks += 1;
          log("QR callback received:", qrText);

          // Используем общую функцию обработки
          const shouldClose = handleSuccess(qrText);
          return shouldClose; // Возвращаем true/false для закрытия
        });
      });
    } catch (error) {
      logError("QR Scanner error:", error);
      isScanningRef.current = false;
      isProcessingRef.current = false;
      onError?.(error);
      return null;
    }
  }, [onError, text, handleSuccess, closeQRScanner, log, logError]);

  const scanQRWithValidation = useCallback(
    async (
      validator: (qr: string) => boolean,
      errorMessage?: string
    ): Promise<string | null> => {
      // Устанавливаем валидатор перед сканированием
      validatorRef.current = validator;
      errorMessageRef.current = errorMessage;

      return scanQR();
    },
    [scanQR]
  );

  const isAvailable =
    typeof window.Telegram?.WebApp?.showScanQrPopup === "function";

  return {
    scanQR,
    scanQRWithValidation,
    closeQRScanner,
    isAvailable,
    isOpened: isScanningRef.current,
  };
};
