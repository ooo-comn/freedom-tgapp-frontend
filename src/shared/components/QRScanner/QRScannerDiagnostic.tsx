import React, { useEffect, useState } from "react";
import { qrScanner, retrieveLaunchParams, initData } from "@telegram-apps/sdk";

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

      // Проверяем Telegram Apps SDK
      info.telegramAppsSDK = {
        qrScannerExists: !!qrScanner,
        qrScannerMethods: qrScanner ? Object.keys(qrScanner) : [],
        qrScannerOpenExists: !!qrScanner?.open,
        qrScannerOpenMethods: qrScanner?.open
          ? Object.keys(qrScanner.open)
          : [],
        isAvailable: qrScanner?.open?.isAvailable
          ? qrScanner.open.isAvailable()
          : false,
        isOpened: qrScanner?.isOpened ? qrScanner.isOpened() : false,
      };

      // Проверяем старые методы QR сканера
      info.oldQRMethods = {
        showScanQrPopupExists:
          typeof window.Telegram?.WebApp?.showScanQrPopup === "function",
        closeScanQrPopupExists:
          typeof window.Telegram?.WebApp?.closeScanQrPopup === "function",
      };

      // Проверяем launch params
      try {
        const lp = retrieveLaunchParams();
        info.launchParams = {
          exists: !!lp,
          platform: lp?.platform,
          version: lp?.version,
          initData: lp?.initData ? "exists" : "not exists",
          startParam: lp?.startParam,
          themeParams: lp?.themeParams ? "exists" : "not exists",
        };
      } catch (error) {
        info.launchParams = {
          error: error instanceof Error ? error.message : String(error),
        };
      }

      // Проверяем initData
      try {
        info.initData = {
          exists: !!initData,
          authDate: (initData as any)?.authDate,
          hash: (initData as any)?.hash ? "exists" : "not exists",
          user: (initData as any)?.user ? "exists" : "not exists",
          receiver: (initData as any)?.receiver ? "exists" : "not exists",
          chat: (initData as any)?.chat ? "exists" : "not exists",
          chatType: (initData as any)?.chatType,
          chatInstance: (initData as any)?.chatInstance,
          startParam: (initData as any)?.startParam,
          canSendAfter: (initData as any)?.canSendAfter,
          canSendAfterDate: (initData as any)?.canSendAfterDate,
        };
      } catch (error) {
        info.initData = {
          error: error instanceof Error ? error.message : String(error),
        };
      }

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

  const testNewQRScanner = async () => {
    try {
      console.log("Testing new QR scanner...");
      if (qrScanner?.open?.isAvailable()) {
        const result = await qrScanner.open({
          text: "Test QR Scanner (New)",
        });
        console.log("New QR scanner result:", result);
        alert(`New QR scanner result: ${result}`);
      } else {
        alert("New QR scanner not available");
      }
    } catch (error) {
      console.log("New QR scanner error:", error);
      alert(`New QR scanner error: ${error}`);
    }
  };

  const testSDKInitialization = () => {
    try {
      console.log("=== Testing SDK Initialization ===");
      const lp = retrieveLaunchParams();
      console.log("Launch params:", lp);

      if (lp?.initData) {
        console.log("Initializing initData...");
        (initData as any).init(lp.initData);
        console.log("initData initialized successfully");
        alert("SDK initialization test completed successfully");
      } else {
        console.log("No initData found");
        alert("No initData found for SDK initialization");
      }
    } catch (error) {
      console.error("SDK initialization test error:", error);
      alert(`SDK initialization test error: ${error}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>QR Scanner Diagnostic</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testOldQRScanner}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#0088cc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Test Old QR Scanner
        </button>
        <button
          onClick={testNewQRScanner}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Test New QR Scanner
        </button>
        <button
          onClick={testSDKInitialization}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Test SDK Init
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
            <strong>Telegram Apps SDK:</strong>{" "}
            {diagnosticInfo.telegramAppsSDK?.qrScannerExists
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
          <li>
            <strong>Launch Params:</strong>{" "}
            {diagnosticInfo.launchParams?.exists
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
          <li>
            <strong>Init Data:</strong>{" "}
            {diagnosticInfo.initData?.exists
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
          <li>
            <strong>Old QR Scanner:</strong>{" "}
            {diagnosticInfo.oldQRMethods?.showScanQrPopupExists
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
          <li>
            <strong>New QR Scanner:</strong>{" "}
            {diagnosticInfo.telegramAppsSDK?.isAvailable
              ? "✅ Available"
              : "❌ Not Available"}
          </li>
        </ul>
      </div>

      <div style={{ fontSize: "14px", color: "#666" }}>
        <h3>Recommendations:</h3>
        <ul>
          <li>
            If &quot;New QR Scanner&quot; is not available, try using the old QR
            scanner methods
          </li>
          <li>
            Make sure you&apos;re using the latest version of Telegram (6.1+)
          </li>
          <li>
            Check that you&apos;re accessing the app from within Telegram, not
            from a browser
          </li>
          <li>Try refreshing the page and testing again</li>
          <li>
            If SDK is not working, check that the app is properly configured in
            BotFather
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QRScannerDiagnostic;
