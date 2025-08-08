import { FC, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQRScanner } from "src/shared/components/QRScanner";
import PurchaseForm, {
  PurchaseFormData,
} from "src/shared/components/PurchaseForm";
import ModalNotification from "src/shared/components/ModalNotification/ModalNotification";
import styles from "./QRPayment.module.css";

const QRPayment: FC = () => {
  const [showScanner, setShowScanner] = useState(true);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [qrData, setQrData] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { scanQR, isAvailable, isOpened, closeQRScanner } = useQRScanner({
    onSuccess: (result) => {
      console.log("QR Code scanned:", result);
      console.log("QR Data type:", typeof result);
      console.log("QR Data length:", result.length);
      console.log("Setting QR data and showing purchase form...");

      setQrData(result);
      setShowScanner(false);
      setShowPurchaseForm(true);

      // Дополнительно закрываем сканер нативно (на случай если он еще открыт)
      if (isOpened) {
        console.log("Closing scanner natively after successful scan...");
        closeQRScanner();
      }

      console.log(
        "State updated - scanner closed, purchase form should be visible"
      );
    },
    onError: (error) => {
      console.error("QR Scanner error:", error);
      // Показываем ошибку пользователю
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(
          "Ошибка сканирования QR-кода. Попробуйте еще раз."
        );
      }
    },
    text: "Наведите камеру на QR-код для оплаты",
  });

  const handleScanSuccess = useCallback(
    (result: string) => {
      console.log("QR Code scanned:", result);
      console.log("QR Data type:", typeof result);
      console.log("QR Data length:", result.length);
      console.log("Setting QR data and showing purchase form...");

      setQrData(result);
      setShowScanner(false);
      setShowPurchaseForm(true);

      // Дополнительно закрываем сканер нативно (на случай если он еще открыт)
      if (isOpened) {
        console.log("Closing scanner natively after successful scan...");
        closeQRScanner();
      }

      console.log(
        "State updated - scanner closed, purchase form should be visible"
      );
    },
    [isOpened, closeQRScanner]
  );

  const handleManualScan = useCallback(async () => {
    if (isAvailable) {
      console.log("Starting QR scan...");
      const result = await scanQR();
      if (result) {
        handleScanSuccess(result);
      }
    } else {
      console.log("QR Scanner is not available");
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(
          "QR сканер недоступен в данной версии Telegram."
        );
      }
    }
  }, [isAvailable, scanQR, handleScanSuccess]);

  // Автоматически открываем QR сканер при загрузке страницы
  useEffect(() => {
    if (isAvailable && showScanner) {
      console.log("Auto-opening QR scanner...");
      handleManualScan();
    }
  }, [isAvailable, showScanner, handleManualScan]);

  // Синхронизируем состояние сканера с isOpened из хука
  useEffect(() => {
    console.log(
      "Scanner state sync - isOpened:",
      isOpened,
      "showScanner:",
      showScanner
    );

    // Если сканер закрылся в хуке, но локальное состояние все еще показывает его открытым
    if (!isOpened && showScanner) {
      console.log("Scanner closed in hook, updating local state...");
      setShowScanner(false);
    }

    // Если сканер открылся в хуке, но локальное состояние показывает его закрытым
    if (isOpened && !showScanner) {
      console.log("Scanner opened in hook, updating local state...");
      setShowScanner(true);
    }
  }, [isOpened, showScanner]);

  const handleScannerClose = () => {
    console.log("Manual scanner close - isOpened:", isOpened);
    setShowScanner(false);

    // Нативно закрываем QR сканер если он открыт
    if (isOpened) {
      console.log("Scanner is still opened in hook, closing natively...");
      closeQRScanner();
    }

    window.history.back();
  };

  const handlePurchaseFormClose = () => {
    setShowPurchaseForm(false);
    setShowScanner(true);
  };

  const handlePurchaseSubmit = (data: PurchaseFormData) => {
    console.log("Purchase submitted:", data);
    setShowPurchaseForm(false);
    setShowSuccessModal(true);

    // Здесь можно добавить логику отправки данных на сервер
    // и обработки платежа
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setShowScanner(true);
  };

  return (
    <div className={styles["qr-payment"]}>
      {showScanner && (
        <div className={styles["qr-scanner-container"]}>
          {isAvailable ? (
            <div className={styles["qr-scanner-placeholder"]}>
              <div className={styles["qr-scanner-content"]}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginBottom: "20px" }}
                >
                  <path
                    d="M3 9h6v11H3V9zM9 3h6v17H9V3zM15 9h6v11h-6V9z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>Открываем QR Сканер...</h3>
                <p>Пожалуйста, подождите</p>
                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}
                >
                  Состояние сканера: {isOpened ? "Открыт" : "Закрыт"}
                </p>
                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={handleManualScan}
                    className={styles["scan-button"]}
                  >
                    Открыть QR Сканер
                  </button>
                  {isOpened && (
                    <button
                      onClick={closeQRScanner}
                      style={{
                        marginLeft: "10px",
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Принудительно закрыть
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["qr-scanner-placeholder"]}>
              <div className={styles["qr-scanner-content"]}>
                <h3>QR Сканер недоступен</h3>
                <p>QR сканер недоступен в данной версии Telegram.</p>
                <button
                  onClick={handleScannerClose}
                  className={styles["back-button"]}
                >
                  Назад
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showPurchaseForm && (
          <motion.div
            className={styles["purchase-form-overlay"]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handlePurchaseFormClose}
          >
            <motion.div
              className={styles["purchase-form-container"]}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.5,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <PurchaseForm
                qrData={qrData}
                onClose={handlePurchaseFormClose}
                onSubmit={handlePurchaseSubmit}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className={styles["success-modal-overlay"]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleSuccessModalClose}
          >
            <motion.div
              className={styles["success-modal-container"]}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalNotification
                title="Успешно!"
                text="Заказ успешно оформлен"
                onClose={handleSuccessModalClose}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRPayment;
