import { FC, useEffect } from "react";
import styles from "./QRScanner.module.css";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner: FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    // Проверяем, что Telegram WebApp доступен
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      // Логируем доступные методы для отладки
      console.log("Available WebApp methods:", Object.keys(webApp));
      console.log("WebApp object:", webApp);

      // Попробуем прямой вызов showScanQrPopup без requestCameraAccess
      if (typeof webApp.showScanQrPopup === "function") {
        try {
          webApp.showScanQrPopup({
            text: "Наведите камеру на QR-код для оплаты",
            onResult: (result: string) => {
              console.log("QR Code detected:", result);
              onScanSuccess(result);
            },
            onError: (error: any) => {
              console.log("QR scan error:", error);
              if ("showAlert" in webApp) {
                (webApp as any).showAlert("Ошибка сканирования QR-кода");
              }
            },
          });
        } catch (error) {
          console.error("Error calling showScanQrPopup:", error);
          if ("showAlert" in webApp) {
            (webApp as any).showAlert("Ошибка при открытии QR-сканера");
          }
          onClose();
        }
      } else {
        // Fallback если showScanQrPopup недоступен
        console.error("showScanQrPopup method not available");
        console.log("Available methods:", Object.getOwnPropertyNames(webApp));

        if ("showAlert" in webApp) {
          (webApp as any).showAlert(
            "QR-сканер недоступен. Попробуйте обновить Telegram до последней версии."
          );
        }
        onClose();
      }
    } else {
      // Fallback для случаев, когда Telegram WebApp недоступен
      console.error("Telegram WebApp not available");
      onClose();
    }
  }, [onScanSuccess, onClose]);

  const handleClose = () => {
    // Закрываем QR-сканер если он открыт
    if (
      window.Telegram?.WebApp &&
      "closeScanQrPopup" in window.Telegram.WebApp
    ) {
      (window.Telegram.WebApp as any).closeScanQrPopup();
    }
    onClose();
  };

  return (
    <div className={styles["qr-scanner"]}>
      <div className={styles["qr-scanner__header"]}>
        <button className={styles["qr-scanner__close"]} onClick={handleClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className={styles["qr-scanner__title"]}>Сканировать QR-код</h2>
      </div>

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
