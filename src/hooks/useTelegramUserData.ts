import { useQuery } from "@tanstack/react-query";

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

const getTelegramUserData = (): TelegramUserData => {
  const user = window.Telegram.WebApp.initDataUnsafe.user;
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url,
    language_code: user.language_code,
    is_premium: user.is_premium,
    allows_write_to_pm: user.allows_write_to_pm,
  };
};

export const useTelegramUserData = () => {
  return useQuery({
    queryKey: ["telegramUserData"],
    queryFn: getTelegramUserData,
    staleTime: Infinity, // Данные никогда не устаревают
    gcTime: Infinity, // Данные никогда не удаляются из кэша
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Экспортируем функцию для прямого доступа к данным без хука
export const getTelegramUserDataSync = (): TelegramUserData => {
  return getTelegramUserData();
};
