import { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import FilterIcon from "../../../shared/assets/feed/FilterIcon.svg";
import styles from "../Feed.module.css";

interface FeedSearchProps {
  inputValue: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const FeedSearch = ({ inputValue, onChange }: FeedSearchProps) => {
  return (
    <div className={styles["feed__top-panel"]}>
      <input
        className={styles["feed__search"]}
        onChange={onChange}
        placeholder="Название контакта"
        value={inputValue}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className={styles["feed__search-icon"]}
      >
        <path
          d="M8.5 0.5C5.74414 0.5 3.5 2.74414 3.5 5.5C3.5 6.69727 3.91992 7.79492 4.625 8.65625L0.640625 12.6406L1.35938 13.3594L5.34375 9.375C6.20508 10.0801 7.30273 10.5 8.5 10.5C11.2559 10.5 13.5 8.25586 13.5 5.5C13.5 2.74414 11.2559 0.5 8.5 0.5ZM8.5 1.5C10.7148 1.5 12.5 3.28516 12.5 5.5C12.5 7.71484 10.7148 9.5 8.5 9.5C6.28516 9.5 4.5 7.71484 4.5 5.5C4.5 3.28516 6.28516 1.5 8.5 1.5Z"
          fill="#FBFBFB"
        />
      </svg>
      <Link to="/filters">
        <button className={styles["feed__filter-button"]}>
          <img
            src={FilterIcon}
            alt="Кнопка фильтра"
            className={styles["feed__filter-button-img"]}
          />
        </button>
      </Link>
    </div>
  );
};

export default FeedSearch;
