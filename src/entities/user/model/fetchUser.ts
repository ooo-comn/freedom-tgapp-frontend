import { ITelegramUser } from "src/entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

export const fetchUser = async (
  telegram_id: string
): Promise<ITelegramUser> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/?telegram_id=${telegram_id}`,
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
    return data[0];
  } catch (error) {
    console.error("Ошибка при запросе к серверу:", error);
    throw error;
  }
};

export const fetchUserByUserId = async (
  user_id: number
): Promise<ITelegramUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/?user_id=${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Ошибка при запросе к серверу:", error);
    throw error;
  }
};

export const fetchUserByTelegramIdV1 = async (telegram_id: string) => {
  try {
    const response = await fetch(
      `http://comnapp.ru:8080/api/v1/user/${telegram_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка при запросе пользователя v1:", error);
    throw error;
  }
};

export const authorizeUser = async (payload: any) => {
  try {
    const response = await fetch("http://comnapp.ru:8080/api/v1/authorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка при авторизации пользователя:", error);
    throw error;
  }
};
