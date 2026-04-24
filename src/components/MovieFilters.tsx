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

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--text)",
  padding: "8px 12px",
  fontSize: "0.875rem",
  width: "120px",
  fontFamily: "DM Sans, sans-serif",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: "6px",
};

const filterRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "24px",
  marginBottom: "20px",
};

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
    <div>
      <div style={filterRow}>
        <div>
          <label style={labelStyle}>Min rating</label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            placeholder="0.0"
            value={filters.minRating ?? ""}
            onChange={(e) =>
              set({
                minRating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Runtime (min)</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
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
              style={{ ...inputStyle, width: "80px" }}
            />
            <input
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
              style={{ ...inputStyle, width: "80px" }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Year</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              placeholder="From"
              value={filters.minYear ?? ""}
              onChange={(e) =>
                set({
                  minYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              style={{ ...inputStyle, width: "90px" }}
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
              style={{ ...inputStyle, width: "90px" }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Added to watchlist</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="date"
              value={filters.addedAfter ?? ""}
              onChange={(e) => set({ addedAfter: e.target.value || undefined })}
              style={{ ...inputStyle, width: "auto" }}
            />
            <input
              type="date"
              value={filters.addedBefore ?? ""}
              onChange={(e) =>
                set({ addedBefore: e.target.value || undefined })
              }
              style={{ ...inputStyle, width: "auto" }}
            />
          </div>
        </div>
      </div>

      {genres.length > 0 && (
        <div>
          <label style={labelStyle}>Genres</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {genres.map((genre) => {
              const active = (filters.genres ?? []).includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "#0f0f0f" : "var(--muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isActive && (
        <button
          onClick={() => onChange({})}
          style={{
            marginTop: "16px",
            padding: "6px 14px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--muted)",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Reset filters
        </button>
      )}
    </div>
  );
};

export default MovieFilters;
