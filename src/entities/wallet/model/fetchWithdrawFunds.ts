import { API_BASE_URL } from "../../../shared/config/api";
import { getTelegramAuthHeader } from "../../../shared/lib/telegram";

interface WithdrawRequest {
  address: string;
  amount: number;
}

interface WithdrawResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
}

export const fetchWithdrawFunds = async (
  request: WithdrawRequest
): Promise<WithdrawResponse> => {
  const response = await fetch(`${API_BASE_URL}/wallet/withdraw/`, {
    method: "POST",
    headers: {
      Authorization: getTelegramAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to withdraw funds");
  }

  const data = await response.json();
  return data;
};
