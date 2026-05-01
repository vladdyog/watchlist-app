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

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
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

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
  }}>
    {children}
  </p>
);

const MovieFilters: React.FC<Props> = ({ movies, filters, onChange }) => {
  const genres = getUniqueGenres(movies);
  const set = (partial: Partial<FilterOptions>) => onChange({ ...filters, ...partial });

  const toggleGenre = (genre: string) => {
    const current = filters.genres ?? [];
    set({ genres: current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre] });
  };

  const isActive = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Numeric filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <FieldLabel>Min rating</FieldLabel>
          <StyledInput
            type="number" min={0} max={10} step={0.1} placeholder="e.g. 7.5"
            value={filters.minRating ?? ''}
            onChange={(e) => set({ minRating: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div style={{ flex: 2, minWidth: '200px' }}>
          <FieldLabel>Runtime (min)</FieldLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            <StyledInput type="number" min={0} placeholder="Min"
              value={filters.minRuntime ?? ''}
              onChange={(e) => set({ minRuntime: e.target.value ? Number(e.target.value) : undefined })}
            />
            <StyledInput type="number" min={0} placeholder="Max"
              value={filters.maxRuntime ?? ''}
              onChange={(e) => set({ maxRuntime: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '200px' }}>
          <FieldLabel>Year</FieldLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            <StyledInput type="number" placeholder="From"
              value={filters.minYear ?? ''}
              onChange={(e) => set({ minYear: e.target.value ? Number(e.target.value) : undefined })}
            />
            <StyledInput type="number" placeholder="To"
              value={filters.maxYear ?? ''}
              onChange={(e) => set({ maxYear: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Genre pills — single color, clear active state */}
      {genres.length > 0 && (
        <div>
          <FieldLabel>Genres</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {genres.map((genre) => {
              const active = (filters.genres ?? []).includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border-light)'}`,
                    background: active ? 'rgba(255,128,0,0.12)' : 'var(--color-surface-2)',
                    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: '0.825rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--color-border-light)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  {active && <span style={{fontSize: '0.75rem' }}></span>}
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
              transition: 'all 0.15s',
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