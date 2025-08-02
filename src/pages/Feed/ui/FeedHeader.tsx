// import PhoneIcon from "../../../shared/assets/course/Phone.svg";
import styles from "../Feed.module.css";

const FeedHeader = () => {
  return (
    <div className={styles["feed__header"]}>
      <h1 className={styles["feed__title"]}>Контакты</h1>
      {/* <button className={styles['feed__create-button']}>
				<p className={styles['feed__create-button-count']}>10</p>
				<img
					src={PhoneIcon}
					alt='Количество оставшихся номеров'
					className={styles['feed__create-button-img']}
				/>
			</button> */}
    </div>
  );
};

export default FeedHeader;
