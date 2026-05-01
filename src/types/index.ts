export type Movie = {
  title: string;
  year?: number;
  rating?: number;
  genres?: string[];
  runtime?: number;
  overview?: string;
  poster?: string;
  dateAdded?: string;
};

export type FilterOptions = {
  minRating?: number;
  genres?: string[];
  excludedGenres?: string[];
  minRuntime?: number;
  maxRuntime?: number;
  minYear?: number;
  maxYear?: number;
  addedAfter?: string;
  addedBefore?: string;
};
