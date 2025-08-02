import { IReview } from "src/entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

export const fetchReviewsByContactId = async (
  contactId: number
): Promise<IReview[]> => {
  try {
    const url = `${API_BASE_URL}/reviews/?contact_id=${contactId}`;
    console.log(`Making request to: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${window.Telegram.WebApp.initData}`,
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${errorText}`);
      throw new Error("Ошибка при получении отзывов");
    }

    const data = await response.json();
    console.log(`Received reviews data:`, data);

    // API возвращает объект с полем data, содержащим массив отзывов
    if (data && data.data && Array.isArray(data.data)) {
      console.log(`Returning reviews array:`, data.data);
      return data.data;
    }

    // Если формат не соответствует ожидаемому, возвращаем пустой массив
    console.warn("Unexpected response format, returning empty array");
    return [];
  } catch (error) {
    console.error(
      `Ошибка при загрузке отзывов для контакта ${contactId}:`,
      error
    );
    return []; // Возвращаем пустой массив в случае ошибки
  }
};
