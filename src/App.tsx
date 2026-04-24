import React, { useState, useEffect } from "react";
import CSVUpload from "./components/CSVUpload";
import MoviePicker from "./components/MoviePicker";
import MovieFilters from "./components/MovieFilters";
import { enrichAllMovies } from "./utils/tmdb";
import { filterMovies } from "./utils";
import type { Movie, FilterOptions } from "./types";

const STORAGE_KEY = "watchlist";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN as string;

function loadMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Movie[];
  } catch {
    return [];
  }
}

function saveMovies(movies: Movie[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(loadMovies);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [enrichmentTime, setEnrichmentTime] = useState<number | null>(null);

  useEffect(() => {
    if (progress === null) saveMovies(movies);
  }, [movies, progress]);

  const handleMoviesLoaded = async (rawMovies: Movie[]) => {
    setProgress({ completed: 0, total: rawMovies.length });
    setEnrichmentTime(null);
    setFilters({});
    setError(null);

    const start = performance.now();

    const enriched = await enrichAllMovies(
      rawMovies,
      TMDB_TOKEN,
      (completed, total) => {
        setProgress({ completed, total });
      },
    );

    const elapsed = (performance.now() - start) / 1000;

    setMovies(enriched);
    setProgress(null);
    setEnrichmentTime(elapsed);
  };

  const isEnriching = progress !== null;
  const filteredMovies = filterMovies(movies, filters);

  return (
    <div>
      <h1>Watchlist Movie Picker</h1>

      <CSVUpload onMoviesLoaded={handleMoviesLoaded} onError={setError} />

      {error && <p>{error}</p>}

      {isEnriching && (
        <p>
          Enriching movies... {progress.completed} / {progress.total}
        </p>
      )}

      {!isEnriching && movies.length > 0 && (
        <>
          <p>
            {filteredMovies.length} / {movies.length} movies match filters.
          </p>
          {enrichmentTime !== null && (
            <p>Enrichment took {enrichmentTime.toFixed(2)}s</p>
          )}
          <MovieFilters
            movies={movies}
            filters={filters}
            onChange={setFilters}
          />
          <MoviePicker movies={filteredMovies} />
        </>
      )}
    </div>
  );
};

export default App;
