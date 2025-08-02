import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/providers/store";
import { IContact } from "src/entities/course/model/types";
// import { useUserCourses } from "src/entities/course/model/useUserCourses";
import { fetchReviewsByContactId } from "src/entities/feedback/model/fetchReviewsByContactId";
import { fetchContactByTelegramId } from "src/entities/user/model/fetchContact";
import { fetchUserByUserId } from "src/entities/user/model/fetchUser";
import {
  setLoading,
  setUserProfile,
} from "src/entities/user/model/userProfileSlice";

export const useUserProfile = () => {
  const [contactData, setContactData] = useState<IContact>();

  const dispatch = useDispatch();
  const {
    userData,
    coursesData,
    feedbacks,
    isNotify,
    selectedOptionsProfile,
    uniValueProfile,
    loading,
    error,
  } = useSelector((state: RootState) => state.userProfile);

  const { id } = window.Telegram.WebApp.initDataUnsafe.user;
  const userId = id; // Теперь telegram_id и user_id одинаковые

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(setLoading(true));

        console.log("Loading user profile for user_id:", userId);

        // Fetch user data directly by user_id (which is same as telegram_id now)
        const user = await fetchUserByUserId(userId);

        if (!user) {
          throw new Error("User data not found");
        }

        // Fetch contact data from /contacts/user/{user_id} endpoint to get image_url
        const contact = await fetchContactByTelegramId(String(userId));
        console.log("useUserProfile - Fetched contact:", contact);
        console.log("useUserProfile - Contact ID for reviews:", contact.id);

        const reviews = contact.id
          ? await fetchReviewsByContactId(contact.id)
          : [];
        console.log("useUserProfile - Fetched reviews:", reviews);
        console.log("useUserProfile - Reviews count:", reviews?.length || 0);

        setContactData(contact);

        dispatch(
          setUserProfile({
            userData: user,
            coursesData: contact,
            feedbacks: reviews || [],
            isNotify: user.notify || false,
            selectedOptionsProfile: contact.subjects || [],
            uniValueProfile: user.university || "",
          })
        );
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadData();
  }, [dispatch, userId]);

  return {
    userData,
    coursesData,
    feedbacks,
    isNotify,
    selectedOptionsProfile,
    uniValueProfile,
    loading,
    contactData,
    error,
  };
};
