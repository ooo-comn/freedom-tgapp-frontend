import { ITelegramUser } from "src/entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

export const fetchUserById = async (userId: number): Promise<ITelegramUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data: ITelegramUser[] = await response.json();
    return data[0];
  } catch (error) {
    console.error("Ошибка при запросе к серверу:", error);
    throw error;
  }
};
