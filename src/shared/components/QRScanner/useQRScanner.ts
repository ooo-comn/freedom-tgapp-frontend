import { useCallback } from "react";
import { qrScanner } from "@telegram-apps/sdk";

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
      console.log("qrScanner object:", qrScanner);
      console.log("qrScanner.open:", qrScanner.open);
      console.log("qrScanner.open.isAvailable:", qrScanner.open.isAvailable);
      console.log("qrScanner.isOpened:", qrScanner.isOpened);

      // Проверяем доступность нового QR сканера
      let isNewAvailable = false;
      try {
        isNewAvailable = qrScanner.open.isAvailable();
        console.log("New QR Scanner isAvailable:", isNewAvailable);
      } catch (error) {
        console.log("Error checking new QR scanner availability:", error);
        isNewAvailable = false;
      }

      // Проверяем доступность старого QR сканера
      const isOldAvailable =
        typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
      console.log("Old QR Scanner isAvailable:", isOldAvailable);

      if (isNewAvailable) {
        // Используем новый QR сканер
        console.log("Using new QR scanner...");
        try {
          const result = await qrScanner.open({ text });
          console.log("New QR Scanner result:", result);

          if (result) {
            onSuccess?.(result);
            return result;
          }
        } catch (newScannerError) {
          console.error("New QR scanner error:", newScannerError);
          // Если новый сканер упал, пробуем старый
          if (isOldAvailable) {
            console.log("Falling back to old QR scanner due to error...");
            return new Promise((resolve, reject) => {
              window.Telegram.WebApp.showScanQrPopup({
                text,
                onResult: (result: string) => {
                  console.log("Old QR Scanner result (fallback):", result);
                  onSuccess?.(result);
                  resolve(result);
                },
                onError: (error: any) => {
                  console.log("Old QR Scanner error (fallback):", error);
                  onError?.(error);
                  reject(error);
                },
              });
            });
          }
        }
      } else if (isOldAvailable) {
        // Fallback на старый QR сканер
        console.log("Using old QR scanner as fallback...");
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

      return null;
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

        // Проверяем доступность нового QR сканера
        const isNewAvailable = qrScanner.open.isAvailable();
        console.log("New QR Scanner isAvailable:", isNewAvailable);

        // Проверяем доступность старого QR сканера
        const isOldAvailable =
          typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
        console.log("Old QR Scanner isAvailable:", isOldAvailable);

        if (isNewAvailable) {
          // Используем новый QR сканер с валидацией
          console.log("Using new QR scanner with validation...");
          const result = await qrScanner.open({
            text,
            capture: (qr) => {
              console.log("QR captured:", qr);
              const isValid = validator(qr);
              console.log("QR validation result:", isValid);

              if (
                !isValid &&
                errorMessage &&
                window.Telegram?.WebApp?.showAlert
              ) {
                window.Telegram.WebApp.showAlert(errorMessage);
              }
              return isValid;
            },
          });

          if (result) {
            onSuccess?.(result);
            return result;
          }
        } else if (isOldAvailable) {
          // Fallback на старый QR сканер с валидацией
          console.log("Using old QR scanner with validation as fallback...");
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

        return null;
      } catch (error) {
        console.error("QR Scanner validation error:", error);
        onError?.(error);
        return null;
      }
    },
    [onSuccess, onError, text]
  );

  // Проверяем доступность при инициализации хука
  let isNewAvailable = false;
  try {
    isNewAvailable = qrScanner.open.isAvailable();
  } catch (error) {
    console.log("Error checking new QR scanner availability in hook:", error);
    isNewAvailable = false;
  }

  const isOldAvailable =
    typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
  const isAvailable = isNewAvailable || isOldAvailable;

  let isOpened = false;
  try {
    isOpened = qrScanner.isOpened();
  } catch (error) {
    console.log("Error checking QR scanner opened state:", error);
    isOpened = false;
  }

  console.log("=== useQRScanner Hook Debug ===");
  console.log("isNewAvailable:", isNewAvailable);
  console.log("isOldAvailable:", isOldAvailable);
  console.log("isAvailable:", isAvailable);
  console.log("isOpened:", isOpened);
  console.log("qrScanner object exists:", !!qrScanner);
  console.log("qrScanner.open exists:", !!qrScanner.open);
  console.log(
    "qrScanner.open.isAvailable exists:",
    !!qrScanner.open.isAvailable
  );

  return {
    scanQR,
    scanQRWithValidation,
    isAvailable,
    isOpened,
    isNewAvailable,
    isOldAvailable,
  };
};
