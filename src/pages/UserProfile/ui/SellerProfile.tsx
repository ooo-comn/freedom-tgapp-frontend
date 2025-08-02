import { Skeleton } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { calculateRating } from "src/entities/course/lib/calculateRating";
import {
  IContact,
  IReview,
  ITelegramUser,
} from "src/entities/course/model/types";
import { fetchReviewsByContactId } from "src/entities/feedback/model/fetchReviewsByContactId";
import { fetchContactByTelegramId } from "src/entities/user/model/fetchContact";
import { fetchUserById } from "src/entities/user/model/fetchUserById";
import { checkContactIsFavorite } from "src/entities/user/model/fetchContacts";
// import Feedback from "src/shared/components/Feedback/Feedback";
import NavBar from "src/shared/components/NavBar/NavBar";
// import Sales from "src/shared/components/Sales/Sales";
import useTheme from "src/shared/hooks/useTheme";
import { API_BASE_URL } from "src/shared/config/api";
import styles from "./UserProfile.module.css";
import Heart from "../../../shared/assets/feed/Heart.svg";
import HeartFill from "../../../shared/assets/feed/HeartFill.svg";
// import LinkShare from "../../../shared/assets/feed/Link.svg";
import FillStar from "src/shared/assets/feedback/FillStar.svg";
import EmptyStar from "src/shared/assets/feedback/EmptyStar.svg";

const SellerProfile: FC = () => {
  window.scrollTo(0, 0);
  const { id } = useParams<{ id: string }>();

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.history.back();
  });

  const [userData, setUserData] = useState<ITelegramUser | null>(null);
  const [contactData, setContactData] = useState<IContact | null>(null);
  const [feedbacks, setFeedbacks] = useState<IReview[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSellerData = async () => {
      if (!id) return;

      try {
        // setLoading(true);

        // Получаем данные пользователя по ID
        const user = await fetchUserById(Number(id));
        setUserData(user);

        console.log("user.telegram_id:", user.telegram_id);
        console.log("user.id:", user.id);

        // Получаем данные контакта по user_id (который теперь равен telegram_id)
        const contact = await fetchContactByTelegramId(String(user.id));
        console.log("Fetched contact:", contact);
        console.log("Contact ID for reviews:", contact.id);
        setContactData(contact);

        // Получаем отзывы по contact.id
        if (contact.id) {
          console.log(`Fetching reviews for contact_id: ${contact.id}`);
          const reviews = await fetchReviewsByContactId(contact.id);
          console.log("Fetched reviews:", reviews);
          console.log("Reviews count:", reviews?.length || 0);
          setFeedbacks(reviews || []);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных продавца:", error);
      } finally {
        // setLoading(false);
      }
    };

    loadSellerData();
  }, [id]);

  // Проверяем статус избранного при загрузке контакта
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!contactData?.id) return;

      try {
        console.log("Checking favorite status for contact:", contactData.id);

        const isFav = await checkContactIsFavorite(contactData.id);
        console.log("Is favorite:", isFav);
        setIsFavorite(isFav);
      } catch (error) {
        console.error("Ошибка при проверке статуса избранного:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [contactData?.id]);

  const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!contactData?.id) {
      console.error("Contact ID не найден");
      return;
    }

    try {
      const { id: userId } = window.Telegram.WebApp.initDataUnsafe.user;

      console.log(
        "Toggling favorite for contact:",
        contactData.id,
        "by user:",
        userId,
        "current status:",
        isFavorite
      );

      const response = await fetch(
        `${API_BASE_URL}/contacts/${contactData.id}/favorite?user_id=${userId}`,
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

        // Устанавливаем статус из ответа API, а не инвертируем текущий
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

  console.log("userData", userData);
  console.log("contactData", contactData);

  // const totalStudents = contactData?.customer_count;
  const averageRate = feedbacks?.length > 0 ? calculateRating(feedbacks) : 0.0;
  const { theme } = useTheme();

  // Создаем массив звезд для отображения рейтинга
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < Math.floor(averageRate) ? FillStar : EmptyStar
  );

  // Функция для склонения слова "отзыв"
  const getReviewsText = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${count} отзывов`;
    }

    if (lastDigit === 1) {
      return `${count} отзыв`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${count} отзыва`;
    }

    return `${count} отзывов`;
  };

  return (
    <div className={styles["user-profile"]}>
      <header className={styles["user-profile__header"]}>
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
                `https://t.me/ComnContactBot/ComnContactApp?startapp=user_${userData?.id}`
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
        {!userData ? (
          <>
            {theme === "dark" ? (
              <>
                <Skeleton
                  variant="circular"
                  animation="wave"
                  className={styles["user-profile__skeleton"]}
                  sx={{ bgcolor: "grey.800" }}
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  className={styles["user-profile__skeleton-name"]}
                  sx={{ bgcolor: "grey.800" }}
                />
              </>
            ) : theme === "light" ? (
              <>
                <Skeleton
                  variant="circular"
                  animation="wave"
                  className={styles["user-profile__skeleton"]}
                  sx={{ bgcolor: "grey.300" }}
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  className={styles["user-profile__skeleton-name"]}
                  sx={{ bgcolor: "grey.300" }}
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            <div
              className={styles["user-profile__avatar"]}
              style={{
                backgroundImage: `url(${contactData?.image_url})`,
              }}
            />
            <p className={styles["user-profile__name"]}>
              {userData?.first_name} {userData?.last_name}
            </p>
            <Link
              to={`/user-feedback/${userData?.id}`}
              className={styles["user-profile__rating-link"]}
            >
              <div className={styles["user-profile__rating"]}>
                <span className={styles["user-profile__rating-value"]}>
                  {averageRate.toFixed(1)}
                </span>
                <div className={styles["user-profile__rating-stars"]}>
                  {stars.map((star, index) => (
                    <img
                      key={index}
                      className={styles["user-profile__rating-star"]}
                      src={star}
                      alt="Рейтинг звезда"
                    />
                  ))}
                </div>
                <span className={styles["user-profile__rating-count"]}>
                  {getReviewsText(feedbacks?.length || 0)}
                </span>
              </div>
            </Link>
          </>
        )}
      </header>

      {/* <section className={styles["user-profile__stats"]}>
        <Sales count={totalStudents || 0} />
        <Feedback
          averageRate={averageRate}
          isCoursePage={false}
          path={`/user-feedback/${userData?.id}`}
          count={feedbacks.length}
        />
      </section> */}

      <section className={styles["user-profile__content"]}>
        <div className={styles["user-profile__section"]}>
          <h3 className={styles["user-profile__section-title"]}>Университет</h3>
          <p className={styles["user-profile__section-description"]}>
            {userData?.university || "Университет не указан"}
          </p>
        </div>
        <div className={styles["user-profile__line"]} />
        <div className={styles["user-profile__section"]}>
          <h3 className={styles["user-profile__section-title"]}>Предметы</h3>
          <div className={styles["user-profile__wrapper-subjects"]}>
            {contactData?.subjects?.length ? (
              contactData.subjects.map((option) => (
                <div
                  key={String(option)}
                  className={styles["user-profile__subject"]}
                >
                  {option}
                </div>
              ))
            ) : (
              <p className={styles["user-profile__section-description"]}>
                Предметы не указаны
              </p>
            )}
          </div>
        </div>
        <div className={styles["user-profile__line"]} />
        <div className={styles["user-profile__section"]}>
          <h3 className={styles["user-profile__section-title"]}>Типы работ</h3>
          <div className={styles["user-profile__wrapper-subjects"]}>
            {contactData?.work_types?.length ? (
              contactData.work_types.map((option) => (
                <div
                  key={String(option)}
                  className={styles["user-profile__subject"]}
                >
                  {option}
                </div>
              ))
            ) : (
              <p className={styles["user-profile__section-description"]}>
                Типы работ не указаны
              </p>
            )}
          </div>
        </div>
        <div className={styles["user-profile__line"]} />
        <div className={styles["user-profile__section"]}>
          <h3 className={styles["user-profile__section-title"]}>Описание</h3>
          <p className={styles["user-profile__section-description"]}>
            {userData?.description || "Расскажите о себе"}
          </p>
        </div>
        <div className={styles["user-profile__line"]} />
        <div className={styles["user-profile__section"]}>
          <h3 className={styles["user-profile__section-title"]}>
            Дата регистрации
          </h3>
          <p className={styles["user-profile__section-description"]}>
            {userData?.created_at
              ? new Date(userData.created_at).toLocaleDateString("ru-RU")
              : "Дата не указана"}
          </p>
        </div>
      </section>

      <button
        className={styles["user-profile__button-publish"]}
        onClick={() => {
          if (userData?.username) {
            const telegramLink = `https://t.me/${userData.username}`;
            if (window.Telegram?.WebApp) {
              window.Telegram.WebApp.openTelegramLink(telegramLink);
            } else {
              window.open(telegramLink, "_blank");
            }
          } else {
            console.error("Username пользователя не найден");
          }
        }}
        disabled={!userData?.username}
      >
        Написать в Telegram
      </button>

      <NavBar />
    </div>
  );
};

export default SellerProfile;
