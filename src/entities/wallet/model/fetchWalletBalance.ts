import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../shared/config/api";
import {
  getTelegramAuthHeader,
  getTelegramUserId,
} from "../../../shared/lib/telegram";

interface WalletBalanceResponse {
  balance: number;
  currency: string;
}

const fetchWalletBalance = async (): Promise<WalletBalanceResponse> => {
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

  const data = await response.json();
  return data;
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
