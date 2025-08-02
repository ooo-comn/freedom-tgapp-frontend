import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFilters } from "src/shared/contexts/FiltersContext";
import styles from "./FiltersPage.module.css";
import FilterItem from "./ui/FilterItem/FilterItem";

const FiltersPage: FC = () => {
  const {
    filters,
    setWorkTypes,
    setUniversities,
    setRating,
    setSortBy,
    resetFilters,
  } = useFilters();

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

  const [workTypeFilters, setWorkTypeFilters] = useState<{
    [key: string]: boolean;
  }>(() => {
    // Инициализируем состояние на основе контекста
    const initialState: { [key: string]: boolean } = {};
    filters.workTypes.forEach((workType) => {
      initialState[workType] = true;
    });
    return initialState;
  });

  const [universityFilters, setUniversityFilters] = useState<{
    [key: string]: boolean;
  }>(() => {
    // Инициализируем состояние на основе контекста
    const initialState: { [key: string]: boolean } = {};
    filters.universities.forEach((university) => {
      initialState[university] = true;
    });
    return initialState;
  });

  const [sortFilters, setSortFilters] = useState<{ [key: string]: boolean }>(
    () => {
      return {
        [filters.sortBy]: true,
      };
    }
  );

  const [checked, setChecked] = useState(filters.rating);

  const handleCheckboxChange = () => {
    setChecked((prev) => !prev);
  };

  const handleFilterChange = (section: string, filterName: string) => {
    switch (section) {
      case "workType":
        setWorkTypeFilters((prev) => ({
          ...prev,
          [filterName]: !prev[filterName],
        }));
        break;
      case "university":
        setUniversityFilters((prev) => ({
          ...prev,
          [filterName]: !prev[filterName],
        }));
        break;
      case "sort":
        setSortFilters((prev) => {
          const resetSort = Object.keys(prev).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {} as { [key: string]: boolean });

          return { ...resetSort, [filterName]: true };
        });
        break;
    }
  };

  const handleApplyFilters = () => {
    // Обновляем контекст фильтров
    const selectedWorkTypes = Object.keys(workTypeFilters).filter(
      (key) => workTypeFilters[key]
    );
    const selectedUniversities = Object.keys(universityFilters).filter(
      (key) => universityFilters[key]
    );
    const selectedSort =
      Object.keys(sortFilters).find((key) => sortFilters[key]) ||
      "По умолчанию";

    setWorkTypes(selectedWorkTypes);
    setUniversities(selectedUniversities);
    setRating(checked);
    setSortBy(selectedSort);

    console.log("Applied filters:", {
      subjects: filters.subjects, // берем из контекста
      workTypes: selectedWorkTypes,
      universities: selectedUniversities,
      rating: checked,
      sortBy: selectedSort,
    });

    // Возвращаемся на предыдущую страницу
    window.history.back();
  };

  const handleReset = () => {
    setWorkTypeFilters({});
    setUniversityFilters({});
    setSortFilters({ "По умолчанию": true });
    setChecked(false);
    resetFilters();
  };

  return (
    <div className={styles["filters-page"]}>
      <div className={styles["filters-page__header"]}>
        <h1 className={styles["filters-page__title"]}>Фильтры</h1>
        <button
          className={styles["filters-page__reset-button"]}
          onClick={handleReset}
        >
          Сбросить
        </button>
      </div>

      <div className={styles["filters-page__content"]}>
        <div className={styles["filters-page__section"]}>
          <p className={styles["filters-page__section-title"]}>
            Предмет{" "}
            {filters.subjects.length > 0 && `(${filters.subjects.length})`}
          </p>
          <FilterItem
            filterItemType="link"
            text="Все предметы"
            path="/subjects"
          />
        </div>

        <div className={styles["filters-page__section"]}>
          <p className={styles["filters-page__section-title"]}>
            Тип работы{" "}
            {filters.workTypes.length > 0 && `(${filters.workTypes.length})`}
          </p>
          <div className={styles["filters-page__checkbox-group"]}>
            <FilterItem
              filterItemType="checkbox"
              text="Online помощь"
              isNotify={workTypeFilters["Online помощь"]}
              isNotifyFAQ={() =>
                handleFilterChange("workType", "Online помощь")
              }
            />
            <FilterItem
              filterItemType="checkbox"
              text="Решение задач"
              isNotify={workTypeFilters["Решение задач"]}
              isNotifyFAQ={() =>
                handleFilterChange("workType", "Решение задач")
              }
            />
            <FilterItem
              filterItemType="checkbox"
              text="Дипломная работа"
              isNotify={workTypeFilters["Дипломная работа"]}
              isNotifyFAQ={() =>
                handleFilterChange("workType", "Дипломная работа")
              }
            />
            <FilterItem
              filterItemType="checkbox"
              text="Курсовая работа"
              isNotify={workTypeFilters["Курсовая работа"]}
              isNotifyFAQ={() =>
                handleFilterChange("workType", "Курсовая работа")
              }
            />
            <FilterItem
              filterItemType="checkbox"
              text="Реферат"
              isNotify={workTypeFilters["Реферат"]}
              isNotifyFAQ={() => handleFilterChange("workType", "Реферат")}
            />
          </div>
          <Link
            to="/work-types"
            className={styles["filters-page__show-all-button"]}
          >
            Все типы работ
          </Link>
        </div>

        <div className={styles["filters-page__section"]}>
          <p className={styles["filters-page__section-title"]}>
            Университет{" "}
            {filters.universities.length > 0 &&
              `(${filters.universities.length})`}
          </p>
          <div className={styles["filters-page__checkbox-group"]}>
            <FilterItem
              filterItemType="checkbox"
              text="МГУ имени М. В. Ломоносова"
              isNotify={universityFilters["МГУ имени М. В. Ломоносова"]}
              isNotifyFAQ={() =>
                handleFilterChange("university", "МГУ имени М. В. Ломоносова")
              }
            />
            <FilterItem
              filterItemType="checkbox"
              text="НИУ ВШЭ"
              isNotify={universityFilters["НИУ ВШЭ"]}
              isNotifyFAQ={() => handleFilterChange("university", "НИУ ВШЭ")}
            />
            <FilterItem
              filterItemType="checkbox"
              text="МГТУ имени Баумана"
              isNotify={universityFilters["МГТУ имени Баумана"]}
              isNotifyFAQ={() =>
                handleFilterChange("university", "МГТУ имени Баумана")
              }
            />
            <FilterItem
              filterItemType="checkbox"
              text="МГИМО"
              isNotify={universityFilters["МГИМО"]}
              isNotifyFAQ={() => handleFilterChange("university", "МГИМО")}
            />
            <FilterItem
              filterItemType="checkbox"
              text="МФТИ"
              isNotify={universityFilters["МФТИ"]}
              isNotifyFAQ={() => handleFilterChange("university", "МФТИ")}
            />
          </div>
          <Link
            to="/universities"
            className={styles["filters-page__show-all-button"]}
          >
            Все университеты
          </Link>
        </div>

        <div className={styles["filters-page__section"]}>
          <p className={styles["filters-page__section-title"]}>Отзывы</p>
          <FilterItem
            filterItemType="button"
            text="Контакты с рейтингом 4 и 5 звёзд"
            checked={checked}
            handleCheckboxChange={handleCheckboxChange}
          />
        </div>

        <div className={styles["filters-page__section"]}>
          <p className={styles["filters-page__section-title"]}>Сортировать</p>
          <div className={styles["filters-page__checkbox-group"]}>
            <FilterItem
              filterItemType="checkbox"
              text="По умолчанию"
              isNotify={sortFilters["По умолчанию"]}
              isNotifyFAQ={() => handleFilterChange("sort", "По умолчанию")}
            />
            <FilterItem
              filterItemType="checkbox"
              text="По дате"
              isNotify={sortFilters["По дате"]}
              isNotifyFAQ={() => handleFilterChange("sort", "По дате")}
            />
          </div>
        </div>
      </div>

      <button
        className={styles["filters-page__button-save"]}
        onClick={handleApplyFilters}
      >
        Применить
      </button>
    </div>
  );
};

export default FiltersPage;
