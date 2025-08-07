import { useCallback } from "react";

interface UseQRScannerOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: any) => void;
  text?: string;
}

export const useQRScanner = (options: UseQRScannerOptions = {}) => {
  const { onSuccess, onError, text = "Наведите камеру на QR-код" } = options;

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
        return new Promise((resolve, reject) => {
          window.Telegram.WebApp.showScanQrPopup({
            text,
            onResult: (result: string) => {
              console.log("Old QR Scanner result:", result);
              onSuccess?.(result);
              resolve(result);
            },
            onError: (error: any) => {
              console.log("Old QR Scanner error:", error);
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
      onError?.(error);
      return null;
    }
  }, [onSuccess, onError, text]);

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
          return new Promise((resolve, reject) => {
            window.Telegram.WebApp.showScanQrPopup({
              text,
              onResult: (result: string) => {
                console.log("Old QR Scanner result:", result);
                const isValid = validator(result);
                console.log("Old QR validation result:", isValid);

                if (isValid) {
                  onSuccess?.(result);
                  resolve(result);
                } else {
                  if (errorMessage && window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert(errorMessage);
                  }
                  reject(new Error("QR validation failed"));
                }
              },
              onError: (error: any) => {
                console.log("Old QR Scanner error:", error);
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
        onError?.(error);
        return null;
      }
    },
    [onSuccess, onError, text]
  );

  // Проверяем доступность при инициализации хука
  const isOldAvailable =
    typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
  const isAvailable = isOldAvailable;

  console.log("=== useQRScanner Hook Debug ===");
  console.log("isOldAvailable:", isOldAvailable);
  console.log("isAvailable:", isAvailable);

  return {
    scanQR,
    scanQRWithValidation,
    isAvailable,
    isOpened: false, // Старый API не предоставляет эту информацию
    isNewAvailable: false, // Новый SDK отключен
    isOldAvailable,
  };
};
