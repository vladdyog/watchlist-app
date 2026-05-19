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
    if (progress === null) saveToStorage(STORAGE_KEY, movies);
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

  const handleWatchThis = (winner: Movie) => {
    setLastPick(winner);
    setDeck([]);
  };

  const isEnriching = progress !== null;
  const filteredMovies = filterMovies(movies, filters);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg)' }}
    >
      <Analytics />

      {/* ── Header ── */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '28px 24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
            }}
          >
            Cue<span style={{ color: 'var(--color-accent)' }}>Movie</span>
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              marginTop: '6px',
              fontWeight: 500,
            }}
          >
            From your watchlist to tonight's pick
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          maxWidth: 672,
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '44px',
        }}
      >
        {/* Upload */}
        <section>
          <SectionLabel>Your Watchlist</SectionLabel>
          <CSVUpload
            movieCount={movies.length}
            isEnriching={isEnriching}
            progress={progress}
            enrichmentTime={enrichmentTime}
            onMoviesLoaded={handleMoviesLoaded}
            onError={setError}
          />
          {error && (
            <p
              style={{
                color: 'var(--color-danger)',
                fontSize: '0.9rem',
                marginTop: '10px',
                fontWeight: 500,
              }}
            >
              {error}
            </p>
          )}
        </section>

        {!isEnriching && movies.length > 0 && (
          <>
            {/* Filters */}
            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <SectionLabel noMargin>Filters</SectionLabel>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>
                    {filteredMovies.length}
                  </span>
                  {' / '}
                  <span>{movies.length} films</span>
                </span>
              </div>
              <MovieFilters
                movies={movies}
                filters={filters}
                onChange={setFilters}
              />
            </section>

            {/* Picker */}
            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '28px',
                }}
              >
                <SectionLabel noMargin>Pick a Film</SectionLabel>

                {/* Deck mode toggle button */}
                <DeckToggle
                  enabled={deckEnabled}
                  onToggle={() => setDeckEnabled((v) => !v)}
                />
              </div>

              <MoviePicker
                movies={filteredMovies}
                onMoviePicked={handleMoviePicked}
                deckEnabled={deckEnabled}
                shuffleActive={shuffleActive}
                lastPick={lastPick}
              />

              {deckEnabled && (
                <div style={{ marginTop: '12px' }}>
                  <MovieDeck
                    movies={deck}
                    shuffleActive={shuffleActive}
                    onShuffleStart={() => setShuffleActive(true)}
                    onWatchThis={handleWatchThis}
                    onClose={() => setShuffleActive(false)}
                    onRemove={(m) =>
                      setDeck((prev) => prev.filter((w) => w.title !== m.title))
                    }
                    onClear={() => setDeck([])}
                  />
                </div>
              )}

              {/* Deck mode last pick — same layout as normal mode */}
              {deckEnabled && lastPick && !shuffleActive && (
                <div
                  style={{
                    marginTop: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '14px',
                      width: '100%',
                      maxWidth: '420px',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: '1px',
                        background: 'var(--color-border)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--color-accent)',
                      }}
                    >
                      Tonight's Pick
                    </p>
                    <div
                      style={{
                        flex: 1,
                        height: '1px',
                        background: 'var(--color-border)',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '420px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowDeckWinnerModal(true)}
                  >
                    <MovieCard movie={lastPick} compact />
                  </div>
                  <p
                    style={{
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--color-muted)',
                      marginTop: '10px',
                      fontWeight: 500,
                    }}
                  >
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

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-muted)',
            fontWeight: 500,
          }}
        >
          CueMovie · v{APP_VERSION} · © 2026 {AUTHOR}
        </p>
        <a
          href="https://www.flaticon.com/free-icons/clapper"
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            marginTop: '4px',
            display: 'block',
          }}
        >
          Icons by Uniconlabs / Flaticon
        </a>
      </footer>
    </div>
  );
};

/* Section heading */
const SectionLabel: React.FC<{
  children: React.ReactNode;
  noMargin?: boolean;
}> = ({ children, noMargin }) => (
  <h2
    style={{
      fontSize: '0.8rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--color-accent)',
      marginBottom: noMargin ? 0 : '18px',
    }}
  >
    {children}
  </h2>
);

/* Deck mode toggle — knob + label only, no surrounding border or background */
const DeckToggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({
  enabled,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '9px',
      padding: '4px 0',
      border: 'none',
      background: 'transparent',
      color: enabled ? 'var(--color-accent)' : 'var(--color-muted)',
      fontSize: '0.8rem',
      fontWeight: 700,
      fontFamily: 'var(--font-body)',
      cursor: 'pointer',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      transition: 'color 0.18s ease',
      userSelect: 'none',
    }}
  >
    {/* Knob track */}
    <span
      style={{
        display: 'inline-block',
        width: 30,
        height: 17,
        borderRadius: 9,
        background: enabled ? 'var(--color-accent)' : 'var(--color-border)',
        position: 'relative',
        transition: 'background 0.18s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2.5,
          left: enabled ? 15 : 2.5,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.18s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </span>
    Deck mode
  </button>
);

export default App;
