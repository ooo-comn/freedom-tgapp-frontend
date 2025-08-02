import { FC, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { calculateRating } from "src/entities/course/lib/calculateRating";
import {
  IContact,
  IReview,
  ITelegramUser,
} from "src/entities/course/model/types";
// import { fetchFeedbacks } from "src/entities/feedback/model/fetchFeedback";
import { fetchReviewsByContactId } from "src/entities/feedback/model/fetchReviewsByContactId";
import handlePublish from "src/entities/feedback/model/handlePublish";
import { fetchContactByTelegramId } from "src/entities/user/model/fetchContact";
import { fetchUserById } from "src/entities/user/model/fetchUserById";
import StarFeedbackIcon from "src/shared/assets/course/StarFeedback.svg";
import BottomSheet from "src/shared/components/BottomSheet/BottomSheet";
import MainButton from "src/shared/components/MainButton/MainButton";
import ModalNotification from "src/shared/components/ModalNotification/ModalNotification";
import StarRating from "src/shared/components/StarRating/StarRating";
import EmptyStar from "../../shared/assets/feedback/EmptyStar.svg";
import FillStar from "../../shared/assets/feedback/FillStar.svg";
// import { BASE_URL } from "../../shared/config/api";
import styles from "./FeedbackPage.module.css";
import FeedbackCard from "./ui/FeedbackCard/FeedbackCard";

const FeedbackPage: FC<{ isFullCourses: boolean }> = ({ isFullCourses }) => {
  window.scrollTo(0, 0);

  const location = useLocation();
  const isUserFeedback = location.pathname.startsWith("/user-feedback/");

  const navigate = useNavigate();
  const { id } = useParams();
  const [feedbacks, setFeedbacks] = useState<IReview[]>([]);
  const [users, setUsers] = useState<Record<number, ITelegramUser>>({});
  const [contacts, setContacts] = useState<Record<number, IContact>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [revValue, setRevValue] = useState("");
  const [modalFillOpen, setModalFillOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ITelegramUser | null>(null);
  const [currentContact, setCurrentContact] = useState<IContact | null>(null);

  console.log("userRating", userRating);

  // Получаем ID текущего пользователя
  const currentLoggedUserId = window.Telegram.WebApp.initDataUnsafe.user?.id;

  // Проверяем, является ли текущий пользователь владельцем страницы
  const isOwnProfile =
    currentLoggedUserId &&
    currentUser &&
    currentLoggedUserId === currentUser.id;

  // Проверяем, оставлял ли текущий пользователь уже отзыв
  const hasUserAlreadyReviewed = useMemo(() => {
    const hasReviewed = feedbacks.some(
      (review) => review.author_id === currentLoggedUserId
    );
    console.log(
      `User ${currentLoggedUserId} has already reviewed: ${hasReviewed}`
    );
    console.log(
      "Reviews authors:",
      feedbacks.map((r) => r.author_id)
    );
    return hasReviewed;
  }, [feedbacks, currentLoggedUserId]);

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.history.back();
    // navigate(`/course/${id}`)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isFullCourses && currentContact?.id) {
          console.log(
            `FeedbackPage: Fetching reviews for contact_id: ${currentContact.id}`
          );
          const feedbackData = await fetchReviewsByContactId(currentContact.id);
          console.log("FeedbackPage: Fetched reviews:", feedbackData);
          setFeedbacks(feedbackData);

          const authorIds = feedbackData
            .map((review) => review.author_id)
            .filter((id): id is number => typeof id === "number");

          const usersData = await Promise.all(
            authorIds.map((authorId) => fetchUserById(authorId))
          );

          const usersMap = usersData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {} as Record<number, ITelegramUser>);

          // Загружаем контакты авторов для получения изображений
          const contactsData = await Promise.all(
            usersData.map((user) => fetchContactByTelegramId(String(user.id)))
          );

          const contactsMap = contactsData.reduce((acc, contact, index) => {
            const userId = usersData[index].id;
            acc[userId] = contact;
            return acc;
          }, {} as Record<number, IContact>);

          console.log("FeedbackPage: Loaded users:", usersMap);
          console.log("FeedbackPage: Loaded contacts:", contactsMap);

          setUsers(usersMap);
          setContacts(contactsMap);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [id, isFullCourses, currentContact?.id]);

  useEffect(() => {
    const loadCurrentUserData = async () => {
      try {
        if (id) {
          // Загружаем данные пользователя по id из параметров URL
          const user = await fetchUserById(Number(id));
          setCurrentUser(user);

          // Загружаем данные контакта пользователя
          const contact = await fetchContactByTelegramId(String(user.id));
          setCurrentContact(contact);
        }
      } catch (error) {
        console.error("Error loading current user data:", error);
      }
    };

    loadCurrentUserData();
  }, [id]);

  const averageRate = useMemo(() => {
    return feedbacks.length > 0 ? calculateRating(feedbacks) : 0;
  }, [feedbacks]);

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < averageRate ? FillStar : EmptyStar
  );

  const handleOkBtnClick = () => {
    setModalFillOpen(false);
    window.document.body.style.overflow = "visible";
    document.documentElement.style.overflow = "visible";
  };

  const handleRevChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    setRevValue(value);
  };

  const handlePublishClick = () => {
    const contactId = currentContact?.id?.toString();
    handlePublish(
      revValue,
      userRating,
      contactId,
      setModalFillOpen,
      navigate,
      id
    );
    window.document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  };

  return (
    <div className={styles["feedback-page"]}>
      <div className={styles["feedback-page__header"]}>
        <div className={styles["feedback-page__title-wrapper"]}>
          <h1 className={styles["feedback-page__title"]}>Отзывы</h1>
          <p className={styles["feedback-page__count"]}>{feedbacks.length}</p>
        </div>
        <div className={styles["feedback-page__rating"]}>
          <h2 className={styles["feedback-page__rating-value"]}>
            {averageRate}
          </h2>
          <div className={styles["feedback-page__rating-info"]}>
            <div className={styles["feedback-page__rating-bar"]}>
              {stars.map((star, index) => (
                <img
                  key={index}
                  className={styles["feedback-page__star"]}
                  src={star}
                  alt="Рейтинг звезда"
                />
              ))}
            </div>
            <p className={styles["feedback-page__rating-text"]}>
              Мнение пользователей
            </p>
          </div>
        </div>
      </div>
      <div className={styles["feedback-page__list"]}>
        {feedbacks.length > 0 ? (
          feedbacks.map((item, index) => (
            <FeedbackCard
              date={item.created_at}
              path={contacts[item.author_id]?.image_url || ""}
              text={item.comment || ""}
              university={users[item.author_id]?.university || ""}
              username={`${users[item.author_id]?.first_name || ""} ${
                users[item.author_id]?.last_name || ""
              }`}
              rating={item.rating}
              key={index}
            />
          ))
        ) : (
          <div className={styles["feedback-page__wrapper-empty"]}>
            <div className={styles["feedback-page__wrapper-empty-star"]}>
              <img
                src={StarFeedbackIcon}
                alt=""
                className={styles["feedback-page__empty-img"]}
              />
            </div>
            <div className={styles["feedback-page__wrapper-empty-text"]}>
              <h2 className={styles["feedback-page__empty-title"]}>
                Пока нет отзывов и оценок
              </h2>
              {!isUserFeedback && (
                <p className={styles["feedback-page__empty-text"]}>
                  Пользователь пока что без отзывов, и&nbsp;мы&nbsp;будем очень
                  рады, если ты&nbsp;станешь первым, кто его оценит!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {isUserFeedback && !isOwnProfile && !hasUserAlreadyReviewed && (
        <div className={styles["feedback-page__button"]}>
          <MainButton
            onClickEvent={() => setIsOpen(true)}
            text="Оставить отзыв"
          />
        </div>
      )}

      {isFullCourses && (
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className={styles["feedback-page__modal-title-wrapper"]}>
            <h2 className={styles["feedback-page__modal-title"]}>
              Оставить отзыв
            </h2>
            <div className={styles["feedback-page__modal-info-wrapper"]}>
              <div className={styles["feedback-page__modal-info"]}>
                <div className={styles["feedback-page__modal-user"]}>
                  <img
                    src={
                      currentContact?.image_url
                        ? `${currentContact.image_url}`
                        : ""
                    }
                    className={styles["feedback-page__modal-user-image"]}
                    alt=""
                  />
                  <h3 className={styles["feedback-page__modal-name"]}>
                    {currentUser?.first_name || ""}{" "}
                    {currentUser?.last_name || ""}
                  </h3>
                </div>
                <div className={styles["feedback-page__modal-course"]}>
                  <p className={styles["feedback-page__modal-course-name"]}>
                    {currentUser?.university || "Университет не указан"}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles["feedback-page__modal-rating"]}>
              <h2 className={styles["feedback-page__modal-rating-title"]}>
                Как вам пользователь?
              </h2>

              <StarRating onRate={(rating) => setUserRating(rating)} />
            </div>

            <div className={styles["feedback-page__modal-comment"]}>
              <h2 className={styles["feedback-page__modal-rating-title"]}>
                Комментарий
              </h2>
              <textarea
                className={styles["feedback-page__modal-textarea"]}
                name=""
                id=""
                value={revValue}
                onChange={handleRevChange}
                placeholder="Поделитесь своим мнением"
              ></textarea>
            </div>

            <div className={styles["feedback-page__modal-actions"]}>
              <button
                className={styles["feedback-page__modal-cancel"]}
                onClick={() => setIsOpen(false)}
              >
                Отменить
              </button>
              <button
                className={styles["feedback-page__modal-submit"]}
                onClick={handlePublishClick}
              >
                Отправить
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
      {modalFillOpen && (
        <ModalNotification
          text="Заполните все обязательные поля"
          title="Внимание"
          onClose={handleOkBtnClick}
        />
      )}
    </div>
  );
};

export default FeedbackPage;
