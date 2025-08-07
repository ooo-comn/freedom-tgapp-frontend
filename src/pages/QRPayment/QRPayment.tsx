import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRScanner from "src/shared/components/QRScanner";
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

  const handleScanSuccess = (result: string) => {
    console.log("QR Code scanned:", result);
    console.log("QR Data type:", typeof result);
    console.log("QR Data length:", result.length);
    console.log("Setting QR data and showing purchase form...");

    setQrData(result);
    setShowScanner(false);
    setShowPurchaseForm(true);

    console.log(
      "State updated - scanner closed, purchase form should be visible"
    );
  };

  const handleScannerClose = () => {
    setShowScanner(false);
    // Здесь можно добавить навигацию назад
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
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={handleScannerClose}
        />
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
