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
  const [scanSuccessful, setScanSuccessful] = useState(false);

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.location.href = "/";
  });

  const { scanQR, isAvailable, isOpened, closeQRScanner } = useQRScanner({
    onSuccess: (result) => {
      console.log("QR Code scanned:", result);
      console.log("QR Data type:", typeof result);
      console.log("QR Data length:", result.length);
      console.log("Setting QR data and showing purchase form...");

      setScanSuccessful(true);
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
    onClose: () => {
      console.log("QR Scanner closed by user");
      // Если сканер закрылся пользователем без успешного сканирования,
      // возвращаемся на главную страницу
      if (!scanSuccessful) {
        console.log(
          "Scanner closed without successful scan, navigating to main page..."
        );
        window.location.href = "/";
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

      setScanSuccessful(true);
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

      // Если сканер закрылся без успешного сканирования,
      // возвращаемся на главную страницу
      if (!scanSuccessful) {
        console.log(
          "Scanner closed without successful scan, navigating to main page..."
        );
        window.location.href = "/";
      }
    }

    // Если сканер открылся в хуке, но локальное состояние показывает его закрытым
    if (isOpened && !showScanner) {
      console.log("Scanner opened in hook, updating local state...");
      setShowScanner(true);
    }
  }, [isOpened, showScanner, scanSuccessful]);

  const handlePurchaseFormClose = () => {
    setShowPurchaseForm(false);
    setShowScanner(true);
    setScanSuccessful(false);
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
    setScanSuccessful(false);
  };

  return (
    <div className={styles["qr-payment"]}>
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
