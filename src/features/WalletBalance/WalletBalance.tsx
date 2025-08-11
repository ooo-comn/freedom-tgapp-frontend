import { FC } from "react";
import { WalletBalanceDisplay } from "./ui/WalletBalanceDisplay/WalletBalanceDisplay";
import { WalletBalanceActions } from "./ui/WalletBalanceActions/WalletBalanceActions";
import styles from "./WalletBalance.module.css";

export const WalletBalance: FC = () => {
  return (
    <div className={styles["wallet-balance"]}>
      <WalletBalanceDisplay />
      <WalletBalanceActions />
    </div>
  );
};
