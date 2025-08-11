import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../shared/config/api";
import {
  getTelegramAuthHeader,
  getTelegramUserId,
} from "../../../shared/lib/telegram";

interface UserBalance {
  id: number;
  telegram_id: string;
  balance: number;
  frozen_balance: number;
  created_at: string;
  updated_at: string;
}

interface WalletBalanceResponse {
  success: boolean;
  message: string;
  user_balance: UserBalance;
}

const fetchWalletBalance = async (): Promise<{
  balance: number;
  currency: string;
}> => {
  // Pre-sync balance with blockchain using telegram id in path
  try {
    const tgId = getTelegramUserId();
    if (tgId) {
      await fetch(`${API_BASE_URL}/balance/${tgId}/sync`, {
        method: "GET",
        headers: {
          Authorization: getTelegramAuthHeader(),
          "Content-Type": "application/json",
        },
      });
    }
  } catch (e) {
    // Non-blocking: proceed to read balance even if sync fails
    console.warn("Balance sync failed (non-blocking):", e);
  }

  const tgIdForRead = getTelegramUserId();
  const response = await fetch(`${API_BASE_URL}/balance/${tgIdForRead}`, {
    method: "GET",
    headers: {
      Authorization: getTelegramAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wallet balance");
  }

  const data: WalletBalanceResponse = await response.json();

  // Извлекаем баланс из правильного места в ответе
  return {
    balance: data.user_balance.balance,
    currency: "USDT",
  };
};

export const useWalletBalance = () => {
  return useQuery({
    queryKey: ["walletBalance"],
    queryFn: fetchWalletBalance,
    refetchInterval: 1 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 1 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
