import React, { useEffect } from "react";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
  text?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
  text = "Наведите камеру на QR-код",
}) => {
  useEffect(() => {
    console.log("=== QR Scanner Component Debug ===");

    // Проверяем доступность старого QR сканера
    const isOldAvailable =
      typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
    console.log("Old QR Scanner isAvailable:", isOldAvailable);

    if (isOldAvailable) {
      console.log("Opening old QR scanner...");
      window.Telegram.WebApp.showScanQrPopup({
        text,
        onResult: (result: string) => {
          console.log("QR Scanner result:", result);
          onScanSuccess(result);
        },
        onError: (error: any) => {
          console.error("QR Scanner error:", error);
          onClose();
        },
      });
    } else {
      console.error("QR Scanner not available");
      onClose();
    }

    // Очистка при размонтировании компонента
    return () => {
      console.log("QR Scanner component unmounting");
    };
  }, [onScanSuccess, onClose, text]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <p>QR сканер открыт...</p>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
