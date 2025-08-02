import { useEffect, useState } from "react";
import { ITelegramUser } from "src/entities/course/model/types";
import { fetchAllUsers } from "src/entities/user/model/fetchUsers";

export const useAllUsers = () => {
  const [users, setUsers] = useState<ITelegramUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Проверяем кеш в sessionStorage
        const cachedUsers = sessionStorage.getItem("allUsers");
        if (cachedUsers) {
          const parsedUsers = JSON.parse(cachedUsers);
          console.log("Using cached users:", parsedUsers.length);
          setUsers(parsedUsers);
          setIsLoading(false);
          return;
        }

        // Загружаем с сервера
        const allUsers = await fetchAllUsers();
        setUsers(allUsers);

        // Кешируем результат
        sessionStorage.setItem("allUsers", JSON.stringify(allUsers));
      } catch (error) {
        console.error("Ошибка при загрузке всех пользователей:", error);
        setError("Ошибка загрузки пользователей");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  return { users, isLoading, error };
};
