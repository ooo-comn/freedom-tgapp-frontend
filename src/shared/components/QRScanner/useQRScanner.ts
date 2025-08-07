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
      if (!qrScanner.open.isAvailable()) {
        const error = new Error("QR Scanner is not available");
        onError?.(error);
        return null;
      }

      const result = await qrScanner.open({ text });

      if (result) {
        onSuccess?.(result);
        return result;
      }

      return null;
    } catch (error) {
      console.error("QR Scanner error:", error);
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
        if (!qrScanner.open.isAvailable()) {
          const error = new Error("QR Scanner is not available");
          onError?.(error);
          return null;
        }

        const result = await qrScanner.open({
          text,
          capture: (qr) => {
            const isValid = validator(qr);
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

        return null;
      } catch (error) {
        console.error("QR Scanner error:", error);
        onError?.(error);
        return null;
      }
    },
    [onSuccess, onError, text]
  );

  return {
    scanQR,
    scanQRWithValidation,
    isAvailable: qrScanner.open.isAvailable(),
    isOpened: qrScanner.isOpened(),
  };
};
