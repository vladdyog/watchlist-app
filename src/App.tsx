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
    setMovies(enriched);
    setProgress(null);
    setEnrichmentTime((performance.now() - start) / 1000);
  };

  const handleMoviePicked = (movie: Movie) => {
    if (!wheelEnabled) return;
    setWheel((prev) =>
      prev.some((m) => m.title === movie.title) ? prev : [...prev, movie],
    );
  };

  const isEnriching = progress !== null;
  const filteredMovies = filterMovies(movies, filters);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: "2.25rem",
            fontWeight: 400,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          🎬 Movie Picker
        </h1>
        <p
          style={{
            color: "var(--muted)",
            margin: "6px 0 0",
            fontSize: "0.875rem",
          }}
        >
          Your watchlist. One random pick.
        </p>
      </header>

      {/* Main content */}
      <main
        style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px" }}
      >
        {/* Upload section */}
        <Section title="Watchlist">
          <CSVUpload onMoviesLoaded={handleMoviesLoaded} onError={setError} />
          {error && (
            <p
              style={{
                color: "var(--danger)",
                marginTop: "12px",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </p>
          )}
          {isEnriching && (
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                  marginBottom: "8px",
                }}
              >
                Enriching movies... {progress.completed} / {progress.total}
              </p>
              <div
                style={{
                  height: "2px",
                  background: "var(--border)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(progress.completed / progress.total) * 100}%`,
                    background: "var(--accent)",
                    transition: "width 0.2s ease",
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>
          )}
          {!isEnriching && movies.length > 0 && (
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.875rem",
                marginTop: "12px",
              }}
            >
              {movies.length} movies loaded
              {enrichmentTime !== null &&
                ` · enriched in ${enrichmentTime.toFixed(1)}s`}
            </p>
          )}
        </Section>

        {!isEnriching && movies.length > 0 && (
          <>
            {/* Filters section */}
            <Section title="Filters">
              <MovieFilters
                movies={movies}
                filters={filters}
                onChange={setFilters}
              />
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                  marginTop: "12px",
                }}
              >
                {filteredMovies.length} / {movies.length} movies match
              </p>
            </Section>

            {/* Picker section */}
            <Section title="Pick a Movie">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={wheelEnabled}
                    onChange={(e) => setWheelEnabled(e.target.checked)}
                    style={{
                      accentColor: "var(--accent)",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  Enable wheel mode
                </label>
              </div>
              <MoviePicker
                movies={filteredMovies}
                onMoviePicked={handleMoviePicked}
              />
            </Section>

            {/* Wheel section */}
            {wheelEnabled && (
              <Section title="The Wheel">
                <MovieWheel
                  movies={wheel}
                  onRemove={(m) =>
                    setWheel((prev) => prev.filter((w) => w.title !== m.title))
                  }
                  onClear={() => setWheel([])}
                />
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// Reusable section wrapper
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: "48px" }}>
    <h2
      style={{
        fontFamily: "DM Serif Display, serif",
        fontSize: "1.1rem",
        fontWeight: 400,
        color: "var(--accent)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "20px",
        paddingBottom: "10px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

export default App;
