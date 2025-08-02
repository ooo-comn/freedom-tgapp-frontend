import { IContact } from "src/entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

export const fetchContactById = async (
  contactId: number
): Promise<IContact> => {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Проверяем, что контакт опубликован (is_visible === true)
    // Возвращаем контакт независимо от is_visible для совместимости, но логируем
    if (data && data.is_visible !== true) {
      console.log("Warning: Fetched contact is not visible:", contactId);
    }

    return data;
  } catch (error) {
    console.error("Ошибка при запросе к серверу:", error);
    throw error;
  }
};

export const fetchContactByTelegramId = async (
  telegramId: string
): Promise<IContact> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/contacts/user/${telegramId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Проверяем, что контакт опубликован (is_visible === true)
    // Возвращаем контакт независимо от is_visible (нужно для профилей пользователей)
    if (data && data.is_visible !== true) {
      console.log("Note: User's contact is not visible:", telegramId);
    }

    return data;
  } catch (error) {
    console.error("Ошибка при запросе к серверу:", error);
    throw error;
  }
};
