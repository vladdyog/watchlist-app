import React from 'react';

import type { Movie } from '../types';

type Props = {
  movie: Movie;
  compact?: boolean;
};

const PLACEHOLDER = (
  <div className="w-full h-full flex items-center justify-center bg-surface text-muted text-4xl">
    🎬
  </div>
);

const MovieCard: React.FC<Props> = ({ movie, compact = false }) => {
  return (
    <div
      className={`
      bg-surface border border-border rounded-xl overflow-hidden
      ${compact ? 'flex gap-4 p-4' : 'flex flex-col'}
    `}
    >
      {/* Poster */}
      <div
        className={`
        bg-surface overflow-hidden flex-shrink-0
        ${compact ? 'w-16 h-24 rounded-lg' : 'w-full aspect-[2/3]'}
      `}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          PLACEHOLDER
        )}
      </div>

      {/* Info */}
      <div className={`${compact ? '' : 'p-4'} flex flex-col gap-2 min-w-0`}>
        {/* Title */}
        <p
          className={`font-display text-text leading-tight ${compact ? 'text-base' : 'text-xl'}`}
        >
          {movie.title}
        </p>

        {/* Meta row */}
        <p className="text-muted text-xs">
          {[
            movie.year,
            movie.runtime && `${movie.runtime} min`,
            movie.rating && `★ ${movie.rating.toFixed(1)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>

        {/* Genre badges */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-0.5 rounded-full border border-border text-muted"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Overview — full card only */}
        {!compact && movie.overview && (
          <p className="text-text/70 text-sm leading-relaxed mt-1">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
