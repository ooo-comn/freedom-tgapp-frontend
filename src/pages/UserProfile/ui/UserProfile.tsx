import { Skeleton } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { calculateRating } from "src/entities/course/lib/calculateRating";
// import { fetchUserTransactions } from "src/entities/wallet/model/fetchUserTransactions";
// import Feedback from "src/shared/components/Feedback/Feedback";
// import MyDataCard from "src/shared/components/MyDataCard/MyDataCard";
import NavBar from "src/shared/components/NavBar/NavBar";
// import PartnershipCard from "src/shared/components/PartnershipCard/PartnershipCard";
// import Sales from "src/shared/components/Sales/Sales";
import useTheme from "src/shared/hooks/useTheme";
import { API_BASE_URL } from "src/shared/config/api";
import { useUserProfile } from "../model/useUserProfile";
import FillStar from "src/shared/assets/feedback/FillStar.svg";
import EmptyStar from "src/shared/assets/feedback/EmptyStar.svg";
import { calculateRating } from "src/entities/course/lib/calculateRating";
import styles from "./UserProfile.module.css";

const UserProfile: FC = () => {
  window.scrollTo(0, 0);
  const { id } = window.Telegram.WebApp.initDataUnsafe.user;

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.history.back();
  });

  // const [verifyed, setVerifyed] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const { userData, feedbacks, contactData } = useUserProfile();

  console.log("userData:", userData);
  console.log("contactData:", contactData);
  console.log("contactData.is_visible:", contactData?.is_visible);

  useEffect(() => {
    const fetchData = async () => {
      // const result = await fetchUserTransactions(id);
      // if (result) {
      //   setVerifyed(result.verifyed);
      // }
    };
    fetchData();
  }, [id]);

  // const totalStudents = coursesData?.customer_count;

  const averageRate = feedbacks?.length > 0 ? calculateRating(feedbacks) : 0.0;

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

  const handleToggleContactVisibility = async () => {
    if (!contactData?.id) {
      console.error("Contact ID не найден");
      return;
    }

    const isCurrentlyVisible = contactData.is_visible;
    const newVisibilityStatus = !isCurrentlyVisible;

    try {
      setIsPublishing(true);
      console.log(
        `${newVisibilityStatus ? "Publishing" : "Unpublishing"} contact:`,
        contactData.id
      );

      const response = await fetch(
        `${API_BASE_URL}/contacts/${contactData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `tma ${window.Telegram.WebApp.initData}`,
          },
          body: JSON.stringify({
            is_visible: newVisibilityStatus,
          }),
        }
      );

      console.log(
        "Toggle contact visibility response status:",
        response.status
      );

      if (response.ok) {
        const result = await response.json();
        console.log(
          `Контакт успешно ${
            newVisibilityStatus ? "опубликован" : "снят с публикации"
          }:`,
          result
        );

        // Перезагружаем страницу или обновляем состояние
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error(
          `Ошибка при ${
            newVisibilityStatus ? "публикации" : "снятии с публикации"
          } контакта:`,
          response.status,
          errorText
        );
        window.Telegram?.WebApp?.showAlert(
          `Ошибка при ${
            newVisibilityStatus ? "публикации" : "снятии с публикации"
          } контакта. Попробуйте еще раз.`
        );
      }
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      window.Telegram?.WebApp?.showAlert("Ошибка сети. Попробуйте еще раз.");
    } finally {
      setIsPublishing(false);
    }
  };

  const { theme } = useTheme();

  return (
    <div className={styles["user-profile"]}>
      <header className={styles["user-profile__header"]}>
        <h2 className={styles["user-profile__title"]}>Профиль</h2>
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

        <Link to={`/edit-profile/${userData?.id}`}>
          <button className={styles["user-profile__settings"]}>
            Настроить профиль
          </button>
        </Link>
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

      {/* <section className={styles["user-profile__content"]}>
        <MyDataCard
          title="Пройдите верификацию"
          description="Пройди верификацию, чтобы создавать объявления и начать зарабатывать на своих знаниях. Проверка занимает 3-4 рабочих дня"
          verifyed={verifyed}
          path="/verification-form"
        />
        <PartnershipCard />
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
      </section>
      <button
        className={styles["user-profile__button-publish"]}
        onClick={handleToggleContactVisibility}
        disabled={isPublishing}
      >
        {isPublishing
          ? contactData?.is_visible
            ? "Снимаем с публикации..."
            : "Публикуем..."
          : contactData?.is_visible
          ? "Снять с публикации"
          : "Опубликовать свой контакт"}
      </button>
      <NavBar />
    </div>
  );
};

export default UserProfile;
