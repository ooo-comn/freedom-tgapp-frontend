import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ITelegramUser } from "../../../entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

const useUserContactsData = (
  user_id: number,
  navigate: ReturnType<typeof useNavigate>
): {
  userContacts: ITelegramUser[];
  isLoading: boolean;
  error: string | null;
} => {
  const [userContacts, setUserContacts] = useState<ITelegramUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/contacts/user/${user_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `tma ${window.Telegram.WebApp.initData}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: ITelegramUser[] = await response.json();

        console.log("contacts result:", result);

        if (!result || result.length === 0) {
          setUserContacts([]);
          sessionStorage.setItem("userContacts", JSON.stringify([]));
          navigate("/landing");
        } else {
          setUserContacts(result);
          sessionStorage.setItem("userContacts", JSON.stringify(result));
        }
      } catch (error) {
        console.error("Ошибка загрузки контактов:", error);
        setError("Ошибка загрузки данных");
        setUserContacts([]);
        navigate("/landing");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user_id, navigate]);

  return { userContacts, isLoading, error };
};

export default useUserContactsData;
