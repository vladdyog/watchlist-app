import React from 'react';

import type { Movie } from '../types';

type Props = {
  movie: Movie;
  compact?: boolean;
};

const PLACEHOLDER = (
  <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-muted text-5xl">
    🎬
  </div>
);

const MovieCard: React.FC<Props> = ({ movie, compact = false }) => {
  return (
    <div
      className={`
        group
        bg-surface/95
        border border-border/70
        rounded-2xl
        overflow-hidden
        shadow-[0_12px_40px_rgba(0,0,0,0.35)]
        hover:border-accent/30
        hover:-translate-y-1
        transition-all duration-300
        backdrop-blur-sm
        ${compact ? 'flex gap-5 p-5 items-start' : 'flex flex-col'}
      `}
    >
      <div
        className={`
          overflow-hidden flex-shrink-0 bg-surface-elevated
          ${compact ? 'w-20 h-28 rounded-xl' : 'w-full aspect-[2/3]'}
        `}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          PLACEHOLDER
        )}
      </div>

      <div className={`${compact ? 'flex-1 min-w-0' : 'p-6'} flex flex-col`}>
        <h3
          className={`
            font-display
            font-bold
            tracking-tight
            leading-tight
            text-white
            ${compact ? 'text-xl' : 'text-3xl'}
          `}
        >
          {movie.title}
        </h3>

        <p className="text-muted text-sm font-medium mt-3">
          {[
            movie.year,
            movie.runtime && `${movie.runtime} min`,
            movie.rating && `★ ${movie.rating.toFixed(1)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="
                  text-xs
                  px-3 py-1
                  rounded-full
                  bg-white/5
                  border border-white/8
                  text-muted
                  backdrop-blur-sm
                "
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {!compact && movie.overview && (
          <p className="text-muted text-[15px] leading-7 mt-6">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
