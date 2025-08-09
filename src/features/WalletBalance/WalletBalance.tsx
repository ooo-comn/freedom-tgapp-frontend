import { FC, useEffect } from "react";
import { useWalletBalance } from "src/entities/wallet/model/fetchWalletBalance";
import { WalletBalanceDisplay } from "./ui/WalletBalanceDisplay/WalletBalanceDisplay";
import { WalletBalanceActions } from "./ui/WalletBalanceActions/WalletBalanceActions";
import styles from "./WalletBalance.module.css";

interface WalletBalanceProps {
  onBalanceChange?: (balance: string) => void;
}

export const WalletBalance: FC<WalletBalanceProps> = ({ onBalanceChange }) => {
  const { data } = useWalletBalance();
  const balance = (data?.balance ?? 0) + 0.5;

  useEffect(() => {
    if (balance !== undefined) {
      const formatted = balance.toLocaleString("ru-RU");
      onBalanceChange?.(formatted);
    }
  }, [balance, onBalanceChange]);

  return (
    <div className={styles["wallet-balance"]}>
      <WalletBalanceDisplay balance={balance} />
      <WalletBalanceActions balance={balance} />
    </div>
  );
};
