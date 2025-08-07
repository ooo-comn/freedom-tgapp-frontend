import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { FC, useEffect, useState } from "react";
import { ITransaction } from "src/entities/course/model/types";
import { TransactionsHistory } from "src/features/TransactionsHistory/TransactionsHistory";
import { WalletBalance } from "src/features/WalletBalance/WalletBalance";
import BottomSheet from "src/shared/components/BottomSheet/BottomSheet";
import NavBar from "src/shared/components/NavBar/NavBar";
import Credit_Card from "../../shared/assets/course/Credit_Card.svg";
import styles from "./WalletWidget.module.css";
import {
  fetchUserByTelegramIdV1,
  authorizeUser,
} from "src/entities/user/model/fetchUser";
import MyDataCard from "src/shared/components/MyDataCard/MyDataCard";
import { getTelegramUserId, getTelegramWebApp } from "src/shared/lib/telegram";

export const WalletWidget: FC = () => {
  const id = getTelegramUserId();

  const [selectedTransaction, setSelectedTransaction] = useState<{
    transaction: ITransaction;
    tType: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formattedBalance, setFormattedBalance] = useState<string>("0");

  const webApp = getTelegramWebApp();
  console.log("initDataUnsafe", webApp?.initDataUnsafe);

  useEffect(() => {
    const checkAndAuthorizeUser = async () => {
      try {
        if (!id) return;
        const user = await fetchUserByTelegramIdV1(id.toString());
        if (!user) {
          // Собираем все нужные данные из initDataUnsafe
          const tgData = webApp?.initDataUnsafe;
          const payload = {
            auth_date: tgData.auth_date,
            first_name: tgData.user?.first_name,
            hash: tgData.hash,
            id: tgData.user?.id,
            last_name: tgData.user?.last_name,
            photo_url: tgData.user?.photo_url,
            username: tgData.user?.username,
          };
          await authorizeUser(payload);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkAndAuthorizeUser();
  }, [id, webApp?.initDataUnsafe]);

  useEffect(() => {
    if (selectedTransaction) {
      setIsOpen(true);
    }
  }, [selectedTransaction]);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Сегодня";
    if (isYesterday(date)) return "Вчера";
    return format(date, "d MMMM, EEEE", { locale: ru });
  };

  return (
    <div className={styles["wallet"]}>
      <h1 className={styles["wallet__title"]}>Кошелёк</h1>

      <WalletBalance onBalanceChange={setFormattedBalance} />

      <MyDataCard
        title="Пройдите верификацию"
        description="Пройди верификацию, чтобы получить доступ к расширенному функционалу"
        verifyed="На модерации"
        path="/"
      />

      <TransactionsHistory
        onSelectTransaction={(data) => {
          if (data.transaction) {
            setSelectedTransaction(data);
          }
        }}
      />
      <NavBar />

      {isOpen && (
        <BottomSheet
          className={styles["wallet-widget__bottom-sheet"]}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className={styles["wallet-widget"]}>
            <div className={styles["wallet-widget__wrapper-main-info"]}>
              <p className={styles["wallet-widget__transaction-date"]}>
                {formatDate(selectedTransaction?.transaction.date || "")}
              </p>
              <p className={styles["wallet-widget__transaction-amount"]}>
                {selectedTransaction?.transaction.return_status === 2 &&
                selectedTransaction.transaction.buyer === id
                  ? `+ ${selectedTransaction?.transaction.price} ₽`
                  : selectedTransaction?.tType === "Покупка"
                  ? `- ${selectedTransaction?.transaction.price} ₽`
                  : `+ ${selectedTransaction?.transaction.price} ₽`}
              </p>
              <p className={styles["wallet-widget__transaction-type"]}>
                {selectedTransaction?.transaction.return_status === 2 &&
                selectedTransaction?.transaction.buyer === id
                  ? "Возврат (в вашу пользу)"
                  : "Возврат (не в вашу пользу)"}
                {selectedTransaction?.transaction.return_status === 0 &&
                  selectedTransaction?.tType}
              </p>
              <p className={styles["wallet-widget__transaction-id"]}>
                Transaction UID: {selectedTransaction?.transaction.id}
              </p>
            </div>

            <div className={styles["wallet-widget__wrapper-payment-method"]}>
              <div className={styles["wallet-widget__payment-method"]}>
                <p className={styles["wallet-widget__payment-method-title"]}>
                  Способ оплаты
                </p>
                <div
                  className={styles["wallet-widget__payment-method-details"]}
                >
                  <img
                    src={Credit_Card}
                    alt=""
                    className={
                      styles["wallet-widget__payment-method-details-img"]
                    }
                  />
                  <p
                    className={
                      styles["wallet-widget__payment-method-details-desc"]
                    }
                  >
                    Оплата{" "}
                    {selectedTransaction?.transaction.method === "Card"
                      ? "картой"
                      : "криптовалютой"}
                  </p>
                </div>
              </div>

              <div className={styles["wallet-widget__balance"]}>
                <p className={styles["wallet-widget__payment-method-title"]}>
                  Кошелёк
                </p>
                <div className={styles["wallet-widget__balance-details"]}>
                  <p className={styles["wallet-widget__balance-details-title"]}>
                    Основной счёт
                  </p>
                  <p
                    className={styles["wallet-widget__balance-details-numbers"]}
                  >
                    {formattedBalance} ₽
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
