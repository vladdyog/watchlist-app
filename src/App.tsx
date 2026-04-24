import React, { useState, useEffect } from "react";
import CSVUpload from "./components/CSVUpload";
import MoviePicker from "./components/MoviePicker";
import MovieFilters from "./components/MovieFilters";
import MovieWheel from "./components/MovieWheel";
import { enrichAllMovies } from "./utils/tmdb";
import { filterMovies } from "./utils";
import type { Movie, FilterOptions } from "./types";

const STORAGE_KEY = "watchlist";
const WHEEL_KEY = "wheel";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN as string;

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(
    () => loadFromStorage<Movie[]>(STORAGE_KEY) ?? [],
  );
  const [wheel, setWheel] = useState<Movie[]>(
    () => loadFromStorage<Movie[]>(WHEEL_KEY) ?? [],
  );
  const [wheelEnabled, setWheelEnabled] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [enrichmentTime, setEnrichmentTime] = useState<number | null>(null);

  useEffect(() => {
    if (progress === null) saveToStorage(STORAGE_KEY, movies);
  }, [movies, progress]);

  useEffect(() => {
    saveToStorage(WHEEL_KEY, wheel);
  }, [wheel]);

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

  const handleMoviePicked = (movie: Movie) => {
    if (!wheelEnabled) return;
    // Avoid duplicates on the wheel
    setWheel((prev) =>
      prev.some((m) => m.title === movie.title) ? prev : [...prev, movie],
    );
  };

  const handleRemoveFromWheel = (movie: Movie) => {
    setWheel((prev) => prev.filter((m) => m.title !== movie.title));
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

          <MoviePicker
            movies={filteredMovies}
            onMoviePicked={handleMoviePicked}
          />

          <div>
            <label>
              <input
                type="checkbox"
                checked={wheelEnabled}
                onChange={(e) => setWheelEnabled(e.target.checked)}
              />
              Enable wheel mode
            </label>
          </div>

          {wheelEnabled && (
            <MovieWheel
              movies={wheel}
              onRemove={handleRemoveFromWheel}
              onClear={() => setWheel([])}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
