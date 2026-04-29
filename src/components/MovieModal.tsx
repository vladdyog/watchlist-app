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
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{
          backgroundColor: 'rgba(0,0,0,0)',
          backdropFilter: 'blur(0px)',
        }}
        animate={{
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
        }}
        exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {/* Card */}
        <motion.div
          className="relative w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-surface border border-border text-muted hover:text-text hover:border-accent transition-all duration-150 flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>

          <MovieCard movie={movie} />

          <p className="text-center text-muted text-xs mt-4">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-xs">
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
