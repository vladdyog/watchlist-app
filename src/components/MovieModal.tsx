import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';

import type { Movie } from '../types';
import MovieCard from './MovieCard';

type Props = {
  movie: Movie;
  onClose: () => void;
};

const MovieModal: React.FC<Props> = ({ movie, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{
          backgroundColor: 'rgba(0,0,0,0)',
          backdropFilter: 'blur(0px)',
        }}
        animate={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
        }}
        exit={{
          backgroundColor: 'rgba(0,0,0,0)',
          backdropFilter: 'blur(0px)',
        }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md max-h-[90svh] flex flex-col"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="
              absolute -top-4 -right-4
              z-10
              w-10 h-10
              rounded-full
              bg-surface-elevated/95
              backdrop-blur-md
              border border-border
              text-muted
              hover:text-white
              hover:border-accent/50
              transition-all duration-200
              flex items-center justify-center
              text-sm
              shadow-lg
              cursor-pointer
            "
          >
            ✕
          </button>

          <div className="overflow-y-auto rounded-2xl">
            <MovieCard movie={movie} />
          </div>

          <p className="text-center text-muted text-sm mt-5">
            Press{' '}
            <kbd className="px-2 py-1 bg-surface-elevated border border-border rounded-md text-xs">
              Esc
            </kbd>{' '}
            or click outside to close
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieModal;
