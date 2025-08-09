import { useCallback, useEffect, useRef } from "react";

interface UseQRScannerOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: any) => void;
  text?: string;
}

export const useQRScanner = (options: UseQRScannerOptions = {}) => {
  const { onSuccess, onError, text = "Наведите камеру на QR-код" } = options;
  const isScanningRef = useRef(false);
  const resolveRef = useRef<((value: string) => void) | null>(null);
  const rejectRef = useRef<((error: any) => void) | null>(null);

  // Функция для нативного закрытия QR сканера
  const closeQRScanner = useCallback(() => {
    console.log("=== Closing QR Scanner Natively ===");

    try {
      // Закрываем только попап сканера, не всё WebApp
      if (typeof window.Telegram?.WebApp?.closeScanQrPopup === "function") {
        console.log("Using closeScanQrPopup API...");
        window.Telegram.WebApp.closeScanQrPopup();
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
    const handleQRTextReceived = (eventData: any) => {
      console.log("=== QR Text Received Event in useQRScanner ===");
      console.log("Event data:", eventData);
      console.log("isScanningRef.current:", isScanningRef.current);

      if (eventData.data && isScanningRef.current) {
        console.log("QR Code scanned via event:", eventData.data);
        isScanningRef.current = false;

        // Вызываем callback и resolve Promise
        onSuccess?.(eventData.data);
        if (resolveRef.current) {
          resolveRef.current(eventData.data);
          resolveRef.current = null;
          rejectRef.current = null;
        }

        // Закрываем QR сканер после получения результата
        closeQRScanner();
      } else {
        console.log("QR event received but scanner is not active or no data");
      }
    };

    const handleScanQRPopupClosed = () => {
      console.log("=== QR Scanner Popup Closed Event ===");
      isScanningRef.current = false;

      // Очищаем ссылки на Promise
      if (resolveRef.current) {
        rejectRef.current?.(new Error("QR Scanner closed by user"));
        resolveRef.current = null;
        rejectRef.current = null;
      }
    };

    // Используем официальный Telegram.WebApp.onEvent API
    if (window.Telegram?.WebApp?.onEvent) {
      (window.Telegram.WebApp as any).onEvent(
        "qrTextReceived",
        handleQRTextReceived
      );
      (window.Telegram.WebApp as any).onEvent(
        "scanQrPopupClosed",
        handleScanQRPopupClosed
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
          "scanQrPopupClosed",
          handleScanQRPopupClosed
        );
      }
    };
  }, [onSuccess, closeQRScanner]);

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

          const timeout = setTimeout(() => {
            if (isScanningRef.current) {
              isScanningRef.current = false;
              closeQRScanner();
              const error = new Error("QR Scanner timeout");
              onError?.(error);
              reject(error);
              resolveRef.current = null;
              rejectRef.current = null;
            }
          }, 30000); // 30 секунд таймаут

          // Используем официальный API согласно документации
          window.Telegram.WebApp.showScanQrPopup({ text }, (result: string) => {
            clearTimeout(timeout);
            console.log("QR Scanner result:", result);
            isScanningRef.current = false;
            // Закрываем попап нативно (для совместимости разных платформ)
            closeQRScanner();
            onSuccess?.(result);
            resolve(result);
            resolveRef.current = null;
            rejectRef.current = null;
            return true; // Закрываем попап после получения результата
          });
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
  }, [onSuccess, onError, text, closeQRScanner]);

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
            // Сохраняем ссылки на resolve и reject
            resolveRef.current = resolve;
            rejectRef.current = reject;

            const timeout = setTimeout(() => {
              if (isScanningRef.current) {
                isScanningRef.current = false;
                closeQRScanner();
                const error = new Error("QR Scanner timeout");
                onError?.(error);
                reject(error);
                resolveRef.current = null;
                rejectRef.current = null;
              }
            }, 30000);

            window.Telegram.WebApp.showScanQrPopup(
              { text },
              (result: string) => {
                clearTimeout(timeout);
                console.log("QR Scanner result:", result);
                const isValid = validator(result);
                console.log("QR validation result:", isValid);

                if (isValid) {
                  isScanningRef.current = false;
                  // Закрываем попап при успешной валидации
                  onSuccess?.(result);
                  resolve(result);
                  resolveRef.current = null;
                  rejectRef.current = null;
                  return true; // Закрываем попап после успешной валидации
                } else {
                  isScanningRef.current = false;
                  if (errorMessage && window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert(errorMessage);
                  }
                  reject(new Error("QR validation failed"));
                  resolveRef.current = null;
                  rejectRef.current = null;
                  return false; // Не закрываем попап при неудачной валидации
                }
              }
            );
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
    [onSuccess, onError, text, closeQRScanner]
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
