import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "src/shared/config/api";
import { checkContactIsFavorite } from "src/entities/user/model/fetchContacts";
import Star from "../../../../shared/assets/course/StarFeedback.svg";
import Heart from "../../../../shared/assets/feed/Heart.svg";
import HeartFill from "../../../../shared/assets/feed/HeartFill.svg";
// import LinkShare from "../../../../shared/assets/feed/Link.svg";
import { IContactCard } from "../../../courses/types/IContactCard";
import styles from "./ContactCard.module.css";

const ContactCard: FC<IContactCard> = ({
  itemCard,
  userPhoto,
  userName,
  userSecondName,
  university,
  averageRate,
  count,
}) => {
  const fullName = `${userName || ""} ${userSecondName || ""}`.trim();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        console.log("Checking favorite status for contact:", itemCard.id);

        if (itemCard.id !== null) {
          const isFav = await checkContactIsFavorite(itemCard.id);
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error("Ошибка при проверке статуса избранного:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (itemCard.id) {
      checkFavoriteStatus();
    }
  }, [itemCard.id]);

  const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!itemCard.id) {
      console.error("Contact ID не найден");
      return;
    }

    try {
      const { id: userId } = window.Telegram.WebApp.initDataUnsafe.user;

      console.log(
        "Toggling favorite for contact:",
        itemCard.id,
        "by user:",
        userId,
        "current status:",
        isFavorite
      );

      const response = await fetch(
        `${API_BASE_URL}/contacts/${itemCard.id}/favorite?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `tma ${window.Telegram.WebApp.initData}`,
          },
        }
      );

      console.log("Toggle favorite response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Статус избранного изменен:", result);

        const newFavoriteStatus = result.is_favorite;
        console.log("Setting favorite to:", newFavoriteStatus);
        setIsFavorite(newFavoriteStatus);
      } else {
        console.error(
          "Ошибка при изменении статуса избранного:",
          response.status,
          await response.text()
        );
      }
    } catch (error) {
      console.error("Ошибка при запросе к серверу:", error);
    }
  };

  return (
    <Link to={`/user/${itemCard.user_id}`} className={styles["card"]}>
      <div className={styles["card__wrapper-user"]}>
        <div className={styles["card__user"]}>
          <div className={styles["card__userpic-wrapper"]}>
            <img
              className={styles["card__userpic"]}
              src={userPhoto || ""}
              alt="Аватар"
            />
          </div>
          <div className={styles["card__info"]}>
            <div>
              <h1 className={styles["card__name"]}>{fullName}</h1>
              <div className={styles["card__reviews"]}>
                <img
                  className={styles["card__reviews-star"]}
                  src={Star}
                  alt="Звезда"
                />
                <p className={styles["card__reviews-rate"]}>
                  {averageRate ? averageRate.toFixed(1) : "0.0"}
                </p>
                <p className={styles["card__reviews-rate"]}>({count || 0})</p>
              </div>
            </div>
            {/* <div className={styles["card__info-sales"]}>
            <p className={styles["card__info-sales-count"]}>{amountOfSales}</p>
            <p className={styles["card__info-sales-desc"]}>продаж</p>
          </div> */}
          </div>
        </div>

        <div className={styles["card__actions"]}>
          <button
            className={styles["card__action-btn"]}
            onClick={toggleFavorite}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={{ width: "4.79vw", height: "4.79vw" }}></div>
            ) : isFavorite ? (
              <img
                src={HeartFill}
                alt="Убрать из избранного"
                className={styles["card__action-icon"]}
              />
            ) : (
              <img
                src={Heart}
                alt="Добавить в избранное"
                className={styles["card__action-icon"]}
              />
            )}
          </button>
          {/* <button
            className={styles["card__action-btn"]}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const contactLink = `https://t.me/share/url?url=${encodeURIComponent(
                `https://t.me/ComnContactBot/ComnContactApp?startapp=user_${itemCard.user_id}`
              )}`;

              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.openLink(contactLink);
              } else {
                console.error("Telegram WebApp не доступен");
              }
            }}
          >
            <img
              src={LinkShare}
              alt="Отправить контакт"
              className={styles["card__action-icon"]}
            />
          </button> */}
        </div>
      </div>

      <p className={styles["card__uni"]}>{university}</p>
      <div className={styles["card__subjects"]}>
        <h1 className={styles["card__subtitle"]}>Предметы</h1>
        <div className={styles["card__tags"]}>
          {itemCard.subjects?.map((subject) => (
            <p key={String(subject)} className={styles["card__tag"]}>
              {subject}
            </p>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;
