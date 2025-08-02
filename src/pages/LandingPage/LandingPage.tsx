import { FC } from "react";
import { Link } from "react-router-dom";
import useTheme from "src/shared/hooks/useTheme";
import styles from "./LandingPage.module.css";

const LandingPage: FC = () => {
  const { theme } = useTheme();

  console.log(theme);

  return (
    <div className={styles["landing"]}>
      <div className={styles["landing__wrapper"]}>
        <div className={styles["landing__content"]}>
          <h1 className={styles["landing__title"]}>Common Contact</h1>
          <p className={styles["landing__subtitle"]}>
            Контакты тех, кто поможет с&nbsp;учебными задачами
          </p>
        </div>

        <p className={styles["landing__agreement"]}>
          Продолжая создание профиля, я принимаю{" "}
          <Link
            to="https://disk.yandex.ru/i/h6bWlwR6L5B8fg"
            target="_blank"
            onClick={(event) => {
              event.preventDefault();
              window.open("https://disk.yandex.ru/i/h6bWlwR6L5B8fg");
            }}
            className={styles["landing__agreement-link"]}
          >
            пользовательское соглашение
          </Link>{" "}
          и{" "}
          <Link
            to="https://disk.yandex.ru/i/Il8aGfCCgzVbnw"
            target="_blank"
            onClick={(event) => {
              event.preventDefault();
              window.open("https://disk.yandex.ru/i/Il8aGfCCgzVbnw");
            }}
            className={styles["landing__agreement-link"]}
          >
            политику конфиденциальности
          </Link>
        </p>
        <Link to="/registration">
          <button className={styles["landing__button"]}>Создать профиль</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
