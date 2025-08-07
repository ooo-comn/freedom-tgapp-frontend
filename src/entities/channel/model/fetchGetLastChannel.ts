import { API_BASE_URL } from "../../../shared/config/api";
import { getTelegramAuthHeader } from "../../../shared/lib/telegram";

export const fetchGetLastChannel = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-last-channel/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: getTelegramAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
