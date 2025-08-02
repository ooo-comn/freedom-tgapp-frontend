import { API_BASE_URL } from "../../../shared/config/api";

import { useEffect, useState } from "react";
import { IContact } from "./types";

export const useCourseData = (cid: string) => {
  const [data, setData] = useState<IContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/get-courses/?id=${cid}`);
        const result = await response.json();

        // Проверяем, что контакт опубликован (is_visible === true)
        if (result && result.is_visible !== true) {
          console.log("Course is not visible:", cid);
          setData(null); // Устанавливаем null если контакт не опубликован
        } else {
          setData(result);
        }
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    if (cid) {
      fetchData();
    }
  }, [cid]);

  return { data, isLoading, error };
};
