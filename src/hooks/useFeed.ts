import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { IContact, ITelegramUser } from "src/entities/course/model/types";
import {
  fetchContacts,
  ContactsParams,
} from "src/entities/user/model/fetchContacts";
import { checkContactHasHighRating } from "src/entities/feedback/model/checkContactRating";
import { useFilters } from "src/shared/contexts/FiltersContext";

export const useFeed = (
  activeFilter: string,
  userContacts: ITelegramUser[] = [],
  currentUserId?: number
) => {
  const { filters } = useFilters();
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [contactsData, setContactsData] = useState<IContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFilteredContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Используем разные параметры в зависимости от выбранного фильтра
      const params: ContactsParams = {
        limit: 100,
        // Добавляем фильтры из контекста
        subjects: filters.subjects.length > 0 ? filters.subjects : undefined,
        workTypes: filters.workTypes.length > 0 ? filters.workTypes : undefined,
        universities:
          filters.universities.length > 0 ? filters.universities : undefined,
        rating: filters.rating,
        sortBy: filters.sortBy !== "По умолчанию" ? filters.sortBy : undefined,
      };

      if (activeFilter === "Недавние") {
        params.latest = true;
      } else if (activeFilter === "Избранные") {
        params.favorites = true;
      }

      console.log("Fetching contacts with params:", params);
      let contacts = await fetchContacts(params);
      console.log("Fetched contacts:", contacts);

      // Применяем фильтрацию по рейтингу на клиенте
      if (filters.rating) {
        console.log("Applying rating filter (4-5 stars)...");
        const ratingPromises = contacts.map(async (contact) => {
          if (contact.id === null) return false;
          const hasHighRating = await checkContactHasHighRating(contact.id);
          return hasHighRating;
        });

        const ratingResults = await Promise.all(ratingPromises);
        contacts = contacts.filter((_, index) => ratingResults[index]);

        console.log(
          `Filtered by rating: ${contacts.length} contacts with 4-5 star reviews`
        );
      }

      setContactsData(contacts);
    } catch (error) {
      console.error("Error fetching filtered contacts:", error);
      setError("Ошибка загрузки контактов");
      setContactsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, filters]);

  useEffect(() => {
    getFilteredContacts();
  }, [getFilteredContacts]);

  const filteredData = useMemo(() => {
    if (!contactsData || contactsData.length === 0) return [];

    // Safeguard to ensure userContacts is always an array - moved inside useMemo
    const safeUserContacts = Array.isArray(userContacts) ? userContacts : [];

    return contactsData.filter((contact) => {
      // Исключаем собственный контакт пользователя
      if (currentUserId && contact.user_id === currentUserId) {
        return false;
      }

      // Фильтр по университетам (применяем здесь, так как нужны данные пользователей)
      if (filters.universities.length > 0) {
        const foundUser = safeUserContacts.find(
          (user) => user.id === contact.user_id
        );

        if (
          !foundUser ||
          !filters.universities.includes(foundUser.university)
        ) {
          return false;
        }
      }

      // Additional safety check
      if (!safeUserContacts || typeof safeUserContacts.find !== "function") {
        console.error(
          "ERROR: safeUserContacts is not a proper array with find method:",
          safeUserContacts
        );
        return true; // Return true to show all contacts if search fails
      }

      // If there's search input, filter by name or other fields
      if (inputValue.trim() !== "") {
        // Check if userContacts has items before using find
        if (
          !safeUserContacts ||
          !Array.isArray(safeUserContacts) ||
          safeUserContacts.length === 0
        ) {
          return false;
        }

        // This is a basic example. You might want to check more fields
        const foundUser = safeUserContacts.find((user) => {
          return user.id === contact.user_id;
        });

        const userName = foundUser?.first_name || "";
        const userLastName = foundUser?.last_name || "";
        const fullName = `${userName} ${userLastName}`.toLowerCase();

        return fullName.includes(inputValue.toLowerCase());
      }

      return true;
    });
  }, [
    contactsData,
    inputValue,
    userContacts,
    filters.universities,
    currentUserId,
  ]);

  return {
    inputValue,
    setInputValue,
    filteredData,
    isPending: isPending || isLoading,
    startTransition,
    error,
  };
};
