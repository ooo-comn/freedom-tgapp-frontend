import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSubjects } from "src/features/get-subjects/model/fetchWorkTypes";
import { useFilters } from "src/shared/contexts/FiltersContext";
import FilterItem from "../FiltersPage/ui/FilterItem/FilterItem";
import styles from "./SubjectsPage.module.css";

const SubjectsPage: FC = () => {
  const navigate = useNavigate();
  const { filters, setSubjects } = useFilters();
  const [subjects, setSubjectsList] = useState<string[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    filters.subjects
  );
  const [searchValue, setSearchValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const BackButton = window.Telegram.WebApp.BackButton;
    BackButton.show();

    const backHandler = () => BackButton.hide();
    BackButton.onClick(backHandler);

    const historyBackHandler = () => window.history.back();
    window.Telegram.WebApp.onEvent("backButtonClicked", historyBackHandler);

    return () => {
      BackButton.offClick(backHandler);
      window.Telegram.WebApp.offEvent("backButtonClicked", historyBackHandler);
    };
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const subjectsList = await fetchSubjects();
        setSubjectsList(subjectsList);
        setFilteredSubjects(subjectsList);
      } catch (error) {
        console.error("Ошибка загрузки предметов:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  useEffect(() => {
    const filtered = subjects.filter((subject) =>
      subject.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchValue, subjects]);

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleReset = () => {
    setSelectedSubjects([]);
    setSearchValue("");
  };

  const handleApply = () => {
    console.log("Выбранные предметы:", selectedSubjects);
    setSubjects(selectedSubjects);
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles["subjects-page"]}>
        <div className={styles["subjects-page__header"]}>
          <h1 className={styles["subjects-page__title"]}>Предметы</h1>
        </div>
        <div className={styles["subjects-page__loading"]}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles["subjects-page"]}>
      <div className={styles["subjects-page__header"]}>
        <h1 className={styles["subjects-page__title"]}>Предметы</h1>
        <button
          className={styles["subjects-page__reset-button"]}
          onClick={handleReset}
        >
          Сбросить
        </button>
      </div>

      <div className={styles["subjects-page__search"]}>
        <div className={styles["subjects-page__search-container"]}>
          <input
            type="text"
            placeholder="Название предмета"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles["subjects-page__search-input"]}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={styles["subjects-page__search-icon"]}
          >
            <path
              d="M8.5 0.5C5.74414 0.5 3.5 2.74414 3.5 5.5C3.5 6.69727 3.91992 7.79492 4.625 8.65625L0.640625 12.6406L1.35938 13.3594L5.34375 9.375C6.20508 10.0801 7.30273 10.5 8.5 10.5C11.2559 10.5 13.5 8.25586 13.5 5.5C13.5 2.74414 11.2559 0.5 8.5 0.5ZM8.5 1.5C10.7148 1.5 12.5 3.28516 12.5 5.5C12.5 7.71484 10.7148 9.5 8.5 9.5C6.28516 9.5 4.5 7.71484 4.5 5.5C4.5 3.28516 6.28516 1.5 8.5 1.5Z"
              fill="var(--second-text)"
            />
          </svg>
        </div>
      </div>

      <div className={styles["subjects-page__content"]}>
        <div className={styles["subjects-page__list"]}>
          {filteredSubjects.map((subject) => (
            <FilterItem
              key={subject}
              filterItemType="checkbox"
              text={subject}
              isNotify={selectedSubjects.includes(subject)}
              isNotifyFAQ={() => handleSubjectSelect(subject)}
            />
          ))}
        </div>
      </div>

      <div className={styles["subjects-page__footer"]}>
        <button
          className={styles["subjects-page__apply-button"]}
          onClick={handleApply}
        >
          Применить{" "}
          {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}
        </button>
      </div>
    </div>
  );
};

export default SubjectsPage;
