import { IContact } from "src/entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

export interface ContactsParams {
  favorites?: boolean;
  latest?: boolean;
  purchased?: boolean;
  skip?: number;
  limit?: number;
  // Параметры фильтрации
  subjects?: string[];
  workTypes?: string[];
  universities?: string[];
  rating?: boolean;
  sortBy?: string;
}

// Функция для фильтрации контактов на клиенте
const filterContactsOnClient = (
  contacts: IContact[],
  params: ContactsParams
): IContact[] => {
  let filtered = [...contacts];

  // Фильтр по предметам
  if (params.subjects && params.subjects.length > 0) {
    filtered = filtered.filter(
      (contact) =>
        contact.subjects &&
        contact.subjects.some((subject) => params.subjects!.includes(subject))
    );
  }

  // Фильтр по типам работ
  if (params.workTypes && params.workTypes.length > 0) {
    filtered = filtered.filter(
      (contact) =>
        contact.work_types &&
        contact.work_types.some((workType) =>
          params.workTypes!.includes(workType)
        )
    );
  }

  // Фильтр по университетам (нужно получить данные пользователя)
  if (params.universities && params.universities.length > 0) {
    // Этот фильтр будет применен в useFeed где есть доступ к userContacts
    // Пока пропускаем его здесь
  }

  // Фильтр по рейтингу (4-5 звезд)
  // Это будет реализовано позже с учетом отзывов

  // Сортировка
  if (params.sortBy) {
    switch (params.sortBy) {
      case "По дате":
        // Поле created_at не существует в IContact, пока оставляем как есть
        // В будущем можно добавить это поле в API или использовать другое поле для сортировки
        console.log("Сортировка по дате пока не реализована для контактов");
        break;
      case "По умолчанию":
      default:
        // Оставляем как есть
        break;
    }
  }

  console.log(
    `Filtered contacts: ${filtered.length} out of ${contacts.length}`
  );
  return filtered;
};

// Функция для получения избранных контактов пользователя
export const fetchUserFavoriteContacts = async (): Promise<IContact[]> => {
  try {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    const url = `${API_BASE_URL}/contacts/favorites/user/${userId}`;

    const initData = window.Telegram.WebApp.initData;
    console.log("Fetching user favorites from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
    });

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText);
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched user favorite contacts:", data.length);

    // Фильтруем только опубликованные избранные контакты (is_visible === true)
    const visibleFavorites = data.filter(
      (contact: IContact) => contact.is_visible === true
    );
    console.log(
      "Filtered visible favorite contacts:",
      visibleFavorites.length,
      "out of",
      data.length
    );

    return visibleFavorites;
  } catch (error) {
    console.error("Ошибка при запросе избранных контактов:", error);
    throw error;
  }
};

export const fetchContacts = async (
  params?: ContactsParams
): Promise<IContact[]> => {
  try {
    // Если запрашиваются избранные, используем специальный эндпоинт
    if (params?.favorites) {
      return await fetchUserFavoriteContacts();
    }

    let url = `${API_BASE_URL}/contacts/`;

    if (params) {
      const queryParams = new URLSearchParams();

      if (params.latest !== undefined) {
        queryParams.append("latest", params.latest.toString());
      }

      if (params.purchased !== undefined) {
        queryParams.append("purchased", params.purchased.toString());
      }

      if (params.skip !== undefined) {
        queryParams.append("skip", params.skip.toString());
      }

      if (params.limit !== undefined) {
        queryParams.append("limit", params.limit.toString());
      }

      // Добавляем user_id для корректной работы API
      const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
      if (userId) {
        queryParams.append("user_id", userId.toString());
      }

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Получаем токен авторизации
    const initData = window.Telegram.WebApp.initData;
    console.log("Sending request to:", url);
    console.log(
      "Using authorization token:",
      `tma ${initData.substring(0, 20)}...`
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
    });

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText);
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched contacts:", data.length);

    // Фильтруем только опубликованные контакты (is_visible === true)
    const visibleContacts = data.filter(
      (contact: IContact) => contact.is_visible === true
    );
    console.log(
      "Filtered visible contacts:",
      visibleContacts.length,
      "out of",
      data.length
    );

    // Применяем дополнительную фильтрацию на клиенте
    const finalContacts = params
      ? filterContactsOnClient(visibleContacts, params)
      : visibleContacts;

    return finalContacts;
  } catch (error) {
    console.error("Ошибка при запросе к серверу:", error);
    throw error;
  }
};

// Функция для проверки, находится ли контакт в избранном у пользователя
export const checkContactIsFavorite = async (
  contactId: number
): Promise<boolean> => {
  try {
    const favoriteContacts = await fetchUserFavoriteContacts();
    const isFavorite = favoriteContacts.some(
      (contact) => contact.id === contactId
    );
    console.log(`Contact ${contactId} is favorite:`, isFavorite);
    return isFavorite;
  } catch (error) {
    console.error("Ошибка при проверке статуса избранного:", error);
    return false;
  }
};
