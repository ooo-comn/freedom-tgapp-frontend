import React, { useState } from "react";
import { QRScanner, useQRScanner } from "./index";

const QRScannerTest: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState<string>("");
  const [method, setMethod] = useState<"component" | "hook">("component");

  const { scanQR, scanQRWithValidation, isAvailable } = useQRScanner({
    onSuccess: (qrResult) => {
      setResult(qrResult);
      console.log("QR отсканирован через хук:", qrResult);
    },
    onError: (error) => {
      console.error("Ошибка QR сканера:", error);
    },
  });

  const handleComponentSuccess = (qrResult: string) => {
    setResult(qrResult);
    setShowScanner(false);
    console.log("QR отсканирован через компонент:", qrResult);
  };

  const handleComponentClose = () => {
    setShowScanner(false);
    console.log("QR сканер закрыт");
  };

  const handleHookScan = async () => {
    const qrResult = await scanQR();
    if (qrResult) {
      setResult(qrResult);
    }
  };

  const handleHookValidationScan = async () => {
    const qrResult = await scanQRWithValidation(
      (qr) => qr.length > 0,
      "QR код не может быть пустым"
    );
    if (qrResult) {
      setResult(qrResult);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Тест QR Сканера</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Общая доступность:</strong>{" "}
          {isAvailable ? "✅ Доступен" : "❌ Недоступен"}
        </p>
        <p>
          <strong>Метод:</strong> {method}
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="radio"
            value="component"
            checked={method === "component"}
            onChange={(e) => setMethod(e.target.value as "component" | "hook")}
          />
          Компонент
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="hook"
            checked={method === "hook"}
            onChange={(e) => setMethod(e.target.value as "component" | "hook")}
          />
          Хук
        </label>
      </div>

      {method === "component" ? (
        <div>
          <button
            onClick={() => setShowScanner(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Открыть QR Сканер (Компонент)
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleHookScan}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Сканировать QR (Хук)
          </button>
          <button
            onClick={handleHookValidationScan}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Сканировать с Валидацией
          </button>
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScanSuccess={handleComponentSuccess}
          onClose={handleComponentClose}
          text="Отсканируйте QR код для тестирования"
        />
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Результат сканирования:</h3>
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
              wordBreak: "break-all",
            }}
          >
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerTest;
