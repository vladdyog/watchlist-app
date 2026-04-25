import React, { useState } from "react";
import type { Movie } from "../types";

type Props = {
  movies: Movie[];
  onMoviePicked?: (movie: Movie) => void;
};

const MoviePicker: React.FC<Props> = ({ movies, onMoviePicked }) => {
  const [selected, setSelected] = useState<Movie | null>(null);

  const pickRandom = () => {
    if (movies.length === 0) return;
    const movie = movies[Math.floor(Math.random() * movies.length)];
    setSelected(movie);
    onMoviePicked?.(movie);
  };

  return (
    <div className="space-y-5">
      {movies.length === 0 ? (
        <p className="text-muted text-sm">
          No movies match the current filters.
        </p>
      ) : (
        <button
          onClick={pickRandom}
          className="bg-accent hover:bg-accent-hover text-bg font-medium text-sm px-8 py-3 rounded-lg transition-colors duration-150 cursor-pointer"
        >
          Pick a movie
        </button>
      )}

      {selected && (
        <div className="flex gap-5 bg-surface border border-border rounded-xl p-5">
          {selected.poster && (
            <img
              src={selected.poster}
              alt={selected.title}
              className="w-20 rounded-md flex-shrink-0 object-cover"
            />
          )}
          <div className="space-y-1.5 min-w-0">
            <p className="font-display text-xl text-text">{selected.title}</p>
            <p className="text-muted text-xs">
              {[
                selected.year,
                selected.runtime && `${selected.runtime} min`,
                selected.rating && `★ ${selected.rating.toFixed(1)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {selected.genres && (
              <p className="text-muted text-xs">{selected.genres.join(", ")}</p>
            )}
            {selected.overview && (
              <p className="text-text/70 text-sm leading-relaxed pt-1">
                {selected.overview}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviePicker;
