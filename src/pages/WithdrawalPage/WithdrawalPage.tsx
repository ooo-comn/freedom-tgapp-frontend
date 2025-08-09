import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletBalanceDisplay } from "src/features/WalletBalance/ui/WalletBalanceDisplay/WalletBalanceDisplay";
import { useWalletBalance } from "../../entities/wallet/model/fetchWalletBalance";
import { fetchWithdrawFunds } from "../../entities/wallet/model/fetchWithdrawFunds";
import styles from "./WithdrawalPage.module.css";

const WithdrawalPage: FC = () => {
  window.scrollTo(0, 0);

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.location.href = "/";
  });
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const { data: walletData } = useWalletBalance();
  const balance = walletData?.balance || 0;

  const commission = 2.75;
  // Work in integer cents to avoid floating-point precision issues
  const commissionCents = 275;
  const minAmountCents = commissionCents + 1; // 2.76 USDT
  const minAmountNumber = minAmountCents / 100;
  const minAmount = minAmountNumber.toFixed(2);
  const canWithdraw = balance >= minAmountNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    const amountCents = Math.round(numAmount * 100);
    if (Number.isNaN(numAmount)) {
      alert("Введите корректную сумму");
      return;
    }

    if (amountCents < minAmountCents) {
      alert(
        `Минимальная сумма для вывода: ${(minAmountCents / 100).toFixed(
          2
        )} USDT`
      );
      return;
    }

    const balanceCents = Math.round((balance || 0) * 100);
    if (amountCents > balanceCents) {
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

  return (
    <div className={styles.withdrawalPage}>
      <div className={styles.header}>
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
            min={canWithdraw ? minAmount : "0"}
            max={canWithdraw ? balance : undefined}
            disabled={!canWithdraw}
            className={styles.input}
          />
          <p className={styles.commission}>
            Фиксированная комиссия {commission} USDT
          </p>
        </div>

        <div className={styles.balanceSection}>
          <label className={styles.label}>Баланс</label>
          <WalletBalanceDisplay balance={balance} />
        </div>

        <button type="submit" className={styles.submitButton}>
          Отправить
        </button>
      </form>
    </div>
  );
};

export default WithdrawalPage;
