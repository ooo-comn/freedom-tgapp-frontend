import { API_BASE_URL } from "src/shared/config/api";

export const fetchUniversities = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/universities`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при загрузке списка университетов:", error);
    throw error;
  }
};
