import React, { useState } from "react";
import type { Movie } from "../types";

type Props = {
  movies: Movie[];
  onMoviePicked?: (movie: Movie) => void;
};

const btn = (disabled: boolean): React.CSSProperties => ({
  padding: "12px 32px",
  background: disabled ? "var(--surface)" : "var(--accent)",
  color: disabled ? "var(--muted)" : "#0f0f0f",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "DM Sans, sans-serif",
  transition: "background 0.15s",
});

const MoviePicker: React.FC<Props> = ({ movies, onMoviePicked }) => {
  const [selected, setSelected] = useState<Movie | null>(null);

  const pickRandom = () => {
    if (movies.length === 0) return;
    const movie = movies[Math.floor(Math.random() * movies.length)];
    setSelected(movie);
    onMoviePicked?.(movie);
  };

  return (
    <div>
      {movies.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          No movies match the current filters.
        </p>
      ) : (
        <button
          onClick={pickRandom}
          style={btn(false)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
        >
          Pick a movie
        </button>
      )}

      {selected && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          {selected.poster && (
            <img
              src={selected.poster}
              alt={selected.title}
              style={{ width: "80px", borderRadius: "4px", flexShrink: 0 }}
            />
          )}
          <div>
            <p
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: "1.2rem",
                margin: "0 0 4px",
              }}
            >
              {selected.title}
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.8rem",
                margin: "0 0 8px",
              }}
            >
              {[
                selected.year,
                selected.runtime && `${selected.runtime} min`,
                selected.rating && `★ ${selected.rating.toFixed(1)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {selected.genres && (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.8rem",
                  margin: "0 0 8px",
                }}
              >
                {selected.genres.join(", ")}
              </p>
            )}
            {selected.overview && (
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  margin: 0,
                  color: "var(--text)",
                  opacity: 0.8,
                }}
              >
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
