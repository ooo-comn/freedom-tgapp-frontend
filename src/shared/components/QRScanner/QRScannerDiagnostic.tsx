import React, { useEffect, useState } from "react";

const QRScannerDiagnostic: React.FC = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});

  useEffect(() => {
    const runDiagnostic = async () => {
      const info: any = {};

      // Проверяем Telegram WebApp
      info.telegramWebApp = {
        exists: !!window.Telegram,
        webAppExists: !!window.Telegram?.WebApp,
        version: (window.Telegram?.WebApp as any)?.version,
        platform: (window.Telegram?.WebApp as any)?.platform,
        availableMethods: window.Telegram?.WebApp
          ? Object.keys(window.Telegram.WebApp)
          : [],
      };

      // Проверяем старые методы QR сканера
      info.oldQRMethods = {
        showScanQrPopupExists:
          typeof window.Telegram?.WebApp?.showScanQrPopup === "function",
        closeScanQrPopupExists:
          typeof window.Telegram?.WebApp?.closeScanQrPopup === "function",
      };

      // Проверяем user agent
      info.userAgent = navigator.userAgent;

      // Проверяем, находимся ли мы в Telegram
      info.isInTelegram = /TelegramWebApp/i.test(navigator.userAgent);

      // Проверяем URL параметры
      info.urlParams = {
        tgWebAppData: new URLSearchParams(window.location.search).get(
          "tgWebAppData"
        ),
        tgWebAppPlatform: new URLSearchParams(window.location.search).get(
          "tgWebAppPlatform"
        ),
        tgWebAppVersion: new URLSearchParams(window.location.search).get(
          "tgWebAppVersion"
        ),
        tgWebAppThemeParams: new URLSearchParams(window.location.search).get(
          "tgWebAppThemeParams"
        ),
        tgWebAppStartParam: new URLSearchParams(window.location.search).get(
          "tgWebAppStartParam"
        ),
      };

      setDiagnosticInfo(info);
      console.log("=== QR Scanner Diagnostic Info ===", info);
    };

    // Запускаем диагностику сразу и через небольшую задержку
    runDiagnostic();
    const timer = setTimeout(runDiagnostic, 1000);

    return () => clearTimeout(timer);
  }, []);

  const testOldQRScanner = () => {
    if (window.Telegram?.WebApp?.showScanQrPopup) {
      console.log("Testing old QR scanner...");
      window.Telegram.WebApp.showScanQrPopup({
        text: "Test QR Scanner",
        onResult: (result: string) => {
          console.log("Old QR scanner result:", result);
          alert(`Old QR scanner result: ${result}`);
        },
        onError: (error: any) => {
          console.log("Old QR scanner error:", error);
          alert(`Old QR scanner error: ${error}`);
        },
      });
    } else {
      alert("Old QR scanner methods not available");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>QR Scanner Diagnostic (Old Methods Only)</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testOldQRScanner}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0088cc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Test Old QR Scanner
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Diagnostic Results:</h3>
        <pre
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {JSON.stringify(diagnosticInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Summary:</h3>
        <ul>
          <li>
            <strong>In Telegram:</strong>{" "}
            {diagnosticInfo.isInTelegram ? "✅ Yes" : "❌ No"}
          </li>
          <li>
            <strong>Telegram WebApp:</strong>{" "}
            {diagnosticInfo.telegramWebApp?.webAppExists
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
          <li>
            <strong>Old QR Scanner:</strong>{" "}
            {diagnosticInfo.oldQRMethods?.showScanQrPopupExists
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
        </ul>
      </div>

      <div style={{ fontSize: "14px", color: "#666" }}>
        <h3>Recommendations:</h3>
        <ul>
          <li>
            Make sure you&apos;re using the latest version of Telegram (6.1+)
          </li>
          <li>
            Check that you&apos;re accessing the app from within Telegram, not
            from a browser
          </li>
          <li>Try refreshing the page and testing again</li>
          <li>
            If QR scanner is not working, check that the app is properly
            configured in BotFather
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QRScannerDiagnostic;
