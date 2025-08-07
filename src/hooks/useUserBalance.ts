import { useQuery } from "@tanstack/react-query";
import { getTelegramUserId } from "src/shared/lib/telegram";

interface UserBalance {
  amount: number;
  contract: string;
  id: number;
  telegram_id: string;
}

interface UserResponse {
  message: string;
  success: boolean;
  user: {
    balance: UserBalance[];
    created_at: string;
    id: number;
    telegram_id: string;
    updated_at: string;
    wallet_address: string;
    wallet_private_key: string;
  };
}

const fetchUserBalance = async (telegramId: string): Promise<number> => {
  const response = await fetch(`https://comnapp.ru/api/v1/user/${telegramId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: UserResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch user balance");
  }

  // Возвращаем первый баланс или 0, если балансов нет
  return data.user.balance?.[0]?.amount || 0;
};

export const useUserBalance = () => {
  const telegramId = getTelegramUserId();

  return useQuery({
    queryKey: ["userBalance", telegramId],
    queryFn: () => fetchUserBalance(telegramId?.toString() || ""),
    enabled: !!telegramId,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};
