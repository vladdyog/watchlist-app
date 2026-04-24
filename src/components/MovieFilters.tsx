import React from "react";
import type { FilterOptions, Movie } from "../types";

type Props = {
  movies: Movie[];
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
};

function getUniqueGenres(movies: Movie[]): string[] {
  const all = movies.flatMap((m) => m.genres ?? []);
  return Array.from(new Set(all)).sort();
}

const MovieFilters: React.FC<Props> = ({ movies, filters, onChange }) => {
  const genres = getUniqueGenres(movies);

  const set = (partial: Partial<FilterOptions>) => {
    onChange({ ...filters, ...partial });
  };

  const isActive = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined,
  );

  const toggleGenre = (genre: string) => {
    const current = filters.genres ?? [];
    const updated = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    set({ genres: updated });
  };

  return (
    <div>
      <h3>Filters</h3>

      <div>
        <label>Min rating:</label>
        <input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={filters.minRating ?? ""}
          onChange={(e) =>
            set({
              minRating: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div>
        <label>Runtime (mins):</label>
        <input
          type="number"
          min={0}
          placeholder="Min"
          value={filters.minRuntime ?? ""}
          onChange={(e) =>
            set({
              minRuntime: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
        <input
          type="number"
          min={0}
          placeholder="Max"
          value={filters.maxRuntime ?? ""}
          onChange={(e) =>
            set({
              maxRuntime: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div>
        <label>Year:</label>
        <input
          type="number"
          placeholder="From"
          value={filters.minYear ?? ""}
          onChange={(e) =>
            set({
              minYear: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
        <input
          type="number"
          placeholder="To"
          value={filters.maxYear ?? ""}
          onChange={(e) =>
            set({
              maxYear: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div>
        <label>Added to watchlist:</label>
        <input
          type="date"
          value={filters.addedAfter ?? ""}
          onChange={(e) => set({ addedAfter: e.target.value || undefined })}
        />
        <input
          type="date"
          value={filters.addedBefore ?? ""}
          onChange={(e) => set({ addedBefore: e.target.value || undefined })}
        />
      </div>

      {genres.length > 0 && (
        <div>
          <label>Genres:</label>
          {genres.map((genre) => (
            <label key={genre}>
              <input
                type="checkbox"
                checked={(filters.genres ?? []).includes(genre)}
                onChange={() => toggleGenre(genre)}
              />
              {genre}
            </label>
          ))}
        </div>
      )}

      {isActive && (
        <button onClick={() => onChange({})}>Reset all filters</button>
      )}
    </div>
  );
};

export default MovieFilters;
