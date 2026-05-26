import React from 'react';

import type { FilterOptions, Movie } from '../types';

// Extend FilterOptions locally to support excludedGenres.
// Also update your types.ts to add `excludedGenres?: string[]`
// and update filterMovies() to filter out movies whose genres intersect excludedGenres.
type ExtendedFilters = FilterOptions & { excludedGenres?: string[] };

type Props = {
  movies: Movie[];
  filters: ExtendedFilters;
  onChange: (filters: ExtendedFilters) => void;
};

function getUniqueGenres(movies: Movie[]): string[] {
  return Array.from(new Set(movies.flatMap((m) => m.genres ?? []))).sort();
}

type GenreState = 'neutral' | 'include' | 'exclude';

function nextState(current: GenreState): GenreState {
  if (current === 'neutral') return 'include';
  if (current === 'include') return 'exclude';
  return 'neutral';
}

// Only transition color-related properties - never layout - to avoid size-change jank on reset
const COLOR_TRANSITION =
  'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease';

const pillStyle = (state: GenreState): React.CSSProperties => {
  if (state === 'include')
    return {
      background: 'rgba(64,188,244,0.12)',
      borderColor: 'rgba(64,188,244,0.55)',
      color: '#40BCF4',
      fontWeight: 700,
    };
  if (state === 'exclude')
    return {
      background: 'rgba(229,83,83,0.12)',
      borderColor: 'rgba(229,83,83,0.55)',
      color: 'var(--color-danger)',
      fontWeight: 700,
    };
  return {
    background: 'var(--color-surface-2)',
    borderColor: 'var(--color-border-light)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  };
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  fontSize: '0.9rem',
  fontWeight: 500,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    style={inputStyle}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-accent)';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,128,0,0.08)';
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-border)';
      e.currentTarget.style.boxShadow = 'none';
      props.onBlur?.(e);
    }}
  />
);

const FieldLabel: React.FC<{
  children: React.ReactNode;
  noMargin?: boolean;
}> = ({ children, noMargin }) => (
  <p
    style={{
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--color-text-secondary)',
      marginBottom: noMargin ? 0 : '8px',
    }}
  >
    {children}
  </p>
);

const MovieFilters: React.FC<Props> = ({ movies, filters, onChange }) => {
  const genres = getUniqueGenres(movies);

  const set = (partial: Partial<ExtendedFilters>) =>
    onChange({ ...filters, ...partial });

  const getGenreState = (genre: string): GenreState => {
    if ((filters.genres ?? []).includes(genre)) return 'include';
    if ((filters.excludedGenres ?? []).includes(genre)) return 'exclude';
    return 'neutral';
  };

  const cycleGenre = (genre: string) => {
    const current = getGenreState(genre);
    const next = nextState(current);
    const included = (filters.genres ?? []).filter((g) => g !== genre);
    const excluded = (filters.excludedGenres ?? []).filter((g) => g !== genre);
    if (next === 'include')
      set({ genres: [...included, genre], excludedGenres: excluded });
    else if (next === 'exclude')
      set({ genres: included, excludedGenres: [...excluded, genre] });
    else set({ genres: included, excludedGenres: excluded });
  };

  const isActive = Object.entries(filters).some(([k, v]) =>
    k !== 'excludedGenres'
      ? Array.isArray(v)
        ? v.length > 0
        : v !== undefined
      : ((v as string[] | undefined) ?? []).length > 0,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Numeric filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <FieldLabel>Min rating</FieldLabel>
          <StyledInput
            type="number"
            min={0}
            max={10}
            step={0.1}
            placeholder="e.g. 7.5"
            value={filters.minRating ?? ''}
            onChange={(e) =>
              set({
                minRating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div style={{ flex: 2, minWidth: '200px' }}>
          <FieldLabel>Runtime (min)</FieldLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            <StyledInput
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
            />
            <StyledInput
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
            />
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '200px' }}>
          <FieldLabel>Year</FieldLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            <StyledInput
              type="number"
              placeholder="From"
              value={filters.minYear ?? ''}
              onChange={(e) =>
                set({
                  minYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <StyledInput
              type="number"
              placeholder="To"
              value={filters.maxYear ?? ''}
              onChange={(e) =>
                set({
                  maxYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Genre pills - tri-state, color-only transitions (no layout shift on reset) */}
      {genres.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <FieldLabel noMargin>Genres</FieldLabel>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['include', 'exclude'] as GenreState[]).map((state) => {
                const ps = pillStyle(state);
                return (
                  <span
                    key={state}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.71rem',
                      color: ps.color as string,
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: ps.color as string,
                      }}
                    />
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </span>
                );
              })}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '8px',
            }}
          >
            {genres.map((genre) => {
              const state = getGenreState(genre);
              const ps = pillStyle(state);
              return (
                <button
                  key={genre}
                  onClick={() => cycleGenre(genre)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '20px',
                    border: `1px solid ${ps.borderColor}`,
                    background: ps.background as string,
                    color: ps.color as string,
                    fontSize: '0.825rem',
                    fontWeight: ps.fontWeight,
                    cursor: 'pointer',
                    transition: COLOR_TRANSITION,
                    fontFamily: 'var(--font-body)',
                    width: '100%',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
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
        <div>
          <button
            onClick={() => onChange({})}
            style={{
              padding: '8px 18px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: COLOR_TRANSITION,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieFilters;
