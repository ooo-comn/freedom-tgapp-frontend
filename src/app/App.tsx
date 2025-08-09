import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { initializeUser } from "src/entities/user/model/createUser";
import { VerificationForm } from "src/entities/verification/ui/VerificationForm/VerificationForm";
import ConnectCard from "src/pages/ConnectCard/ConnectCard";
import EditProfile from "src/pages/EditProfile/EditProfile";
import LegalPage from "src/pages/LegalPage/LegalPage";
import QRPayment from "src/pages/QRPayment/QRPayment";
import { QRScannerTest } from "src/shared/components/QRScanner";
import QRScannerDiagnostic from "src/shared/components/QRScanner/QRScannerDiagnostic";
import UserProfile from "src/pages/UserProfile/ui/UserProfile";
import WithdrawalPage from "src/pages/WithdrawalPage/WithdrawalPage";
import Create from "../pages/Create/Create";
import RegistrationPage from "src/pages/RegistrationPage/RegistrationPage";
import SubscriptionPage from "src/pages/SubscriptionPage/SubscriptionPage";
import SellerProfile from "src/pages/UserProfile/ui/SellerProfile";
import { WalletWidget } from "src/widgets/WalletWidget/WalletWidget";
import NavBar from "../pages/Navbar/Navbar";
import ConnectPayments from "../pages/Wallet/ConnectPayments";
import ReturnForm from "../pages/Wallet/ReturnForm";
import useTheme from "../shared/hooks/useTheme";
import "./App.css";

function App() {
  const [hasRedirected, setHasRedirected] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false);

  const { theme } = useTheme();
  console.log("theme", theme);

  const navigate = useNavigate();

  // Обработка общих событий Telegram Mini Apps (БЕЗ QR событий)
  useEffect(() => {
    const handleTelegramEvent = (eventType: string, eventData: any) => {
      console.log("=== Telegram Event Received ===");
      console.log("Event Type:", eventType);
      console.log("Event Data:", eventData);

      switch (eventType) {
        // УБИРАЕМ обработку QR событий отсюда - пусть хук сам их обрабатывает
        // case "qr_text_received":
        // case "scan_qr_popup_closed":

        case "popup_closed":
          console.log("Popup closed, button_id:", eventData.button_id);
          break;

        case "main_button_pressed":
          console.log("Main button pressed");
          break;

        case "back_button_pressed":
          console.log("Back button pressed");
          break;

        case "viewport_changed":
          console.log("Viewport changed:", eventData);
          break;

        case "theme_changed":
          console.log("Theme changed:", eventData.theme_params);
          break;

        case "invoice_closed":
          console.log("Invoice closed:", eventData);
          break;

        default:
          console.log("Event type received (not handled globally):", eventType);
      }
    };

    // Функция для обработки событий на разных платформах
    const setupEventListeners = () => {
      // Для Web версии (iframe)
      const handleWebMessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === "string") {
            const { eventType, eventData } = JSON.parse(event.data);
            // Пропускаем QR события - пусть хук их обрабатывает
            if (
              eventType !== "qr_text_received" &&
              eventType !== "scan_qr_popup_closed"
            ) {
              handleTelegramEvent(eventType, eventData);
            }
          }
        } catch (error) {
          // Игнорируем ошибки парсинга
        }
      };

      // Для Desktop, Mobile и Windows Phone
      const setupNativeEventListeners = () => {
        // Telegram Desktop
        if ((window.Telegram as any)?.GameProxy?.receiveEvent) {
          const originalReceiveEvent = (window.Telegram as any).GameProxy
            .receiveEvent;
          (window.Telegram as any).GameProxy.receiveEvent = (
            eventType: string,
            eventData: any
          ) => {
            if (
              eventType !== "qr_text_received" &&
              eventType !== "scan_qr_popup_closed"
            ) {
              handleTelegramEvent(eventType, eventData);
            }
            // Вызываем оригинальный обработчик для QR событий
            if (
              originalReceiveEvent &&
              (eventType === "qr_text_received" ||
                eventType === "scan_qr_popup_closed")
            ) {
              originalReceiveEvent(eventType, eventData);
            }
          };
        }

        // Аналогично для других платформ...
      };

      window.addEventListener("message", handleWebMessage);
      setupNativeEventListeners();

      console.log(
        "Telegram event listeners setup completed (excluding QR events)"
      );

      return () => {
        window.removeEventListener("message", handleWebMessage);
      };
    };

    setupEventListeners();
  }, []);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log("Telegram Web App script loaded");

      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;

        webApp.ready();
        webApp.expand();

        // Отключаем вертикальные свайпы если доступно
        if ("disableVerticalSwipes" in webApp) {
          (webApp as any).disableVerticalSwipes();
          console.log("Vertical swipes disabled");
        }

        // Включаем подтверждение закрытия
        if ("enableClosingConfirmation" in webApp) {
          (webApp as any).enableClosingConfirmation();
        }

        // Инициализируем пользователя
        if (!userInitialized) {
          initializeUser().then((success) => {
            console.log(
              "User initialization:",
              success ? "successful" : "failed"
            );
            setUserInitialized(true);
          });
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [userInitialized]);

  // Обработка start параметров
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const startParam =
      urlParams.get("tgWebAppStartParam") ||
      new URLSearchParams(window.location.hash.substring(1)).get(
        "tgWebAppStartParam"
      );

    console.log("Start param received:", startParam);

    if (startParam && startParam.startsWith("course_")) {
      const courseId = startParam.split("_")[1];
      navigate(`/course/${courseId}`);
      setHasRedirected(true);
    } else if (startParam && startParam.startsWith("user_")) {
      const userId = startParam.split("_")[1];
      console.log("Navigating to user profile:", userId);
      navigate(`/user/${userId}`);
      setHasRedirected(true);
    } else if (startParam && startParam === "profile") {
      navigate("/profile");
      setHasRedirected(true);
    }
  }, [navigate, hasRedirected]);

  return (
    <TonConnectUIProvider manifestUrl="https://comncourse.netlify.app/tonconnect-manifest.json">
      <div id="wrap">
        <div id="content">
          <div className="App">
            <meta
              name="viewport"
              content="width=device-width, user-scalable=no"
            ></meta>
            <Routes>
              <Route index element={<WalletWidget />} />
              <Route
                path={"create"}
                element={
                  <>
                    <Create /> <NavBar />{" "}
                  </>
                }
              />
              <Route path={"profile"} element={<UserProfile />} />
              <Route path={"subscription"} element={<SubscriptionPage />} />
              <Route path={"edit-profile/:id"} element={<EditProfile />} />
              <Route path={"user/:id"} element={<SellerProfile />} />
              <Route path={"registration"} element={<RegistrationPage />} />
              <Route path={"legal"} element={<LegalPage />} />
              <Route
                path={"verification-form"}
                element={<VerificationForm />}
              />
              <Route path={"connect-payments"} element={<ConnectPayments />} />
              <Route path={"connect-payments-form"} element={<ConnectCard />} />
              <Route path={"return-form"} element={<ReturnForm />} />
              <Route path={"withdrawal"} element={<WithdrawalPage />} />
              <Route path={"qr-payment"} element={<QRPayment />} />
              <Route path={"qr-test"} element={<QRScannerTest />} />
              <Route path={"qr-diagnostic"} element={<QRScannerDiagnostic />} />
            </Routes>
          </div>
        </div>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
