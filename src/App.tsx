// App.tsx

import React, { useState, useEffect } from "react";
import CSVUpload from "./components/CSVUpload";
import MoviePicker from "./components/MoviePicker";
import MovieFilters from "./components/MovieFilters";
import MovieDeck from "./components/MovieDeck";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import { enrichAllMovies } from "./utils/tmdb";
import { filterMovies } from "./utils";
import type { Movie, FilterOptions } from "./types";

const STORAGE_KEY = "watchlist";
const DECK_KEY = "deck";
const DECK_ENABLED_KEY = "deckEnabled";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN as string;

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
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

  const [deck, setDeck] = useState<Movie[]>(
    () => loadFromStorage<Movie[]>(DECK_KEY) ?? [],
  );

  const [deckEnabled, setDeckEnabled] = useState<boolean>(
    () => loadFromStorage<boolean>(DECK_ENABLED_KEY) ?? false,
  );

  const [filters, setFilters] = useState<FilterOptions>({});
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  const [enrichmentTime, setEnrichmentTime] = useState<number | null>(null);

  // Shared Last Pick
  const [lastPick, setLastPick] = useState<Movie | null>(null);

  // Deck session
  const [shuffleActive, setShuffleActive] = useState(false);

  const [showDeckWinnerModal, setShowDeckWinnerModal] = useState(false);

  useEffect(() => {
    if (progress === null) {
      saveToStorage(STORAGE_KEY, movies);
    }
  }, [movies, progress]);

  useEffect(() => {
    saveToStorage(DECK_KEY, deck);
  }, [deck]);

  useEffect(() => {
    saveToStorage(DECK_ENABLED_KEY, deckEnabled);
  }, [deckEnabled]);

  const handleMoviesLoaded = async (rawMovies: Movie[]) => {
    setProgress({ completed: 0, total: rawMovies.length });
    setEnrichmentTime(null);
    setFilters({});
    setError(null);

    const start = performance.now();

    const enriched = await enrichAllMovies(
      rawMovies,
      TMDB_TOKEN,
      (completed, total) => setProgress({ completed, total }),
    );

    setMovies(enriched);
    setProgress(null);
    setEnrichmentTime((performance.now() - start) / 1000);
  };

  const handleMoviePicked = (movie: Movie) => {
    // Normal picker mode
    if (!deckEnabled) {
      setLastPick(movie);
      return;
    }

    // Deck mode — only add to deck
    setDeck((prev) =>
      prev.some((m) => m.title === movie.title) ? prev : [...prev, movie],
    );
  };

  const handleShuffleStart = () => {
    setShuffleActive(true);
  };

  // Confirmed winner only
  const handleWatchThis = (winner: Movie) => {
    // Winner becomes Last Pick
    setLastPick(winner);

    // Clear deck session
    setDeck([]);
  };

  const handleDeckClose = () => {
    setShuffleActive(false);
  };

  const isEnriching = progress !== null;
  const filteredMovies = filterMovies(movies, filters);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border py-6 text-center">
        <h1 className="font-display text-4xl font-normal text-text tracking-tight">
          Movie Picker
        </h1>

        <p className="text-muted text-sm mt-1.5">
          Your watchlist. One random pick.
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Upload */}
        <Section title="Watchlist">
          <CSVUpload
            movieCount={movies.length}
            isEnriching={isEnriching}
            progress={progress}
            enrichmentTime={enrichmentTime}
            onMoviesLoaded={handleMoviesLoaded}
            onError={setError}
          />

          {error && <p className="text-danger text-sm mt-3">{error}</p>}
        </Section>

        {!isEnriching && movies.length > 0 && (
          <>
            {/* Filters */}
            <Section title="Filters">
              <MovieFilters
                movies={movies}
                filters={filters}
                onChange={setFilters}
              />

              <p className="text-muted text-sm mt-3">
                {filteredMovies.length} / {movies.length} movies match
              </p>
            </Section>

            {/* Picker */}
            <section>
              <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-border">
                <h2 className="font-body text-xs font-normal text-accent uppercase tracking-widest">
                  Pick a Movie
                </h2>

                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deckEnabled}
                    onChange={(e) => setDeckEnabled(e.target.checked)}
                    className="accent-accent w-3.5 h-3.5"
                  />
                  DECK MODE
                </label>
              </div>

              <MoviePicker
                movies={filteredMovies}
                onMoviePicked={handleMoviePicked}
                deckEnabled={deckEnabled}
                shuffleActive={shuffleActive}
                lastPick={lastPick}
              />

              {deckEnabled && (
                <div className="mt-2">
                  <MovieDeck
                    movies={deck}
                    shuffleActive={shuffleActive}
                    onShuffleStart={handleShuffleStart}
                    onWatchThis={handleWatchThis}
                    onClose={handleDeckClose}
                    onRemove={(m) =>
                      setDeck((prev) => prev.filter((w) => w.title !== m.title))
                    }
                    onClear={() => setDeck([])}
                  />
                </div>
              )}

              {/* Deck mode Last Pick */}
              {deckEnabled && lastPick && !shuffleActive && (
                <div className="mt-8">
                  <p className="text-muted text-xs uppercase tracking-wider mb-3 text-center">
                    Last pick
                  </p>

                  <div
                    className="w-full max-w-sm mx-auto cursor-pointer"
                    onClick={() => setShowDeckWinnerModal(true)}
                  >
                    <MovieCard movie={lastPick} compact />
                  </div>

                  <p className="text-center text-muted text-xs mt-2">
                    Click to expand
                  </p>
                </div>
              )}

              {showDeckWinnerModal && lastPick && (
                <MovieModal
                  movie={lastPick}
                  onClose={() => setShowDeckWinnerModal(false)}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section>
    <h2 className="font-body text-xs font-normal text-accent uppercase tracking-widest mb-5 pb-2.5 border-b border-border">
      {title}
    </h2>

    {children}
  </section>
);

export default App;
