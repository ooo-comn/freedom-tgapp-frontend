import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithdraw } from "src/entities/wallet/model/fetchWithdraw";
import CreditCard from "src/shared/assets/wallet/CreditCard.svg";
import styles from "./WalletBalanceActions.module.css";

interface WalletBalanceActionsProps {
  balance: number;
}

export const WalletBalanceActions: FC<WalletBalanceActionsProps> = ({
  balance,
}) => {
  const navigate = useNavigate();

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
    <div className={styles["wallet-balance-actions"]}>
      <button
        className={`${styles["wallet-balance-actions__button"]} ${styles["wallet-balance-actions__button--deposit"]}`}
        onClick={handleDeposit}
      >
        <img
          src={CreditCard}
          alt="картинка пополнения"
          className={styles["wallet-balance-actions__button-icon"]}
        />
        Пополнение
      </button>

      <button
        className={`${styles["wallet-balance-actions__button"]} ${styles["wallet-balance-actions__button--withdraw"]}`}
        onClick={handleWithdraw}
      >
        <img
          src={CreditCard}
          alt="картинка вывода"
          className={styles["wallet-balance-actions__button-icon"]}
        />
        Вывод
      </button>
    </div>
  );
};
