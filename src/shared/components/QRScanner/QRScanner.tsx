import { FC, useEffect } from "react";
import styles from "./QRScanner.module.css";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner: FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      console.log("=== QR Scanner Debug Info ===");
      console.log("WebApp version:", (webApp as any).version);
      console.log("Platform:", (webApp as any).platform);
      console.log("Available methods:", Object.keys(webApp));
      console.log(
        "showScanQrPopup available:",
        typeof webApp.showScanQrPopup === "function"
      );
      console.log(
        "closeScanQrPopup available:",
        typeof webApp.closeScanQrPopup === "function"
      );
      console.log(
        "showAlert available:",
        typeof webApp.showAlert === "function"
      );

      if (typeof webApp.showScanQrPopup === "function") {
        try {
          console.log("Calling showScanQrPopup...");
          const result = webApp.showScanQrPopup({
            text: "Наведите камеру на QR-код для оплаты",
            onResult: (result: string) => {
              console.log("=== QR Scanner onResult called ===");
              console.log("Result:", result);
              console.log("Result type:", typeof result);
              console.log("Result length:", result.length);

              if (typeof webApp.closeScanQrPopup === "function") {
                console.log("Calling closeScanQrPopup...");
                webApp.closeScanQrPopup();
              }
              onScanSuccess(result);
              onClose();
            },
            onError: (error: any) => {
              console.log("=== QR Scanner onError called ===");
              console.log("Error:", error);
              console.log("Error type:", typeof error);

              if (typeof webApp.closeScanQrPopup === "function") {
                console.log("Calling closeScanQrPopup from error...");
                webApp.closeScanQrPopup();
              }
              if (typeof webApp.showAlert === "function") {
                webApp.showAlert(
                  "Ошибка сканирования QR-кода. Попробуйте еще раз."
                );
              }
              onClose();
            },
          });
          console.log("showScanQrPopup result:", result);
        } catch (error) {
          console.log("=== QR Scanner Exception ===");
          console.log("Exception:", error);
          console.log("Exception type:", typeof error);

          if (typeof webApp.showAlert === "function") {
            webApp.showAlert(
              "Ошибка при открытии QR-сканера. Попробуйте еще раз."
            );
          }
          onClose();
        }
      } else {
        console.log("showScanQrPopup method not available!");
        if (typeof webApp.showAlert === "function") {
          webApp.showAlert("QR-сканер недоступен в данной версии Telegram.");
        }
        onClose();
      }
    } else {
      console.log("Telegram WebApp not available!");
      onClose();
    }
  }, [onScanSuccess, onClose]);

  return (
    <div className={styles["qr-scanner"]}>
      <div className={styles["qr-scanner__content"]}>
        <div className={styles["qr-scanner__placeholder"]}>
          <div className={styles["qr-scanner__loading"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className={styles["qr-scanner__loading-icon"]}
            >
              <path
                d="M3 9h6v11H3V9zM9 3h6v17H9V3zM15 9h6v11h-6V9z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={styles["qr-scanner__loading-text"]}>
              Открываем сканер QR-кода...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
