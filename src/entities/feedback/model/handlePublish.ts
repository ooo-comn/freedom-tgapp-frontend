import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../shared/config/api";

const handlePublish = (
  revValue: string,
  sliderValue: number,
  contactId: string | undefined,
  setModalFillOpen: (open: boolean) => void,
  navigate: ReturnType<typeof useNavigate>,
  userId?: string
) => {
  if (revValue === "" || sliderValue === 0) {
    setModalFillOpen(true);
  } else {
    // Получаем ID текущего пользователя (автор отзыва)
    const authorId = window.Telegram.WebApp.initDataUnsafe.user.id;

    // Подготавливаем данные для отправки
    const reviewData = {
      author_id: authorId,
      contact_id: Number(contactId), // ID контакта кому ставят отзыв
      rating: sliderValue,
      comment: revValue,
    };

    console.log("Sending review:", reviewData);

    fetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${window.Telegram.WebApp.initData}`,
      },
      body: JSON.stringify(reviewData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Review sent successfully:", data);
        navigate(`/user/${userId}`); // Возвращаемся к профилю пользователя
      })
      .catch((error) => {
        console.error("Error sending review:", error);
        // Можно показать пользователю ошибку
      });
  }
};

export default handlePublish;
