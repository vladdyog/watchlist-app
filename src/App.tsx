import { Analytics } from '@vercel/analytics/react';
import React, { useEffect, useState } from 'react';

import CSVUpload from './components/CSVUpload';
import MovieCard from './components/MovieCard';
import MovieDeck from './components/MovieDeck';
import MovieFilters from './components/MovieFilters';
import MovieModal from './components/MovieModal';
import MoviePicker from './components/MoviePicker';
import type { FilterOptions, Movie } from './types';
import { filterMovies } from './utils';
import { enrichAllMovies } from './utils/tmdb';

const STORAGE_KEY = 'watchlist';
const DECK_KEY = 'deck';
const DECK_ENABLED_KEY = 'deckEnabled';
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN as string;
const APP_VERSION = import.meta.env.PACKAGE_VERSION;
const AUTHOR = import.meta.env.AUTHOR;

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

  const [lastPick, setLastPick] = useState<Movie | null>(null);

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
    if (!deckEnabled) {
      setLastPick(movie);
      return;
    }

    setDeck((prev) =>
      prev.some((m) => m.title === movie.title) ? prev : [...prev, movie],
    );
  };

  const handleShuffleStart = () => {
    setShuffleActive(true);
  };

  const handleWatchThis = (winner: Movie) => {
    setLastPick(winner);
    setDeck([]);
  };

  const handleDeckClose = () => {
    setShuffleActive(false);
  };

  const isEnriching = progress !== null;
  const filteredMovies = filterMovies(movies, filters);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Analytics />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-white">
            CueMovie
          </h1>

          <p className="text-muted text-base sm:text-lg mt-3 font-medium">
            From your watchlist to tonight&apos;s pick.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 sm:py-14 space-y-14">
        <Section title="Watchlist">
          <CSVUpload
            movieCount={movies.length}
            isEnriching={isEnriching}
            progress={progress}
            enrichmentTime={enrichmentTime}
            onMoviesLoaded={handleMoviesLoaded}
            onError={setError}
          />

          {error && (
            <p className="text-danger text-sm mt-4 font-medium">{error}</p>
          )}
        </Section>

        {!isEnriching && movies.length > 0 && (
          <>
            <Section title="Filters">
              <MovieFilters
                movies={movies}
                filters={filters}
                onChange={setFilters}
              />

              <p className="text-muted text-sm mt-5">
                {filteredMovies.length} / {movies.length} movies match
              </p>
            </Section>

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                    Pick a Movie
                  </h2>

                  <p className="text-muted text-sm mt-1">
                    Let the app decide your next watch.
                  </p>
                </div>

                <label className="flex items-center gap-3 text-sm text-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deckEnabled}
                    onChange={(e) => setDeckEnabled(e.target.checked)}
                    className="accent-accent w-4 h-4"
                  />

                  <span className="font-medium">Deck mode</span>
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
                <div className="mt-6">
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

              {deckEnabled && lastPick && !shuffleActive && (
                <div className="mt-14">
                  <div className="text-center mb-6">
                    <p className="text-accent text-sm font-semibold tracking-wide">
                      Tonight&apos;s Pick
                    </p>

                    <p className="text-muted text-sm mt-1">
                      Click to expand details
                    </p>
                  </div>

                  <div
                    className="w-full max-w-md mx-auto cursor-pointer"
                    onClick={() => setShowDeckWinnerModal(true)}
                  >
                    <MovieCard movie={lastPick} compact />
                  </div>
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

      <footer className="border-t border-border/60 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-muted">
            CueMovie · v{APP_VERSION} · © 2026 {AUTHOR}
          </p>

          <a
            className="text-sm text-muted hover:text-text transition-colors duration-200 mt-2 inline-block"
            href="https://www.flaticon.com/free-icons/clapper"
            title="clapper icons"
          >
            Clapper icons created by Uniconlabs - Flaticon
          </a>
        </div>
      </footer>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-border" />

      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
        {title}
      </h2>

      <div className="h-px flex-1 bg-border" />
    </div>

    {children}
  </section>
);

export default App;
