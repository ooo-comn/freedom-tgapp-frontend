import { FC, useEffect } from "react";
import styles from "./DepositPage.module.css";
import { WalletBalance } from "src/features/WalletBalance/WalletBalance";
import { useUserWallet } from "src/hooks/useUserWallet";
import USDTIcon from "src/shared/assets/wallet/USDT.png";

const DepositPage: FC = () => {
  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.location.href = "/";
  });

  const copyToClipboard = async (text: string) => {
    try {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      // Попробуем нативный popup, если доступен в рантайме
      const webApp: any = window.Telegram?.WebApp;
      if (webApp && typeof webApp.showPopup === "function") {
        webApp.showPopup({
          title: "Скопировано",
          message: "Адрес скопирован в буфер обмена",
          buttons: [{ id: "ok", type: "close", text: "Ок" }],
        });
      }
    } catch (err) {
      const webApp: any = window.Telegram?.WebApp;
      if (webApp && typeof webApp.showAlert === "function") {
        webApp.showAlert("Не удалось скопировать адрес");
      }
    }
  };

  const { data, isLoading: isWalletLoading } = useUserWallet();
  const address = data?.address || "";
  const logoUrl =
    new URLSearchParams(window.location.search).get("logo") || USDTIcon;

  // Ensure QRious is loaded and render QR with logo when address is available
  useEffect(() => {
    if (!address) return;

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if ((window as any).QRious) return resolve();
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load QRious"));
        document.body.appendChild(s);
      });

    const createTetherLogo = (size: number): HTMLCanvasElement => {
      const logoCanvas = document.createElement("canvas");
      const ctx = logoCanvas.getContext("2d")!;
      logoCanvas.width = size;
      logoCanvas.height = size;
      ctx.fillStyle = "#26a17b";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = `bold ${size * 0.53}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₮", size / 2, size / 2);
      return logoCanvas;
    };

    const addLogoToQR = (
      qrCanvas: HTMLCanvasElement,
      logo: HTMLCanvasElement | HTMLImageElement,
      logoSize = 60,
      logoBackgroundColor = "white",
      logoRadius = 30
    ) => {
      const ctx = qrCanvas.getContext("2d")!;
      const size = qrCanvas.width;
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      ctx.fillStyle = logoBackgroundColor;
      ctx.beginPath();
      ctx.arc(x + logoSize / 2, y + logoSize / 2, logoRadius, 0, Math.PI * 2);
      ctx.fill();
      if (logo instanceof Image) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          x + logoSize / 2,
          y + logoSize / 2,
          logoSize / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
        ctx.drawImage(logo, x, y, logoSize, logoSize);
        ctx.restore();
      } else {
        ctx.drawImage(logo, x, y, logoSize, logoSize);
      }
    };

    const generate = async () => {
      await ensureScript();
      const canvas = document.getElementById(
        "deposit-qr-canvas"
      ) as HTMLCanvasElement | null;
      if (!canvas) return;
      const QRiousCtor: any = (window as any).QRious;
      const dpr = window.devicePixelRatio || 1;
      const displaySize = Math.min(
        canvas.clientWidth || 0,
        canvas.clientHeight || 0
      );
      const size = Math.max(1, Math.floor(displaySize * dpr));
      canvas.width = size;
      canvas.height = size;
      // Render base QR
      new QRiousCtor({
        element: canvas,
        value: address,
        size,
        level: "H",
        foreground: "#000000",
        background: "#ffffff",
      });
      // Load logo image if available, otherwise draw Tether symbol
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const logoSize = Math.floor(size * 0.24);
        const logoRadius = Math.floor(size * 0.2);
        img.onload = () =>
          addLogoToQR(canvas, img, logoSize, "white", logoRadius);
        img.onerror = () => {
          const logo = createTetherLogo(logoSize);
          addLogoToQR(canvas, logo, logoSize, "white", logoRadius);
        };
        img.src = logoUrl;
      } catch {
        const logoSize = Math.floor(size * 0.24);
        const logoRadius = Math.floor(size * 0.2);
        const logo = createTetherLogo(logoSize);
        addLogoToQR(canvas, logo, logoSize, "white", logoRadius);
      }
    };

    generate();
  }, [address, logoUrl]);

  return (
    <div className={styles.deposit}>
      <h1 className={styles["deposit__title"]}>Пополнение</h1>

      <div className={styles["deposit__qr"]}>
        <canvas
          id="deposit-qr-canvas"
          style={{ width: "91.79vw", height: "91.79vw" }}
        />
      </div>

      <div className={styles["deposit__box-info"]}>
        <p className={styles["deposit__amount-title"]}>Сумма в USDT</p>

        <h2 className={styles["deposit__address"]}>
          {isWalletLoading ? "Загрузка…" : address || "—"}
        </h2>

        <p className={styles["deposit__note"]}>
          Этот адрес предназначен только для получения USDT в сети TRC20.
          Отправка активов в других сетях приведёт к их потере.
        </p>

        <p className={styles["deposit__commission"]}>
          Фиксированная комиссия 2,75 USDT
        </p>
      </div>

      <div className={styles["deposit__balance"]}>
        <h3 className={styles["deposit__balance-title"]}>Баланс</h3>
        <WalletBalance />
      </div>

      <button
        className={styles["deposit__button-copy"]}
        onClick={() => copyToClipboard(address)}
        disabled={!address}
      >
        Скопировать адрес
      </button>
    </div>
  );
};

export default DepositPage;
