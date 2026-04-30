import React from 'react';

import type { FilterOptions, Movie } from '../types';

type Props = {
  movies: Movie[];
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
};

function getUniqueGenres(movies: Movie[]): string[] {
  return Array.from(new Set(movies.flatMap((m) => m.genres ?? []))).sort();
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm font-semibold text-white mb-3 tracking-tight">
    {children}
  </p>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => (
  <input
    {...props}
    className={`
      bg-surface-elevated
      border border-border/70
      rounded-xl
      text-white
      text-sm
      px-4 py-3
      placeholder:text-muted
      focus:outline-none
      focus:ring-2
      focus:ring-accent/20
      focus:border-accent
      transition-all duration-200
      ${className}
    `}
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
    <div className="bg-surface/60 border border-border/70 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <Label>Minimum rating</Label>

            <Input
              type="number"
              min={0}
              max={10}
              step={0.1}
              placeholder="e.g. 7.5"
              value={filters.minRating ?? ''}
              onChange={(e) =>
                set({
                  minRating: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <Label>Runtime (minutes)</Label>

            <div className="flex gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={filters.minRuntime ?? ''}
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
                value={filters.maxRuntime ?? ''}
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

          <div>
            <Label>Release year</Label>

            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="From"
                value={filters.minYear ?? ''}
                onChange={(e) =>
                  set({
                    minYear: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full"
              />

              <Input
                type="number"
                placeholder="To"
                value={filters.maxYear ?? ''}
                onChange={(e) =>
                  set({
                    maxYear: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {genres.length > 0 && (
          <div>
            <Label>Genres</Label>

            <div className="flex flex-wrap gap-3">
              {genres.map((genre) => {
                const active = (filters.genres ?? []).includes(genre);

                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      border transition-all duration-200
                      cursor-pointer
                      ${
                        active
                          ? `
                            bg-accent
                            border-accent
                            text-bg
                            shadow-[0_4px_18px_rgba(255,184,77,0.25)]
                          `
                          : `
                            bg-white/[0.03]
                            border-border
                            text-muted
                            hover:border-accent/40
                            hover:text-white
                          `
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

        {isActive && (
          <div className="pt-2">
            <button
              onClick={() => onChange({})}
              className="
                text-sm
                font-medium
                text-muted
                border border-border
                rounded-xl
                px-4 py-2.5
                hover:border-accent/40
                hover:text-white
                transition-all duration-200
                cursor-pointer
              "
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieFilters;
