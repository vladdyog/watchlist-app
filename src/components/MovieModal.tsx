import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';

import type { Movie } from '../types';

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
          backgroundColor: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(8px)',
        }}
        exit={{
          backgroundColor: 'rgba(0,0,0,0)',
          backdropFilter: 'blur(0px)',
        }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#171717] shadow-2xl shadow-black/50">
            {/* Poster */}
            <div className="aspect-[2/3] bg-surface overflow-hidden">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  🎬
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="font-display text-3xl leading-tight">
                  {movie.title}
                </h2>

                <p className="text-muted text-sm mt-2">
                  {[
                    movie.year,
                    movie.runtime && `${movie.runtime} min`,
                    movie.rating && `★ ${movie.rating.toFixed(1)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/6 text-muted"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {movie.overview && (
                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-sm leading-7 text-text/80">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-[#1d1d1d] border border-white/10 text-muted hover:text-text hover:border-accent/50 transition-all duration-150 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
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