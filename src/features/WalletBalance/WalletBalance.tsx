import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserTransactions } from "src/entities/wallet/model/fetchUserTransactions";
import { fetchWithdraw } from "src/entities/wallet/model/fetchWithdraw";
import USDTImage from "../../shared/assets/wallet/USDT.png";
import CreditCard from "../../shared/assets/wallet/CreditCard.svg";
import styles from "./WalletBalance.module.css";

interface WalletBalanceProps {
  onBalanceChange?: (balance: string) => void;
}

export const WalletBalance: FC<WalletBalanceProps> = ({ onBalanceChange }) => {
  const navigate = useNavigate();
  const { id } = window.Telegram.WebApp.initDataUnsafe.user;
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchUserTransactions(id);
      if (result?.balance !== undefined) {
        const formatted = result.balance.toLocaleString("ru-RU");
        setBalance(result.balance);
        onBalanceChange?.(formatted);
      }
    };
    fetchData();
  }, [id, onBalanceChange]);

  const handleDeposit = async () => {
    console.log(balance);
    if (balance > 6000) {
      const success = await fetchWithdraw();

      console.log("ok");

      if (success) {
        navigate("/profile");
      }
    }
    window.document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  };

  const handleWithdraw = () => {
    navigate("/withdrawal");
  };

  return (
    <div className={styles["wallet-balance"]}>
      <div className={styles["wallet-balance__wrapper"]}>
        <img
          src={USDTImage}
          alt="картинка USDT"
          className={styles["wallet-balance__img"]}
        />
        <div className={styles["wallet-balance__info-wrapper"]}>
          <div className={styles["wallet-balance__info"]}>
            <h2 className={styles["wallet-balance__currency"]}>USDT</h2>
            <h2 className={styles["wallet-balance__value"]}>0.0 ₽</h2>
          </div>
          <div className={styles["wallet-balance__amount"]}>
            <p className={styles["wallet-balance__rate"]}>78,99 ₽</p>
            <p className={styles["wallet-balance__crypto"]}>0.0 USDT</p>
          </div>
        </div>
      </div>

      <div className={styles["wallet-balance__actions"]}>
        <button
          className={`${styles["wallet-balance__button"]} ${styles["wallet-balance__button--deposit"]}`}
          onClick={handleDeposit}
        >
          <img
            src={CreditCard}
            alt="картинка пополнения"
            className={styles["wallet-balance__button-icon"]}
          />
          Пополнение
        </button>

        <button
          className={`${styles["wallet-balance__button"]} ${styles["wallet-balance__button--withdraw"]}`}
          onClick={handleWithdraw}
        >
          <img
            src={CreditCard}
            alt="картинка вывода"
            className={styles["wallet-balance__button-icon"]}
          />
          Вывод
        </button>
      </div>
    </div>
  );
};
