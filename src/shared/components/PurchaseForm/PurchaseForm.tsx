import { FC, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import styles from "./PurchaseForm.module.css";
import { WalletBalanceDisplay } from "src/features/WalletBalance/ui/WalletBalanceDisplay/WalletBalanceDisplay";
import { useUserBalance } from "src/hooks/useUserBalance";

interface PurchaseFormProps {
  qrData: string;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData) => void;
}

export interface PurchaseFormData {
  amount: number;
  paymentMethod: string;
  wallet: string;
  transactionId: string;
}

const PurchaseForm: FC<PurchaseFormProps> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState<number | null>(null);
  const paymentMethod = "Оплата по СБП";
  const wallet = "USDT";
  const { data: balance = 0 } = useUserBalance();

  const transactionId = "19876543456"; // В реальном приложении это будет генерироваться
  const currentDate = format(new Date(), "d MMMM yyyy", { locale: ru });

  const handleSubmit = () => {
    if (amount && amount > 0) {
      onSubmit({
        amount,
        paymentMethod,
        wallet,
        transactionId,
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.value === "" ? null : parseFloat(e.target.value) || 0;
    setAmount(value);
  };

  return (
    <div className={styles["purchase-form"]}>
      {/* Drag Handle */}
      <div className={styles["purchase-form__drag-handle"]}></div>

      {/* Header */}
      <div className={styles["purchase-form__header"]}>
        <div className={styles["purchase-form__date"]}>{currentDate}</div>
        <button className={styles["purchase-form__close"]} onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#333"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <h1 className={styles["purchase-form__title"]}>Покупка</h1>
      <p className={styles["purchase-form__transaction-id"]}>
        Transaction UID: {transactionId}
      </p>

      {/* Amount Section */}
      <div className={styles["purchase-form__section"]}>
        <label className={styles["purchase-form__label"]}>
          Сумма (в рублях)
        </label>
        <input
          type="number"
          className={styles["purchase-form__input"]}
          value={amount || ""}
          onChange={handleAmountChange}
          placeholder="0.00 ₽"
          min="0"
          step="0.01"
        />
      </div>

      {/* Payment Method Section */}
      <div className={styles["purchase-form__section"]}>
        <label className={styles["purchase-form__label"]}>Способ оплаты</label>
        <div className={styles["purchase-form__select"]}>
          <div className={styles["purchase-form__select-icon"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3.75 4.5C2.5166 4.5 1.5 5.5166 1.5 6.75V17.25C1.5 18.4834 2.5166 19.5 3.75 19.5H20.25C21.4834 19.5 22.5 18.4834 22.5 17.25V6.75C22.5 5.5166 21.4834 4.5 20.25 4.5H3.75ZM3.75 6H20.25C20.6748 6 21 6.3252 21 6.75V8.25H3.75V9.75H21V17.25C21 17.6748 20.6748 18 20.25 18H3.75C3.3252 18 3 17.6748 3 17.25V6.75C3 6.3252 3.3252 6 3.75 6Z"
                fill="#F3734E"
              />
            </svg>
          </div>
          <span className={styles["purchase-form__select-text"]}>
            {paymentMethod}
          </span>
        </div>
      </div>

      {/* Wallet Section */}
      <div className={styles["purchase-form__section"]}>
        <label className={styles["purchase-form__label"]}>Кошелёк</label>
        <WalletBalanceDisplay balance={balance} />
      </div>

      {/* Submit Button */}
      <button
        className={styles["purchase-form__submit"]}
        onClick={handleSubmit}
        disabled={!amount || amount <= 0}
      >
        Оформить заказ
      </button>
    </div>
  );
};

export default PurchaseForm;
