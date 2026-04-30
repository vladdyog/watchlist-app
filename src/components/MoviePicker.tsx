import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import type { Movie } from '../types';
import MovieCard from './MovieCard';
import MovieModal from './MovieModal';

type Props = {
  movies: Movie[];
  onMoviePicked?: (movie: Movie) => void;
  deckEnabled?: boolean;
  shuffleActive?: boolean;
  lastPick: Movie | null;
};

const MoviePicker: React.FC<Props> = ({
  movies,
  onMoviePicked,
  deckEnabled,
  shuffleActive,
  lastPick,
}) => {
  const [showModal, setShowModal] = useState(false);

  const [recentDeckAdd, setRecentDeckAdd] = useState<Movie | null>(null);

  const pickRandom = () => {
    if (movies.length === 0) return;

    const movie = movies[Math.floor(Math.random() * movies.length)];

    if (!deckEnabled) {
      setShowModal(true);
    } else {
      setRecentDeckAdd(movie);
    }

    onMoviePicked?.(movie);
  };

  const isEmpty = movies.length === 0;

  const label = deckEnabled
    ? 'Add to deck'
    : lastPick
      ? 'Pick another movie'
      : 'Pick a movie';

  return (
    <div className="flex flex-col items-center gap-8">
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-text text-base">
            No movies match your filters
          </p>

          <p className="text-muted text-sm">
            Try adjusting or resetting the filters above
          </p>
        </div>
      ) : (
        !shuffleActive && (
          <>
            <motion.button
              onClick={pickRandom}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={`
                min-w-[240px]
                px-10 py-4 rounded-2xl
                text-base font-semibold tracking-tight
                transition-all duration-200
                shadow-xl
                cursor-pointer
                ${
                  deckEnabled
                    ? 'bg-surface border border-border text-text hover:border-accent/50 hover:bg-white/[0.04]'
                    : 'bg-accent text-black shadow-accent/20 hover:bg-accent-hover'
                }
              `}
            >
              {label}
            </motion.button>

            <AnimatePresence mode="wait">
              {deckEnabled && recentDeckAdd && (
                <motion.div
                  key={recentDeckAdd.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )
      )}

      {showModal && lastPick && (
        <MovieModal movie={lastPick} onClose={() => setShowModal(false)} />
      )}

      {!deckEnabled && (
        <AnimatePresence>
          {lastPick && !showModal && (
            <motion.div
              key={lastPick.title}
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6">
                <p className="text-accent text-sm font-semibold tracking-wide">
                  Tonight&apos;s Pick
                </p>

                <p className="text-muted text-sm mt-1">
                  Click to expand details
                </p>
              </div>

              <div
                className="cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <MovieCard movie={lastPick} compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MoviePicker;