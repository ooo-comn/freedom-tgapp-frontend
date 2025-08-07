import React, { useState } from "react";
import { useQRScanner } from "./useQRScanner";

const QRScannerExample: React.FC = () => {
  const [scannedResult, setScannedResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { scanQR, scanQRWithValidation, isAvailable } = useQRScanner({
    onSuccess: (result) => {
      setScannedResult(result);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("QR Scanner error:", error);
      setIsLoading(false);
    },
    text: "Наведите камеру на QR-код для оплаты",
  });

  const handleSimpleScan = async () => {
    setIsLoading(true);
    const result = await scanQR();
    if (result) {
      setScannedResult(result);
    }
    setIsLoading(false);
  };

  const handleValidatedScan = async () => {
    setIsLoading(true);

    // Пример валидации - проверяем, что QR код содержит URL
    const result = await scanQRWithValidation(
      (qr) => qr.startsWith("http") || qr.startsWith("https"),
      "QR код должен содержать ссылку"
    );

    if (result) {
      setScannedResult(result);
    }
    setIsLoading(false);
  };

  if (!isAvailable) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>QR сканер недоступен в данной версии Telegram</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>QR Сканер</h3>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleSimpleScan}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#0088cc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Сканирование..." : "Сканировать QR"}
        </button>

        <button
          onClick={handleValidatedScan}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          Сканировать с валидацией
        </button>
      </div>

      {scannedResult && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4>Результат сканирования:</h4>
          <p style={{ wordBreak: "break-all" }}>{scannedResult}</p>
        </div>
      )}
    </div>
  );
};

export default QRScannerExample;
