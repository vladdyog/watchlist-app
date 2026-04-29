// MoviePicker.tsx

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

  const pickRandom = () => {
    if (movies.length === 0) return;

    const movie = movies[Math.floor(Math.random() * movies.length)];

    // Normal mode only updates Last Pick
    if (!deckEnabled) {
      setShowModal(true);
    }

    onMoviePicked?.(movie);
  };

  const isEmpty = movies.length === 0;

  const label = deckEnabled
    ? 'Add to deck'
    : lastPick
      ? 'Pick another'
      : 'Pick a movie';

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-text text-sm">No movies match your filters</p>
          <p className="text-muted text-xs">
            Try adjusting or resetting the filters above
          </p>
        </div>
      ) : (
        !shuffleActive && (
          <motion.button
            onClick={pickRandom}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`
              px-12 py-4 rounded-full cursor-pointer
              text-sm font-normal u
              ${
                deckEnabled
                  ? 'bg-surface border border-border text-text hover:border-accent/50'
                  : 'bg-accent text-bg shadow-lg shadow-accent/25 hover:bg-accent-hover'
              }
            `}
          >
            {label}
          </motion.button>
        )
      )}

      {/* Modal */}
      {showModal && lastPick && (
        <MovieModal movie={lastPick} onClose={() => setShowModal(false)} />
      )}

      {/* Last Pick — normal mode only */}
      {!deckEnabled && (
        <AnimatePresence>
          {lastPick && !showModal && (
            <motion.div
              key={lastPick.title}
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <p className="text-muted text-xs uppercase tracking-wider mb-3 text-center">
                Last pick
              </p>

              <div
                className="cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <MovieCard movie={lastPick} compact />
              </div>

              <p className="text-center text-muted text-xs mt-2">
                Click to expand
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MoviePicker;
