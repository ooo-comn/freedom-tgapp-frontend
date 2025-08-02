import { IContact } from "../../../entities/course/model/types";
import { API_BASE_URL } from "../../../shared/config/api";

const fetchCourses = async (id: string): Promise<IContact> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-courses/?id=${id}`);
    const data = await response.json();

    // Проверяем, что контакт опубликован (is_visible === true)
    if (data && data.is_visible !== true) {
      console.log("Contact is not visible:", id);
      return {} as IContact; // Возвращаем пустой объект если контакт не опубликован
    }

    return data || {};
  } catch (error) {
    console.error("Error fetching course data:", error);
    return {} as IContact;
  }
};

export default fetchCourses;
