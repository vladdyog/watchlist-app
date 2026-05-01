import React, { useRef, useState } from 'react';

import type { Movie } from '../types';
import { normalizeMovies, parseCSV } from '../utils';

type Props = {
  movieCount: number;
  isEnriching: boolean;
  progress: { completed: number; total: number } | null;
  enrichmentTime: number | null;
  onMoviesLoaded: (movies: Movie[]) => void;
  onError: (error: string) => void;
};

const MESSAGES = [
  'Consulting the cinema archives…',
  'Fetching film details from TMDb…',
  'Cross-referencing your watchlist…',
  'Loading posters, ratings, runtimes…',
  'Almost there — just a few more…',
];

const CSVUpload: React.FC<Props> = ({
  movieCount,
  isEnriching,
  progress,
  enrichmentTime,
  onMoviesLoaded,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) { onError('Please upload a .csv file.'); return; }
    setFileName(file.name);
    setIsParsing(true);
    const result = await parseCSV(file);
    setIsParsing(false);
    if (!result.success) { onError(result.error); return; }
    const movies = normalizeMovies(result.rows);
    if (movies.length === 0) { onError('No valid movies found in the CSV file.'); return; }
    onMoviesLoaded(movies);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    border: `1px solid var(--color-border)`,
    background: 'var(--color-surface)',
  };

  // Parsing
  if (isParsing) {
    return (
      <div style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <svg className="animate-spin" style={{ width: 20, height: 20, color: 'var(--color-accent)', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}>Reading {fileName}…</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Parsing your watchlist</p>
        </div>
      </div>
    );
  }

  // Enriching
  if (isEnriching && progress) {
    const pct = Math.round((progress.completed / progress.total) * 100);
    const msg = MESSAGES[progress.total % MESSAGES.length];
    return (
      <div style={{ ...cardStyle, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{msg}</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>
            {progress.completed} / {progress.total}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '3px',
            background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-hover))',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '8px', fontWeight: 600 }}>{pct}% complete</p>
      </div>
    );
  }

  // Loaded
  if (movieCount > 0) {
    return (
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          ...cardStyle,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,128,0,0.12)',
            border: '1px solid rgba(255,128,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: 'var(--color-accent)',
          }}>✓</div>
          <div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {fileName ?? 'Watchlist loaded'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: 500 }}>
              {movieCount} films{enrichmentTime != null ? ` · enriched in ${enrichmentTime.toFixed(1)}s` : ''}
            </p>
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 600 }}>Click to replace</span>
        <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  // Empty dropzone
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        borderRadius: '12px',
        border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
        background: isDragging ? 'rgba(255,128,0,0.04)' : 'var(--color-surface)',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
    >
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '16px',
        filter: isDragging ? 'none' : 'grayscale(1)',
        opacity: isDragging ? 1 : 0.5,
        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s',
      }}>
        {isDragging ? '📂' : '📁'}
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>
        {isDragging ? 'Drop your CSV here' : 'Drop your watchlist CSV here'}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
        or click to browse
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '8px', fontWeight: 500 }}>
        Supports IMDb and Letterboxd exports
      </p>
      <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

export default CSVUpload;