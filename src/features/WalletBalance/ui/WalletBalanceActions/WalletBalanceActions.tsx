import { FC } from "react";
import { useNavigate } from "react-router-dom";
import CreditCard from "src/shared/assets/wallet/CreditCard.svg";
import styles from "./WalletBalanceActions.module.css";

interface WalletBalanceActionsProps {
  balance: number;
}

export const WalletBalanceActions: FC<WalletBalanceActionsProps> = () => {
  const navigate = useNavigate();

  const handleDeposit = () => {
    navigate("/deposit");
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
