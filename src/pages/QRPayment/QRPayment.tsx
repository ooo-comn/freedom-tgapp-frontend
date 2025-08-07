import { FC, useState } from "react";
import QRScanner from "src/shared/components/QRScanner";
import PurchaseForm, {
  PurchaseFormData,
} from "src/shared/components/PurchaseForm";
import BottomSheet from "src/shared/components/BottomSheet/BottomSheet";
import ModalNotification from "src/shared/components/ModalNotification/ModalNotification";
import styles from "./QRPayment.module.css";

const QRPayment: FC = () => {
  const [showScanner, setShowScanner] = useState(true);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [qrData, setQrData] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleScanSuccess = (result: string) => {
    console.log("QR Code scanned:", result);
    setQrData(result);
    setShowScanner(false);
    setShowPurchaseForm(true);
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

      {showPurchaseForm && (
        <BottomSheet
          isOpen={showPurchaseForm}
          onClose={handlePurchaseFormClose}
        >
          <PurchaseForm
            qrData={qrData}
            onClose={handlePurchaseFormClose}
            onSubmit={handlePurchaseSubmit}
          />
        </BottomSheet>
      )}

      {showSuccessModal && (
        <ModalNotification
          title="Успешно!"
          text="Заказ успешно оформлен"
          onClose={handleSuccessModalClose}
        />
      )}
    </div>
  );
};

export default QRPayment;
