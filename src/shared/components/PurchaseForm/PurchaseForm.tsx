import { FC, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import styles from "./PurchaseForm.module.css";

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

const PurchaseForm: FC<PurchaseFormProps> = ({ qrData, onClose, onSubmit }) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Оплата по СБП");
  const [wallet, setWallet] = useState<string>("USDT");

  const transactionId = "19876543456"; // В реальном приложении это будет генерироваться
  const currentDate = format(new Date(), "d MMMM yyyy", { locale: ru });
  const usdtRate = 78.99; // Курс USDT к рублю

  const handleSubmit = () => {
    if (amount > 0) {
      onSubmit({
        amount,
        paymentMethod,
        wallet,
        transactionId,
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
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
              stroke="#666"
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
          value={amount}
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
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M16 4H4C2.89543 4 2 4.89543 2 6V14C2 15.1046 2.89543 16 4 16H16C17.1046 16 18 15.1046 18 14V6C18 4.89543 17.1046 4 16 4Z"
                stroke="#F3734E"
                strokeWidth="1.5"
              />
              <path d="M2 10H18" stroke="#F3734E" strokeWidth="1.5" />
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
        <div className={styles["purchase-form__wallet"]}>
          <div className={styles["purchase-form__wallet-info"]}>
            <div className={styles["purchase-form__wallet-icon"]}>
              <span>T</span>
            </div>
            <div className={styles["purchase-form__wallet-details"]}>
              <div className={styles["purchase-form__wallet-name"]}>USDT</div>
              <div className={styles["purchase-form__wallet-rate"]}>
                {usdtRate.toFixed(2)} ₽
              </div>
            </div>
          </div>
          <div className={styles["purchase-form__wallet-balance"]}>
            <div className={styles["purchase-form__wallet-balance-rub"]}>
              {(amount / usdtRate).toFixed(1)} ₽
            </div>
            <div className={styles["purchase-form__wallet-balance-usdt"]}>
              {(amount / usdtRate).toFixed(1)} USDT
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={styles["purchase-form__submit"]}
        onClick={handleSubmit}
        disabled={amount <= 0}
      >
        Оформить заказ
      </button>
    </div>
  );
};

export default PurchaseForm;
