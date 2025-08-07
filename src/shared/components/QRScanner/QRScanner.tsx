import { FC, useEffect } from "react";
import { qrScanner } from "@telegram-apps/sdk";
import styles from "./QRScanner.module.css";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner: FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    const openQRScanner = async () => {
      try {
        console.log("=== QR Scanner Debug Info ===");
        console.log("QR Scanner available:", qrScanner.open.isAvailable());
        console.log("QR Scanner is opened:", qrScanner.isOpened());

        if (!qrScanner.open.isAvailable()) {
          console.log("QR Scanner is not available!");
          onClose();
          return;
        }

        console.log("Opening QR Scanner...");

        // Вариант 1: Promise стиль (простой)
        const result = await qrScanner.open({
          text: "Наведите камеру на QR-код для оплаты",
        });

        console.log("=== QR Scanner Result ===");
        console.log("Result:", result);
        console.log("Result type:", typeof result);

        if (result) {
          onScanSuccess(result);
        }

        onClose();
      } catch (error) {
        console.log("=== QR Scanner Error ===");
        console.log("Error:", error);
        console.log("Error type:", typeof error);

        // Показываем ошибку пользователю
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(
            "Ошибка сканирования QR-кода. Попробуйте еще раз."
          );
        }

        onClose();
      }
    };

    // Альтернативный вариант с callback стилем (для более детального контроля)
    const openQRScannerWithCallback = () => {
      if (!qrScanner.open.isAvailable()) {
        console.log("QR Scanner is not available!");
        onClose();
        return;
      }

      console.log("Opening QR Scanner with callback...");

      qrScanner
        .open({
          text: "Наведите камеру на QR-код для оплаты",
          onCaptured: (qr) => {
            console.log("=== QR Scanner onCaptured ===");
            console.log("QR content:", qr);

            // Можно добавить валидацию QR кода здесь
            if (qr && qr.length > 0) {
              qrScanner.close();
              onScanSuccess(qr);
              onClose();
            }
          },
        })
        .catch((error) => {
          console.log("=== QR Scanner Callback Error ===");
          console.log("Error:", error);

          if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(
              "Ошибка сканирования QR-кода. Попробуйте еще раз."
            );
          }

          onClose();
        });
    };

    // Используем Promise стиль по умолчанию
    openQRScanner();

    // Раскомментируйте строку ниже, если хотите использовать callback стиль
    // openQRScannerWithCallback();
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
