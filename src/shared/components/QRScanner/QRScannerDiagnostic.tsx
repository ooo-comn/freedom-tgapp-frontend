import React, { useState, useEffect } from "react";
import styles from "./QRScannerDiagnostic.module.css";

interface EventLog {
  timestamp: string;
  eventType: string;
  eventData: any;
}

const QRScannerDiagnostic: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Обработчик событий Telegram
  const handleTelegramEvent = (eventType: string, eventData: any) => {
    const newLog: EventLog = {
      timestamp: new Date().toLocaleTimeString(),
      eventType,
      eventData,
    };

    setEventLogs((prev) => [newLog, ...prev.slice(0, 9)]); // Храним последние 10 событий
  };

  // Настройка слушателей событий
  useEffect(() => {
    if (!isListening) return;

    const setupEventListeners = () => {
      // Для Web версии (iframe)
      const handleWebMessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === "string") {
            const { eventType, eventData } = JSON.parse(event.data);
            handleTelegramEvent(eventType, eventData);
          }
        } catch (error) {
          // Игнорируем ошибки парсинга
        }
      };

      // Для Desktop, Mobile и Windows Phone
      const setupNativeEventListeners = () => {
        // Telegram Desktop
        if ((window.Telegram as any)?.GameProxy?.receiveEvent) {
          (window.Telegram as any).GameProxy.receiveEvent = handleTelegramEvent;
        }

        // Telegram for iOS and Android
        if ((window.Telegram as any)?.WebView?.receiveEvent) {
          (window.Telegram as any).WebView.receiveEvent = handleTelegramEvent;
        }

        // Windows Phone
        if ((window as any).TelegramGameProxy_receiveEvent) {
          (window as any).TelegramGameProxy_receiveEvent = handleTelegramEvent;
        }
      };

      // Добавляем слушатель для Web версии
      window.addEventListener("message", handleWebMessage);

      // Настраиваем слушатели для нативных версий
      setupNativeEventListeners();

      console.log("Event listeners setup completed");

      return () => {
        window.removeEventListener("message", handleWebMessage);
      };
    };

    setupEventListeners();
  }, [isListening]);

  const toggleEventListening = () => {
    setIsListening(!isListening);
  };

  const clearEventLogs = () => {
    setEventLogs([]);
  };

  const testQRScanner = () => {
    if (window.Telegram?.WebApp?.showScanQrPopup) {
      console.log("Testing QR Scanner...");
      window.Telegram.WebApp.showScanQrPopup(
        { text: "Тестовое сканирование QR-кода" },
        (result: string) => {
          console.log("QR Test result:", result);
          handleTelegramEvent("qr_text_received", { data: result });
          return true; // Закрываем попап после получения результата
        }
      );
    } else {
      console.log("QR Scanner not available");
    }
  };

  return (
    <div className={styles.diagnostic}>
      <h2>QR Scanner Diagnostic (Old Methods Only)</h2>

      {/* Информация о Telegram WebApp */}
      <section className={styles.section}>
        <h3>Telegram WebApp Info</h3>
        <div className={styles.info}>
          <p>
            <strong>WebApp Available:</strong>{" "}
            {window.Telegram?.WebApp ? "Yes" : "No"}
          </p>
          <p>
            <strong>Version:</strong>{" "}
            {(window.Telegram?.WebApp as any)?.version || "Unknown"}
          </p>
          <p>
            <strong>Platform:</strong>{" "}
            {(window.Telegram?.WebApp as any)?.platform || "Unknown"}
          </p>
          <p>
            <strong>QR Scanner Available:</strong>{" "}
            {typeof window.Telegram?.WebApp?.showScanQrPopup === "function"
              ? "Yes"
              : "No"}
          </p>
        </div>
      </section>

      {/* Управление событиями */}
      <section className={styles.section}>
        <h3>Event Management</h3>
        <div className={styles.controls}>
          <button
            onClick={toggleEventListening}
            className={`${styles.button} ${
              isListening ? styles.buttonActive : ""
            }`}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>
          <button onClick={clearEventLogs} className={styles.button}>
            Clear Logs
          </button>
          <button onClick={testQRScanner} className={styles.button}>
            Test QR Scanner
          </button>
        </div>
        <p className={styles.status}>
          Status: {isListening ? "Listening for events..." : "Not listening"}
        </p>
      </section>

      {/* Лог событий */}
      <section className={styles.section}>
        <h3>Event Logs</h3>
        <div className={styles.eventLogs}>
          {eventLogs.length === 0 ? (
            <p className={styles.noEvents}>No events received yet</p>
          ) : (
            eventLogs.map((log, index) => (
              <div key={index} className={styles.eventLog}>
                <div className={styles.eventHeader}>
                  <span className={styles.timestamp}>{log.timestamp}</span>
                  <span className={styles.eventType}>{log.eventType}</span>
                </div>
                <pre className={styles.eventData}>
                  {JSON.stringify(log.eventData, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Рекомендации */}
      <section className={styles.section}>
        <h3>Recommendations</h3>
        <ul className={styles.recommendations}>
          <li>Make sure you&apos;re testing in Telegram app</li>
          <li>Check that QR scanner is enabled in your Telegram version</li>
          <li>Try refreshing the page and testing again</li>
          <li>
            If QR scanner is not working, check that the app is properly
            configured in BotFather
          </li>
          <li>Start event listening to see real-time events</li>
          <li>Use &quot;Test QR Scanner&quot; to trigger a test scan</li>
        </ul>
      </section>
    </div>
  );
};

export default QRScannerDiagnostic;
