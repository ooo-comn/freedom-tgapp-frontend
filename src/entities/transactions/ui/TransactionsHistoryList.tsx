import { FC } from "react";
import { ITransaction } from "src/entities/course/model/types";
// import { fetchUserTransactions } from "src/entities/wallet/model/fetchUserTransactions";
// import { getTelegramUserId } from "src/shared/lib/telegram";
// import TransactionCard from "src/shared/components/TransactionCard/TransactionCard";
// import LogoTransaction from "../../../shared/assets/wallet/LogoTransaction.svg";
import styles from "./TransactionsHistoryList.module.css";

// const formatDate = (dateString: string) => {
//   const date = parseISO(dateString);

//   if (isToday(date)) return "Сегодня";
//   if (isYesterday(date)) return "Вчера";

//   return format(date, "d MMMM, EEEE", { locale: ru });
// };

// const groupTransactionsByDate = (transactions: ITransaction[]) => {
//   return transactions.reduce((acc, transaction) => {
//     const dateKey = formatDate(transaction.date);
//     if (!acc[dateKey]) {
//       acc[dateKey] = [];
//     }
//     acc[dateKey].push(transaction);
//     return acc;
//   }, {} as Record<string, ITransaction[]>);
// };

export const TransactionsHistoryList: FC<{
  onSelectTransaction: (data: {
    transaction: ITransaction;
    tType: string;
  }) => void;
}> = () => {
  // const id = getTelegramUserId();

  // const [coursesPaid, setCoursesPaid] = useState<ITransaction[]>([]);
  // const [coursesSelled, setCoursesSelled] = useState<ITransaction[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!id) return;
  //     const result = await fetchUserTransactions(id.toString());

  //     if (result) {
  //       setCoursesPaid(result.paid_courses || []);
  //       setCoursesSelled(result.selled_courses || []);
  //     }
  //   };

  //   fetchData();
  // }, [id]);

  // const allTransactions: ITransaction[] = [
  //   ...(coursesPaid || []),
  //   ...(coursesSelled || []),
  // ];

  // const groupedTransactions = Object.entries(
  //   groupTransactionsByDate(allTransactions)
  // ).sort(
  //   (a, b) =>
  //     new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()
  // );

  return (
    <>
      <div className={styles["transactions-history-list__wrapper-empty"]}>
        <p className={styles["transactions-history-list__empty-text"]}>
          История транзакций пока пуста
        </p>
      </div>
    </>
  );
};
