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
// import LandingPage from "src/pages/LandingPage/LandingPage";
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

  // Обработка событий Telegram Mini Apps
  useEffect(() => {
    const handleTelegramEvent = (eventType: string, eventData: any) => {
      console.log("=== Telegram Event Received ===");
      console.log("Event Type:", eventType);
      console.log("Event Data:", eventData);

      switch (eventType) {
        case "qr_text_received":
          console.log("QR Code scanned:", eventData.data);
          // Автоматически закрываем QR сканер после получения результата
          if (window.Telegram?.WebApp?.closeScanQrPopup) {
            console.log("Closing QR scanner after successful scan");
            // Добавляем небольшую задержку для корректной обработки
            setTimeout(() => {
              window.Telegram.WebApp.closeScanQrPopup();
            }, 100);
          }
          // Здесь можно добавить глобальную обработку QR кодов
          break;

        case "scan_qr_popup_closed":
          console.log("QR Scanner popup closed");
          break;

        case "popup_closed":
          console.log("Popup closed, button_id:", eventData.button_id);
          break;

        case "main_button_pressed":
          console.log("Main button pressed");
          break;

        case "back_button_pressed":
          console.log("Back button pressed");
          // Можно добавить навигацию назад
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
          console.log("Unknown event type:", eventType);
      }
    };

    // Функция для обработки событий на разных платформах
    const setupEventListeners = () => {
      // Для Web версии (iframe)
      const handleWebMessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === "string") {
            const { eventType, eventData } = JSON.parse(event.data);
            handleTelegramEvent(eventType, eventData);
          }
        } catch (error) {
          // Игнорируем ошибки парсинга, так как не все сообщения от Telegram
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

      console.log("Telegram event listeners setup completed");

      // Очистка при размонтировании
      return () => {
        window.removeEventListener("message", handleWebMessage);
      };
    };

    setupEventListeners();
  }, []);

  // Инициализация старого Telegram WebApp
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

        // Проверяем доступность методов перед их использованием
        if (
          "isVerticalSwipesEnabled" in webApp &&
          (webApp as any).isVerticalSwipesEnabled
        ) {
          if ("disableVerticalSwipes" in webApp) {
            (webApp as any).disableVerticalSwipes();
            console.log("Vertical swipes disabled");
          }
        } else {
          console.log("Vertical swipes were already disabled");
        }

        if ("enableClosingConfirmation" in webApp) {
          (webApp as any).enableClosingConfirmation();
        }

        // Инициализируем пользователя после загрузки Telegram WebApp
        if (!userInitialized) {
          initializeUser().then((success) => {
            if (success) {
              console.log("User initialization successful");
            } else {
              console.log("User initialization failed");
            }
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

  useEffect(() => {
    // Получаем start param из URL параметров
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
              {/* <Route path={"landing"} element={<LandingPage />} /> */}
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
