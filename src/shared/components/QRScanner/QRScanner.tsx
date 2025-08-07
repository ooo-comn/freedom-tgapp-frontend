import { FC, useEffect, useState, useCallback } from "react";
import styles from "./QRScanner.module.css";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner: FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.history.back();
  });

  // Обработчик события qr_text_received
  const handleQrTextReceived = useCallback(
    (event: any) => {
      const result = event?.data;
      if (result) {
        const webApp = window.Telegram.WebApp;
        if (typeof webApp.closeScanQrPopup === "function") {
          webApp.closeScanQrPopup();
        }
        onScanSuccess(result);
        onClose();
      }
    },
    [onScanSuccess, onClose]
  );

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
          console.log("Opening QR scanner...");
          webApp.showScanQrPopup({
            text: "Наведите камеру на QR-код для оплаты",
            onResult: (result: string) => {
              console.log("QR Code detected:", result);
              console.log("Result type:", typeof result);
              console.log("Result length:", result.length);

              // Закрываем сканер после успешного сканирования
              if (typeof webApp.closeScanQrPopup === "function") {
                webApp.closeScanQrPopup();
              }

              // Вызываем callback с результатом
              onScanSuccess(result);
              onClose();
            },
            onError: (error: any) => {
              console.log("QR scan error:", error);
              console.error("Error details:", error);

              // Закрываем сканер при ошибке
              if (typeof webApp.closeScanQrPopup === "function") {
                webApp.closeScanQrPopup();
              }

              if ("showAlert" in webApp) {
                (webApp as any).showAlert(
                  "Ошибка сканирования QR-кода: " + (error?.message || error)
                );
              }
              onClose();
            },
          });
          console.log("QR scanner opened successfully");
          // Скрываем наш компонент после открытия нативного сканера
          setIsScannerOpen(true);
        } catch (error) {
          console.error("Error calling showScanQrPopup:", error);
          if ("showAlert" in webApp) {
            (webApp as any).showAlert(
              "Ошибка при открытии QR-сканера: " + (error?.message || error)
            );
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

      // Добавляем обработчик события qr_text_received
      if (typeof webApp.onEvent === "function") {
        (webApp as any).onEvent("qr_text_received", handleQrTextReceived);
      }

      // Очистка обработчика при размонтировании
      return () => {
        if (typeof webApp.offEvent === "function") {
          (webApp as any).offEvent("qr_text_received", handleQrTextReceived);
        }
      };
    } else {
      // Fallback для случаев, когда Telegram WebApp недоступен
      console.error("Telegram WebApp not available");
      onClose();
    }
  }, [onScanSuccess, onClose, handleQrTextReceived]);

  // Не показываем компонент, если нативный сканер открыт
  if (isScannerOpen) {
    return null;
  }

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
