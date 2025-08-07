import React, { useState } from "react";
import { QRScanner, useQRScanner } from "./index";

const QRScannerTest: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState<string>("");
  const [method, setMethod] = useState<"component" | "hook">("component");

  const {
    scanQR,
    scanQRWithValidation,
    isAvailable,
    isNewAvailable,
    isOldAvailable,
  } = useQRScanner({
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
          <strong>Новый QR сканер:</strong>{" "}
          {isNewAvailable ? "✅ Доступен" : "❌ Недоступен"}
        </p>
        <p>
          <strong>Старый QR сканер:</strong>{" "}
          {isOldAvailable ? "✅ Доступен" : "❌ Недоступен"}
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
            disabled={!isAvailable}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0088cc",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isAvailable ? "pointer" : "not-allowed",
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
            disabled={!isAvailable}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isAvailable ? "pointer" : "not-allowed",
              marginRight: "10px",
            }}
          >
            Сканировать QR (Хук)
          </button>

          <button
            onClick={handleHookValidationScan}
            disabled={!isAvailable}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: isAvailable ? "pointer" : "not-allowed",
            }}
          >
            Сканировать с валидацией
          </button>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4>Результат сканирования:</h4>
          <p style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
            {result}
          </p>
          <button
            onClick={() => setResult("")}
            style={{
              padding: "5px 10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Очистить
          </button>
        </div>
      )}

      {showScanner && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        >
          <QRScanner
            onScanSuccess={handleComponentSuccess}
            onClose={handleComponentClose}
          />
        </div>
      )}

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#666" }}>
        <h4>Инструкция по тестированию:</h4>
        <ol>
          <li>Убедитесь, что вы находитесь в Telegram Mini App</li>
          <li>Выберите метод тестирования (компонент или хук)</li>
          <li>Нажмите кнопку для открытия QR сканера</li>
          <li>Наведите камеру на QR код</li>
          <li>Проверьте результат в консоли и на экране</li>
        </ol>
      </div>
    </div>
  );
};

export default QRScannerTest;
