import { motion } from 'framer-motion';
import React from 'react';

import type { Movie } from '../types';
import MovieCard from './MovieCard';

type Props = {
  movie: Movie;
  onCardClick: () => void;
  onRemove?: (movie: Movie) => void;
};

const TonightsPick: React.FC<Props> = ({ movie, onCardClick, onRemove }) => (
  <motion.div
    key={movie.title}
    style={{ width: '100%', maxWidth: '420px' }}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 12 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {/* Divider label */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '14px',
      }}
    >
      <div
        style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}
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
        style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}
      />
    </div>

    {/* Compact card */}
    <div style={{ cursor: 'pointer' }} onClick={onCardClick}>
      <MovieCard movie={movie} compact />
    </div>

    {/* Hint */}
    <p
      style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--color-muted)',
        marginTop: '10px',
        fontWeight: 500,
      }}
    >
      Click to Expand
    </p>

    {/* Watch & remove */}
    {onRemove && (
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => onRemove(movie)}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '6px 16px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-danger)';
            e.currentTarget.style.color = 'var(--color-danger)';
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Watch &amp; Remove From List
        </button>
      </div>
    )}
  </motion.div>
);

export default TonightsPick;
