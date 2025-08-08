import { useCallback, useEffect, useRef } from "react";

interface UseQRScannerOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: any) => void;
  text?: string;
}

export const useQRScanner = (options: UseQRScannerOptions = {}) => {
  const { onSuccess, onError, text = "Наведите камеру на QR-код" } = options;
  const isScanningRef = useRef(false);

  // Обработка событий QR сканера
  useEffect(() => {
    const handleQRTextReceived = (eventData: any) => {
      console.log("Event data:", eventData);

      if (eventData.data && isScanningRef.current) {
        console.log("QR Code scanned via event:", eventData.data);
        isScanningRef.current = false;
        onSuccess?.(eventData.data);
      }
    };

    const handleScanQRPopupClosed = () => {
      console.log("=== QR Scanner Popup Closed Event ===");
      isScanningRef.current = false;
    };

    const handleTelegramEvent = (eventType: string, eventData: any) => {
      switch (eventType) {
        case "qr_text_received":
          handleQRTextReceived(eventData);
          break;
        case "scan_qr_popup_closed":
          handleScanQRPopupClosed();
          break;
      }
    };

    const setupEventListeners = () => {
      const handleWebMessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === "string") {
            const { eventType, eventData } = JSON.parse(event.data);
            handleTelegramEvent(eventType, eventData);
          }
        } catch (error) {
          // ignore
        }
      };

      // Для Desktop, Mobile и Windows Phone
      const setupNativeEventListeners = () => {
        // Telegram Desktop
        if ((window.Telegram as any)?.GameProxy?.receiveEvent) {
          (window.Telegram as any).GameProxy.receiveEvent = handleTelegramEvent;
        }

        // Telegram for iOS and Android
        if ((window.Telegram as any)?.WebView?.receiveEvent) {
          (window.Telegram as any).WebView.receiveEvent = handleTelegramEvent;
        }

        // Windows Phone
        if ((window as any).TelegramGameProxy_receiveEvent) {
          (window as any).TelegramGameProxy_receiveEvent = handleTelegramEvent;
        }
      };

      // Добавляем слушатель для Web версии
      window.addEventListener("message", handleWebMessage);

      // Настраиваем слушатели для нативных версий
      setupNativeEventListeners();

      console.log("QR Scanner event listeners setup completed");

      // Очистка при размонтировании
      return () => {
        window.removeEventListener("message", handleWebMessage);
      };
    };

    setupEventListeners();
  }, [onSuccess]);

  // Функция для нативного закрытия QR сканера
  const closeQRScanner = useCallback(() => {
    console.log("=== Closing QR Scanner Natively ===");

    try {
      // Проверяем доступность API для закрытия
      if (typeof window.Telegram?.WebApp?.closeScanQrPopup === "function") {
        console.log("Using closeScanQrPopup API...");
        window.Telegram.WebApp.closeScanQrPopup();
        isScanningRef.current = false;
        console.log("QR Scanner closed via closeScanQrPopup");
      } else if (typeof window.Telegram?.WebApp?.close === "function") {
        console.log("Using close API as fallback...");
        window.Telegram.WebApp.close();
        isScanningRef.current = false;
        console.log("QR Scanner closed via close API");
      } else {
        console.log("No native close API available, setting flag to false");
        isScanningRef.current = false;
      }
    } catch (error) {
      console.error("Error closing QR scanner:", error);
      isScanningRef.current = false;
    }
  }, []);

  const scanQR = useCallback(async (): Promise<string | null> => {
    try {
      console.log("=== QR Scanner Debug ===");

      // Проверяем доступность старого QR сканера
      const isOldAvailable =
        typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
      console.log("Old QR Scanner isAvailable:", isOldAvailable);

      if (isOldAvailable) {
        // Используем старый QR сканер
        console.log("Using old QR scanner...");
        isScanningRef.current = true;

        return new Promise((resolve, reject) => {
          window.Telegram.WebApp.showScanQrPopup({
            text,
            onResult: (result: string) => {
              console.log("Old QR Scanner result:", result);
              isScanningRef.current = false;

              // Нативно закрываем QR сканер после получения результата
              closeQRScanner();

              onSuccess?.(result);
              resolve(result);
            },
            onError: (error: any) => {
              console.log("Old QR Scanner error:", error);
              isScanningRef.current = false;

              // Нативно закрываем QR сканер при ошибке
              closeQRScanner();

              onError?.(error);
              reject(error);
            },
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

        // Проверяем доступность старого QR сканера
        const isOldAvailable =
          typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
        console.log("Old QR Scanner isAvailable:", isOldAvailable);

        if (isOldAvailable) {
          // Используем старый QR сканер с валидацией
          console.log("Using old QR scanner with validation...");
          isScanningRef.current = true;

          return new Promise((resolve, reject) => {
            window.Telegram.WebApp.showScanQrPopup({
              text,
              onResult: (result: string) => {
                console.log("Old QR Scanner result:", result);
                const isValid = validator(result);
                console.log("Old QR validation result:", isValid);

                if (isValid) {
                  isScanningRef.current = false;

                  // Нативно закрываем QR сканер после успешной валидации
                  closeQRScanner();

                  onSuccess?.(result);
                  resolve(result);
                } else {
                  isScanningRef.current = false;

                  // Нативно закрываем QR сканер при неудачной валидации
                  closeQRScanner();

                  if (errorMessage && window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert(errorMessage);
                  }
                  reject(new Error("QR validation failed"));
                }
              },
              onError: (error: any) => {
                console.log("Old QR Scanner error:", error);
                isScanningRef.current = false;

                // Нативно закрываем QR сканер при ошибке
                closeQRScanner();

                onError?.(error);
                reject(error);
              },
            });
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
  const isOldAvailable =
    typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
  const isAvailable = isOldAvailable;

  console.log("=== useQRScanner Hook Debug ===");
  console.log("isOldAvailable:", isOldAvailable);
  console.log("isAvailable:", isAvailable);
  console.log("isScanning:", isScanningRef.current);

  return {
    scanQR,
    scanQRWithValidation,
    closeQRScanner,
    isAvailable,
    isOpened: isScanningRef.current,
    isNewAvailable: false,
    isOldAvailable,
  };
};
