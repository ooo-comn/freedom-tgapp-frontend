/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchReviewsByContactId } from "src/entities/feedback/model/fetchReviewsByContactId";
import { fetchUserById } from "src/entities/user/model/fetchUserById";
import { calculateRating } from "../../entities/course/lib/calculateRating";
import {
  IContact,
  IReview,
  ITelegramUser,
} from "../../entities/course/model/types";
import ContactCard from "../../features/courses/components/ContactCard/ContactCard";
import styles from "./CardList.module.css";

const CardList: React.FC<{ contacts: IContact[] }> = ({ contacts }) => {
  console.log("CardList received contacts:", contacts);
  console.log("Contacts length:", contacts.length);

  const [users, setUsers] = useState<Record<number, ITelegramUser>>({});
  const [reviews, setReviews] = useState<Record<number, IReview[]>>({});

  useEffect(() => {
    const loadUsersAndReviews = async () => {
      console.log("Loading users and reviews for contacts:", contacts);
      const loadedUsers: Record<number, ITelegramUser> = {};
      const loadedReviews: Record<number, IReview[]> = {};

      for (const contact of contacts) {
        if (contact.user_id) {
          try {
            console.log(
              `Fetching user for contact with user_id: ${contact.user_id}`
            );
            const user = await fetchUserById(contact.user_id);
            loadedUsers[contact.user_id] = user;
          } catch (error) {
            console.error(
              `Ошибка при загрузке пользователя ${contact.user_id}:`,
              error
            );
          }
        }

        if (contact.id) {
          try {
            console.log(`Fetching reviews for contact with id: ${contact.id}`);
            const contactReviews = await fetchReviewsByContactId(contact.id);
            loadedReviews[contact.id] = contactReviews;
          } catch (error) {
            console.error(
              `Ошибка при загрузке отзывов для контакта ${contact.id}:`,
              error
            );
          }
        }
      }

      console.log("Loaded users:", Object.keys(loadedUsers).length);
      console.log("Loaded reviews:", Object.keys(loadedReviews).length);
      setUsers(loadedUsers);
      setReviews(loadedReviews);
    };

    if (contacts.length > 0) {
      loadUsersAndReviews();
    }
  }, [contacts]);

  console.log("Rendering CardList with users:", Object.keys(users).length);

  if (contacts.length === 0) {
    return (
      <div className={styles["card-list__main-wrapper-empty-courses"]}>
        <div className={styles["card-list__wrapper-empty-courses-texts"]}>
          <h2 className={styles["card-list__empty-courses-title"]}>
            Контакты не найдены
          </h2>
          <p className={styles["card-list__empty-courses-text"]}>
            Попробуйте другие фильтры
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["card-list"]}>
      {Object.keys(users).length > 0 ? (
        contacts.map((item, index) => {
          const user = item.user_id ? users[item.user_id] : undefined;
          const contactReviews = reviews[item.id ?? 0] || [];
          const averageRate =
            contactReviews.length > 0 ? calculateRating(contactReviews) : 0;

          return (
            <ContactCard
              key={index}
              itemCard={item}
              userPhoto={item?.image_url ?? ""}
              amountOfSales={item?.customer_count ?? 0}
              averageRate={averageRate}
              userName={user?.first_name ?? ""}
              userSecondName={user?.last_name ?? ""}
              university={user?.university ?? ""}
              count={contactReviews.length}
            />
          );
        })
      ) : (
        <div className={styles["card-list__main-wrapper-empty-courses"]}>
          <div className={styles["card-list__wrapper-empty-courses-texts"]}>
            <h2 className={styles["card-list__empty-courses-title"]}>
              Загрузка данных...
            </h2>
            <p className={styles["card-list__empty-courses-text"]}>
              Пожалуйста, подождите
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardList;
