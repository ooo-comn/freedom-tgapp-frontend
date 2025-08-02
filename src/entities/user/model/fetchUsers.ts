import { ITelegramUser } from "src/entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

export const fetchAllUsers = async (): Promise<ITelegramUser[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${window.Telegram.WebApp.initData}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data: ITelegramUser[] = await response.json();
    console.log("Successfully fetched all users:", data.length);
    return data;
  } catch (error) {
    console.error("Ошибка при загрузке пользователей:", error);
    throw error;
  }
};
