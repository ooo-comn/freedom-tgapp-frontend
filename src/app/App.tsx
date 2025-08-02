import { postEvent, retrieveLaunchParams } from "@telegram-apps/sdk";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { initializeUser } from "src/entities/user/model/createUser";
import { VerificationForm } from "src/entities/verification/ui/VerificationForm/VerificationForm";
import EditProfile from "src/pages/EditProfile/EditProfile";
import FeedbackPage from "src/pages/FeedbackPage/FeedbackPage";
import LegalPage from "src/pages/LegalPage/LegalPage";
import UserProfile from "src/pages/UserProfile/ui/UserProfile";
import ConnectWallet from "src/pages/Wallet/ConnectWallet";
import ConnectWalletN from "src/pages/Wallet/ConnectWalletN";
import Create from "../pages/Create/Create";
// import EditCourse from '../pages/Create/EditCourse'
import ConnectCard from "src/pages/ConnectCard/ConnectCard";
import EditCourse from "src/pages/EditCourse/EditCourse";
import FiltersPage from "src/pages/FiltersPage/FiltersPage";
import LandingPage from "src/pages/LandingPage/LandingPage";
import RegistrationPage from "src/pages/RegistrationPage/RegistrationPage";
import SubjectsPage from "src/pages/SubjectsPage/SubjectsPage";
import SubscriptionPage from "src/pages/SubscriptionPage/SubscriptionPage";
import SellerProfile from "src/pages/UserProfile/ui/SellerProfile";
import Feed from "../pages/Feed/Feed";
// import SendFeedback from '../pages/Feedback/SendFeedback'
import NavBar from "../pages/Navbar/Navbar";
import Bio from "../pages/Profile/Bio";
import ECourse from "../pages/Profile/ECourse";
import Verification from "../pages/Profile/Verification";
import ConnectPayments from "../pages/Wallet/ConnectPayments";
import ReturnForm from "../pages/Wallet/ReturnForm";
// import Transaction from '../pages/Wallet/Transaction'
import VerificationN from "../pages/Wallet/VerificationN";
// import Wallet from '../pages/Wallet/Wallet'
import useTheme from "../shared/hooks/useTheme";
import WorkTypesPage from "src/pages/WorkTypesPage/WorkTypesPage";
import UniversitiesPage from "src/pages/UniversitiesPage/UniversitiesPage";
import "./App.css";

function App() {
  const [hasRedirected, setHasRedirected] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false);
  // const [hasReloaded, setHasReloaded] = useState(false)

  const { theme } = useTheme();
  console.log("theme", theme);

  // const tg: any = window.Telegram
  // tg.WebApp.expand()
  // tg.WebApp.enableClosingConfirmation()
  const navigate = useNavigate();

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

        if (
          window.Telegram.WebView.initParams.tgWebAppPlatform !== "tdesktop" &&
          window.Telegram.WebView.initParams.tgWebAppPlatform !== "macos" &&
          window.Telegram.WebView.initParams.tgWebAppPlatform !== "weba"
        ) {
          postEvent("web_app_request_fullscreen");
        }

        if (webApp.isVerticalSwipesEnabled) {
          webApp.disableVerticalSwipes();
          console.log("Vertical swipes disabled");
        } else {
          console.log("Vertical swipes were already disabled");
        }

        webApp.enableClosingConfirmation();

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
      document.body.removeChild(script);
    };
  }, [userInitialized]);

  useEffect(() => {
    const lp = retrieveLaunchParams();

    if (
      !lp ||
      ["macos", "tdesktop", "weba", "web", "webk"].includes(lp.platform)
    ) {
      return;
    }

    document.body.classList.add("mobile-body");
    document.getElementById("wrap")?.classList.add("mobile-wrap");
    document.getElementById("content")?.classList.add("mobile-content");
  }, []);

  useEffect(() => {
    if (hasRedirected) return;

    const urlParams = new URLSearchParams(window.Telegram.WebApp.initData);
    const startParam = urlParams.get("start_param");

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
              <Route index element={<Feed />} />
              <Route
                path={"create"}
                element={
                  <>
                    <Create /> <NavBar />{" "}
                  </>
                }
              />
              <Route path={"profile"} element={<UserProfile />} />
              {/* <Route path={'send-feedback/:id'} element={<SendFeedback />} /> */}
              <Route path={"subscription"} element={<SubscriptionPage />} />
              <Route path={"filters"} element={<FiltersPage />} />
              <Route path={"edit-profile/:id"} element={<EditProfile />} />
              <Route path={"edit-bio/:id"} element={<Bio />} />
              <Route path={"edit-ecourse/:id"} element={<ECourse />} />
              <Route path={"edit-course/:cid"} element={<EditCourse />} />
              <Route
                path={"course-feedback/:id"}
                element={<FeedbackPage isFullCourses={false} />}
              />
              <Route
                path={"user-feedback/:id"}
                element={<FeedbackPage isFullCourses={true} />}
              />
              <Route path={"user/:id"} element={<SellerProfile />} />
              {/* <Route path={'wallet'} element={<Wallet />} /> */}
              <Route path={"registration"} element={<RegistrationPage />} />
              <Route path={"landing"} element={<LandingPage />} />
              {/* <Route path={'transaction/:tid'} element={<Transaction />} /> */}
              <Route path={"verification"} element={<Verification />} />
              <Route path={"connect-wallet"} element={<ConnectWallet />} />
              <Route path={"verificationN"} element={<VerificationN />} />
              <Route path={"connect-walletN"} element={<ConnectWalletN />} />
              <Route path={"legal"} element={<LegalPage />} />
              <Route path={"subjects"} element={<SubjectsPage />} />
              <Route path={"work-types"} element={<WorkTypesPage />} />
              <Route path={"universities"} element={<UniversitiesPage />} />
              <Route
                path={"verification-form"}
                element={<VerificationForm />}
              />
              <Route path={"connect-payments"} element={<ConnectPayments />} />
              <Route path={"connect-payments-form"} element={<ConnectCard />} />
              <Route path={"return-form"} element={<ReturnForm />} />
            </Routes>
          </div>
        </div>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
