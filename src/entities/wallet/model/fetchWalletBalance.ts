import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../shared/config/api"
import { getTelegramAuthHeader } from "../../../shared/lib/telegram";;

interface WalletBalanceResponse {
  balance: number;
  currency: string;
}

const fetchWalletBalance = async (): Promise<WalletBalanceResponse> => {
  const response = await fetch(`${API_BASE_URL}/wallet/balance/`, {
    method: "GET",
    headers: {
      Authorization: getTelegramAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wallet balance");
  }

  const data = await response.json();
  return data;
};

export const useWalletBalance = () => {
  return useQuery({
    queryKey: ["walletBalance"],
    queryFn: fetchWalletBalance,
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    refetchIntervalInBackground: true,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
