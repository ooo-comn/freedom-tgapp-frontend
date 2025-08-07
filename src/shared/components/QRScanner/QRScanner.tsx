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
      let qrResultReceived = false;

      // Обработчик для события qr_text_received
      const handleQrEvent = (event: any) => {
        if (qrResultReceived) return;

        const result = event?.data || event?.detail?.data;
        if (result) {
          qrResultReceived = true;
          console.log("QR result received:", result);

          // Закрываем сканер
          if (typeof webApp.closeScanQrPopup === "function") {
            webApp.closeScanQrPopup();
          }

          // Вызываем callback
          onScanSuccess(result);
          onClose();
        }
      };

      // Слушаем событие qr_text_received
      window.addEventListener("qr_text_received", handleQrEvent);

      // Слушаем все сообщения
      const messageHandler = (event: any) => {
        if (qrResultReceived) return;

        if (event.data && event.data.type === "qr_text_received") {
          handleQrEvent(event.data);
        }
      };
      window.addEventListener("message", messageHandler);

      if (typeof webApp.showScanQrPopup === "function") {
        try {
          webApp.showScanQrPopup({
            text: "Наведите камеру на QR-код для оплаты",
            onResult: (result: string) => {
              if (qrResultReceived) return;
              qrResultReceived = true;

              if (typeof webApp.closeScanQrPopup === "function") {
                webApp.closeScanQrPopup();
              }
              onScanSuccess(result);
              onClose();
            },
            onError: (error: any) => {
              if (typeof webApp.closeScanQrPopup === "function") {
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

          // Автоматически закрываем сканер через 30 секунд
          const timeout = setTimeout(() => {
            if (!qrResultReceived) {
              if (typeof webApp.closeScanQrPopup === "function") {
                webApp.closeScanQrPopup();
              }
              if (typeof webApp.showAlert === "function") {
                webApp.showAlert("Время ожидания истекло. Попробуйте еще раз.");
              }
              onClose();
            }
          }, 30000);

          return () => {
            clearTimeout(timeout);
            window.removeEventListener("qr_text_received", handleQrEvent);
            window.removeEventListener("message", messageHandler);
          };
        } catch (error) {
          if (typeof webApp.showAlert === "function") {
            webApp.showAlert(
              "Ошибка при открытии QR-сканера. Попробуйте еще раз."
            );
          }
          onClose();
        }
      } else {
        if (typeof webApp.showAlert === "function") {
          webApp.showAlert(
            "QR-сканер недоступен. Используйте Telegram для Android/iOS."
          );
        }
        onClose();
      }
    } else {
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
