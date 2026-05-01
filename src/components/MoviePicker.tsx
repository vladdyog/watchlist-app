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
    if (!deckEnabled) setShowModal(true);
    onMoviePicked?.(movie);
  };

  const isEmpty = movies.length === 0;
  const label = deckEnabled ? '+ Add to Deck' : lastPick ? 'Pick Again' : 'Pick a Film';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      {isEmpty ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            No films match your filters
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px', fontWeight: 500 }}>
            Try adjusting or resetting the filters above
          </p>
        </div>
      ) : (
        !shuffleActive && (
          <motion.button
            onClick={pickRandom}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{
              padding: deckEnabled ? '13px 32px' : '17px 56px',
              borderRadius: '50px',
              border: deckEnabled ? '1px solid var(--color-border)' : 'none',
              background: deckEnabled
                ? 'var(--color-surface)'
                : 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
              color: deckEnabled ? 'var(--color-text-secondary)' : 'white',
              fontSize: deckEnabled ? '0.9rem' : '1.1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: deckEnabled ? 'none' : '0 0 40px rgba(255,128,0,0.3), 0 8px 24px rgba(255,128,0,0.2)',
            }}
          >
            {label}
          </motion.button>
        )
      )}

      {/* Modal */}
      {showModal && lastPick && (
        <MovieModal movie={lastPick} onClose={() => setShowModal(false)} />
      )}

      {/* Last pick — normal mode */}
      {!deckEnabled && (
        <AnimatePresence>
          {lastPick && !showModal && (
            <motion.div
              key={lastPick.title}
              style={{ width: '100%', maxWidth: '420px' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                  Tonight's Pick
                </p>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>

              <div style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
                <MovieCard movie={lastPick} compact />
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '10px', fontWeight: 500 }}>
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