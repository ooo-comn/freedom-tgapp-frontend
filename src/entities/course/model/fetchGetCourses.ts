import { IContact } from "../../../entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

const fetchGetCourses = async (): Promise<IContact[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-courses/`);
    const data = await response.json();

    // Фильтруем только опубликованные контакты (is_visible === true)
    if (Array.isArray(data)) {
      const visibleCourses = data.filter(
        (contact: IContact) => contact.is_visible === true
      );
      console.log(
        "Filtered visible courses:",
        visibleCourses.length,
        "out of",
        data.length
      );
      return visibleCourses;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export default fetchGetCourses;
