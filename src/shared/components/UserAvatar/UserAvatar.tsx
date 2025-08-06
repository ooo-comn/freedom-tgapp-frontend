import { FC } from "react";
import { Skeleton } from "@mui/material";
import { useTelegramUserData } from "src/hooks/useTelegramUserData";
import defaultAvatar from "src/shared/assets/profile/avatar.png";
import styles from "./UserAvatar.module.css";

interface UserAvatarProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  size = "medium",
  className = "",
}) => {
  const { data: telegramUser, isLoading } = useTelegramUserData();

  if (isLoading) {
    return (
      <Skeleton
        variant="circular"
        className={`${styles.avatar} ${styles[`avatar--${size}`]} ${className}`}
      />
    );
  }

  return (
    <img
      src={telegramUser?.photo_url || defaultAvatar}
      alt="Аватар пользователя"
      className={`${styles.avatar} ${styles[`avatar--${size}`]} ${className}`}
    />
  );
};
