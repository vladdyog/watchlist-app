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

    if (!deckEnabled) {
      setShowModal(true);
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
    <div className="flex flex-col items-center gap-8 py-6">
      {isEmpty ? (
        <div className="bg-surface/70 border border-border rounded-2xl px-8 py-10 text-center max-w-md w-full">
          <p className="text-white text-lg font-semibold">
            No movies match your filters
          </p>

          <p className="text-muted text-sm mt-2 leading-relaxed">
            Try adjusting your filters or resetting them to see more results.
          </p>
        </div>
      ) : (
        !shuffleActive && (
          <motion.button
            onClick={pickRandom}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={`
              relative overflow-hidden
              px-10 py-4 rounded-2xl
              font-semibold text-sm tracking-wide
              transition-all duration-300
              cursor-pointer
              shadow-[0_10px_30px_rgba(0,0,0,0.3)]
              ${
                deckEnabled
                  ? `
                    bg-surface-elevated
                    border border-border
                    text-white
                    hover:border-accent/40
                    hover:bg-surface
                  `
                  : `
                    bg-accent
                    text-bg
                    hover:bg-accent-hover
                    shadow-[0_10px_35px_rgba(255,184,77,0.25)]
                  `
              }
            `}
          >
            {label}
          </motion.button>
        )
      )}

      {showModal && lastPick && (
        <MovieModal movie={lastPick} onClose={() => setShowModal(false)} />
      )}

      {!deckEnabled && (
        <AnimatePresence mode="wait">
          {lastPick && !showModal && (
            <motion.div
              key={lastPick.title}
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="text-center mb-5">
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
