import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletBalanceDisplay } from "src/features/WalletBalance/ui/WalletBalanceDisplay/WalletBalanceDisplay";
import { useWalletBalance } from "../../entities/wallet/model/fetchWalletBalance";
import { fetchWithdrawFunds } from "../../entities/wallet/model/fetchWithdrawFunds";
import styles from "./WithdrawalPage.module.css";

const WithdrawalPage: FC = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const { data: walletData } = useWalletBalance();
  const balance = walletData?.balance || 0;

  const commission = 2.75; // Фиксированная комиссия
  const minAmount = commission + 0.01; // Минимальная сумма для вывода

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (numAmount < minAmount) {
      alert(`Минимальная сумма для вывода: ${minAmount} USDT`);
      return;
    }

    if (numAmount > balance) {
      alert("Недостаточно средств на балансе");
      return;
    }

    if (!address.trim()) {
      alert("Введите адрес для вывода");
      return;
    }

    try {
      const result = await fetchWithdrawFunds({
        address: address.trim(),
        amount: numAmount,
      });

      if (result.success) {
        alert("Запрос на вывод средств отправлен успешно!");
        navigate(-1);
      } else {
        alert(result.message || "Ошибка при отправке запроса");
      }
    } catch (error) {
      console.error("Ошибка вывода средств:", error);
      alert("Произошла ошибка при выводе средств. Попробуйте позже.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.withdrawalPage}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ←
        </button>
        <h1 className={styles.title}>Вывод</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Адресс TRC20</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Адрес в сети TRC20"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Сумма в USDT</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00 USDT"
            step="0.01"
            min={minAmount}
            max={balance}
            className={styles.input}
          />
          <p className={styles.commission}>
            Фиксированная комиссия {commission} USDT
          </p>
        </div>

        <div className={styles.balanceSection}>
          <label className={styles.label}>Баланс</label>
          <div className={styles.balanceCard}>
            <WalletBalanceDisplay balance={balance} />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Отправить
        </button>
      </form>
    </div>
  );
};

export default WithdrawalPage;
