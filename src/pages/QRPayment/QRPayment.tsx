import { FC, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQRScanner } from "src/shared/components/QRScanner";
import PurchaseForm, {
  PurchaseFormData,
} from "src/shared/components/PurchaseForm";
import ModalNotification from "src/shared/components/ModalNotification/ModalNotification";
import styles from "./QRPayment.module.css";

// Функция для отправки запроса на API
const sendPaymentRequest = async (initData: string, paymentLink: string) => {
  try {
    const response = await fetch("https://comnapp.ru/api/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        init_data: initData,
        payment_link: paymentLink,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Payment request error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

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

  const handleScanSuccess = useCallback((result: string) => {
    console.log("=== HANDLE SCAN SUCCESS ===");
    console.log("QR Code scanned:", result);
    console.log("QR Data type:", typeof result);
    console.log("QR Data length:", result.length);
    console.log("Setting QR data and showing purchase form...");

    setScanSuccessful(true);
    console.log("handleScanSuccess: scanSuccessful set to true");

    setQrData(result);
    console.log("handleScanSuccess: qrData set to", result);

    setShowScanner(false);
    console.log("handleScanSuccess: showScanner set to false");

    setShowPurchaseForm(true);
    console.log("handleScanSuccess: showPurchaseForm set to true");

    console.log(
      "State updated - scanner closed, purchase form should be visible"
    );
  }, []);

  const { scanQR, isAvailable } = useQRScanner({
    onSuccess: handleScanSuccess,
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

  const handleManualScan = useCallback(async () => {
    if (isAvailable) {
      console.log("Starting QR scan...");
      const result = await scanQR();
      console.log("scanQR result:", result);
      if (result) {
        console.log("Calling handleScanSuccess with result:", result);
        handleScanSuccess(result);
      } else {
        console.log("scanQR returned null/undefined");
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
    console.log(
      "useEffect triggered - isAvailable:",
      isAvailable,
      "showScanner:",
      showScanner
    );
    if (isAvailable && showScanner) {
      console.log("Auto-opening QR scanner...");
      handleManualScan();
    }
  }, [isAvailable, showScanner, handleManualScan]);

  // Простая обработка закрытия сканера без сканирования
  useEffect(() => {
    // Не запускаем таймаут, если сканирование уже успешно
    if (scanSuccessful) {
      console.log("Scan successful, skipping timeout");
      return;
    }

    console.log("Setting up scanner timeout...");
    const timer = setTimeout(() => {
      if (showScanner && !scanSuccessful) {
        console.log("Scanner timeout - navigating to main page...");
        window.location.href = "/";
      }
    }, 2000); // 2 секунды таймаут

    return () => {
      console.log("Clearing scanner timeout");
      clearTimeout(timer);
    };
  }, [showScanner, scanSuccessful]);

  const handlePurchaseFormClose = () => {
    setShowPurchaseForm(false);
    setShowScanner(true);
    setScanSuccessful(false);
  };

  const handlePurchaseSubmit = async (data: PurchaseFormData) => {
    console.log("Purchase submitted:", data);

    try {
      // Получаем init_data из Telegram WebApp
      const initData = window.Telegram?.WebApp?.initData || "";

      // Отправляем запрос на API
      const result = await sendPaymentRequest(initData, qrData);

      if (result.success) {
        console.log("Payment request successful:", result.data);
        setShowPurchaseForm(false);
        setShowSuccessModal(true);
      } else {
        console.error("Payment request failed:", result.error);
        // Показываем ошибку пользователю
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(
            `Ошибка при оформлении заказа: ${result.error}`
          );
        }
      }
    } catch (error) {
      console.error("Error in handlePurchaseSubmit:", error);
      // Показываем ошибку пользователю
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(
          "Произошла ошибка при оформлении заказа. Попробуйте еще раз."
        );
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setShowScanner(true);
    setScanSuccessful(false);
  };

  console.log(
    "Rendering - showPurchaseForm:",
    showPurchaseForm,
    "qrData:",
    qrData,
    "showScanner:",
    showScanner,
    "scanSuccessful:",
    scanSuccessful
  );

  return (
    <div className={styles["qr-payment"]}>
      {/* Fallback UI when scanner is not available */}
      {!isAvailable && (
        <div className={styles["qr-scanner-placeholder"]}>
          <div className={styles["qr-scanner-content"]}>
            <h3>QR Сканер недоступен</h3>
            <p>QR сканер недоступен в данной версии Telegram.</p>
            <button
              className={styles["back-button"]}
              onClick={() => (window.location.href = "/")}
            >
              Вернуться назад
            </button>
          </div>
        </div>
      )}

      {/* Debug: Test button to manually trigger popup */}
      <div
        style={{ position: "fixed", top: "10px", right: "10px", zIndex: 10001 }}
      >
        <button
          onClick={() => {
            console.log("Manual test - triggering popup");
            setQrData("test-qr-data");
            setShowPurchaseForm(true);
            setScanSuccessful(true);
          }}
          style={{
            background: "#f3734e",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Test Popup
        </button>
      </div>

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
