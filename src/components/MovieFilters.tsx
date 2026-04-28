import React from "react";
import type { FilterOptions, Movie } from "../types";

type Props = {
  movies: Movie[];
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
};

function getUniqueGenres(movies: Movie[]): string[] {
  return Array.from(new Set(movies.flatMap((m) => m.genres ?? []))).sort();
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-muted text-xs uppercase tracking-wider mb-2">{children}</p>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = "",
  ...props
}) => (
  <input
    {...props}
    className={`bg-surface border border-border rounded-lg text-text text-sm px-3 py-2 placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150 ${className}`}
  />
);

const MovieFilters: React.FC<Props> = ({ movies, filters, onChange }) => {
  const genres = getUniqueGenres(movies);
  const set = (partial: Partial<FilterOptions>) =>
    onChange({ ...filters, ...partial });

  const toggleGenre = (genre: string) => {
    const current = filters.genres ?? [];
    set({
      genres: current.includes(genre)
        ? current.filter((g) => g !== genre)
        : [...current, genre],
    });
  };

  const isActive = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined,
  );

  return (
    <div className="space-y-6">
      {/* Row 1 — Rating, Runtime, Year */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <Label>Min rating</Label>
          <Input
            type="number"
            min={0}
            max={10}
            step={0.1}
            placeholder="e.g. 7.5"
            value={filters.minRating ?? ""}
            onChange={(e) =>
              set({
                minRating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full"
          />
        </div>

        <div className="flex-1">
          <Label>Runtime (min)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={filters.minRuntime ?? ""}
              onChange={(e) =>
                set({
                  minRuntime: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full"
            />
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={filters.maxRuntime ?? ""}
              onChange={(e) =>
                set({
                  maxRuntime: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="flex-1">
          <Label>Year</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="From"
              value={filters.minYear ?? ""}
              onChange={(e) =>
                set({
                  minYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full"
            />
            <Input
              type="number"
              placeholder="To"
              value={filters.maxYear ?? ""}
              onChange={(e) =>
                set({
                  maxYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Row 2 — Genres */}
      {genres.length > 0 && (
        <div>
          <Label>Genres</Label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const active = (filters.genres ?? []).includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`
                    px-3 py-1 rounded-full text-xs border transition-all duration-150 cursor-pointer
                    ${
                      active
                        ? "bg-accent border-accent text-bg"
                        : "bg-transparent border-border text-muted hover:border-accent/50 hover:text-text"
                    }
                  `}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      {isActive && (
        <button
          onClick={() => onChange({})}
          className="text-muted text-xs border border-border rounded-lg px-3 py-1.5 hover:border-accent/50 hover:text-text transition-all duration-150 cursor-pointer"
        >
          Reset filters
        </button>
      )}
    </div>
  );
};

export default MovieFilters;
