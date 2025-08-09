import { useQuery } from "@tanstack/react-query";
import { getTelegramUserId } from "src/shared/lib/telegram";
import { fetchJson, setWalletAddressHeader } from "src/shared/lib/fetcher";

interface UserBalanceItem {
  amount: number;
  contract: string;
  id: number;
  telegram_id: string;
}

interface UserPayload {
  balance: UserBalanceItem[];
  created_at: string;
  id: number;
  telegram_id: string;
  updated_at: string;
  wallet_address: string;
  wallet_private_key: string;
}

interface UserResponse {
  message: string;
  success: boolean;
  user: UserPayload;
}

export interface UserWalletData {
  address: string;
  balanceAmount: number;
}

const fetchUserWallet = async (telegramId: string): Promise<UserWalletData> => {
  const data = await fetchJson<UserResponse>(
    `https://comnapp.ru/api/v1/user/${telegramId}`
  );
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch user data");
  }
  // Сохраняем адрес в заголовке для последующих запросов
  if (data.user.wallet_address) {
    setWalletAddressHeader(data.user.wallet_address);
  }
  return {
    address: data.user.wallet_address || "",
    balanceAmount: data.user.balance?.[0]?.amount || 0,
  };
};

export const useUserWallet = () => {
  const telegramId = getTelegramUserId();
  return useQuery({
    queryKey: ["userWallet", telegramId],
    queryFn: () => fetchUserWallet(telegramId?.toString() || ""),
    enabled: !!telegramId,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};
