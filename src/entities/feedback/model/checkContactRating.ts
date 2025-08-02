import { fetchReviewsByContactId } from "./fetchReviewsByContactId";

export const checkContactHasHighRating = async (
  contactId: number
): Promise<boolean> => {
  try {
    const reviews = await fetchReviewsByContactId(contactId);

    if (reviews.length === 0) {
      return false; // Если нет отзывов, то не показываем в фильтре "4-5 звезд"
    }

    // Проверяем, есть ли отзывы с рейтингом >= 4
    const hasHighRating = reviews.some((review) => review.rating >= 4);

    console.log(
      `Contact ${contactId}: ${reviews.length} reviews, hasHighRating: ${hasHighRating}`
    );

    return hasHighRating;
  } catch (error) {
    console.error(`Ошибка при проверке рейтинга контакта ${contactId}:`, error);
    return false;
  }
};
