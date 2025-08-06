import { FC } from "react";
import { Skeleton } from "@mui/material";
import { useTelegramUserData } from "src/hooks/useTelegramUserData";
import styles from "./UserName.module.css";

interface UserNameProps {
  showAt?: boolean;
  className?: string;
}

export const UserName: FC<UserNameProps> = ({
  showAt = true,
  className = "",
}) => {
  const { data: telegramUser, isLoading } = useTelegramUserData();

  if (isLoading) {
    return (
      <Skeleton variant="text" width={120} height={24} className={className} />
    );
  }

  const displayName = telegramUser?.username
    ? showAt
      ? `@${telegramUser.username}`
      : telegramUser.username
    : telegramUser?.first_name || "Пользователь";

  return (
    <span className={`${styles.userName} ${className}`}>{displayName}</span>
  );
};
