import { createContext, useContext, useState, ReactNode } from "react";

interface FiltersState {
  subjects: string[];
  workTypes: string[];
  universities: string[];
  rating: boolean;
  sortBy: string;
}

interface FiltersContextType {
  filters: FiltersState;
  setSubjects: (subjects: string[]) => void;
  setWorkTypes: (workTypes: string[]) => void;
  setUniversities: (universities: string[]) => void;
  setRating: (rating: boolean) => void;
  setSortBy: (sortBy: string) => void;
  resetFilters: () => void;
  clearFilters: () => void;
}

const defaultFilters: FiltersState = {
  subjects: [],
  workTypes: [],
  universities: [],
  rating: false,
  sortBy: "По умолчанию",
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};

interface FiltersProviderProps {
  children: ReactNode;
}

export const FiltersProvider = ({ children }: FiltersProviderProps) => {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  const setSubjects = (subjects: string[]) => {
    setFilters((prev) => ({ ...prev, subjects }));
  };

  const setWorkTypes = (workTypes: string[]) => {
    setFilters((prev) => ({ ...prev, workTypes }));
  };

  const setUniversities = (universities: string[]) => {
    setFilters((prev) => ({ ...prev, universities }));
  };

  const setRating = (rating: boolean) => {
    setFilters((prev) => ({ ...prev, rating }));
  };

  const setSortBy = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setSubjects,
        setWorkTypes,
        setUniversities,
        setRating,
        setSortBy,
        resetFilters,
        clearFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};
