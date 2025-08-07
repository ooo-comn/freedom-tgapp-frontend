import { API_BASE_URL } from "../../../shared/config/api";
import { getTelegramAuthHeader } from "../../../shared/lib/telegram";

export const fetchWithdraw = async () => {
  const response = await fetch(`${API_BASE_URL}/withdraw/`, {
    method: "POST",
    headers: {
      Authorization: getTelegramAuthHeader(),
    },
  });

  if (response.ok) {
    return true;
  } else {
    return false;
  }
};
