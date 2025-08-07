import { FC, useEffect, useState } from "react";
import { fetchUserTransactions } from "src/entities/wallet/model/fetchUserTransactions";
import { getTelegramUserId } from "src/shared/lib/telegram";
import { WalletBalanceDisplay } from "./ui/WalletBalanceDisplay/WalletBalanceDisplay";
import { WalletBalanceActions } from "./ui/WalletBalanceActions/WalletBalanceActions";
import styles from "./WalletBalance.module.css";

interface WalletBalanceProps {
  onBalanceChange?: (balance: string) => void;
}

export const WalletBalance: FC<WalletBalanceProps> = ({ onBalanceChange }) => {
  const id = getTelegramUserId();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const result = await fetchUserTransactions(id.toString());
      if (result?.balance !== undefined) {
        const formatted = result.balance.toLocaleString("ru-RU");
        setBalance(result.balance);
        onBalanceChange?.(formatted);
      }
    };
    fetchData();
  }, [id, onBalanceChange]);

  return (
    <div className={styles["wallet-balance"]}>
      <WalletBalanceDisplay balance={balance} />
      <WalletBalanceActions balance={balance} />
    </div>
  );
};
