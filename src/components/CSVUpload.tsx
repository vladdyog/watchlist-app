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

const ENRICHING_MESSAGES = [
  "Sit back and relax — we're gathering info on your watchlist...",
  'Good taste detected! Fetching all the details...',
  "Hold tight! We're looking up your movies...",
  'Consulting the cinema archives...',
  'Great watchlist! Give us a moment to look everything up...',
];

const EXPORT_GUIDES = [
  {
    source: 'IMDb',
    steps: [
      'Go to your profile',
      'Click `Watchlist`',
      'Click `Export` (top right of the list)',
      'Click the popup `Open exports page` and download the CSV from there',
    ],
  },
  {
    source: 'Letterboxd',
    steps: [
      'Go to your profile',
      'Click `Watchlist`',
      'Click `Export Watchlist` (button on the right)',
      'Choose how to name and where to save the CSV file and click `Save`',
    ],
  },
];

const ExportGuide: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-muted text-xs hover:text-text transition-colors duration-150 flex items-center gap-1.5 mx-auto"
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        How do I export my watchlist?
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {EXPORT_GUIDES.map(({ source, steps }) => (
            <div
              key={source}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-left"
            >
              <p className="text-accent text-xs font-medium uppercase tracking-wider mb-2">
                {source}
              </p>
              <ol className="space-y-1">
                {steps.map((step, i) => (
                  <li key={i} className="text-muted text-xs flex gap-2">
                    <span className="text-border select-none">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
    if (!file.name.endsWith('.csv')) {
      onError('Please upload a .csv file.');
      return;
    }
    setFileName(file.name);
    setIsParsing(true);
    const result = await parseCSV(file);
    setIsParsing(false);
    if (!result.success) {
      onError(result.error);
      return;
    }
    const movies = normalizeMovies(result.rows);
    if (movies.length === 0) {
      onError('No valid movies found in the CSV file.');
      return;
    }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node))
      setIsDragging(false);
  };

  const renderContent = () => {
    // Parsing
    if (isParsing) {
      return (
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-3">
          <svg
            className="animate-spin w-4 h-4 text-accent flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <div>
            <p className="text-text text-sm">Parsing {fileName}...</p>
            <p className="text-muted text-xs">Reading your watchlist</p>
          </div>
        </div>
      );
    }

    // Enriching
    if (isEnriching && progress) {
      const pct = Math.round((progress.completed / progress.total) * 100);
      const message =
        ENRICHING_MESSAGES[progress.total % ENRICHING_MESSAGES.length];
      return (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-start gap-4 text-sm">
            <span className="text-text">{message}</span>
            <span className="text-accent font-medium whitespace-nowrap">
              {progress.completed} / {progress.total}
            </span>
          </div>
          <div className="h-0.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-muted text-xs">{pct}% complete</p>
        </div>
      );
    }

    // Loaded (compact)
    if (movieCount > 0) {
      return (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-3.5 cursor-pointer hover:border-accent transition-colors duration-150 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-accent text-lg">✓</span>
            <div>
              <p className="text-text text-sm font-medium">
                {fileName ?? 'Watchlist loaded'}
              </p>
              <p className="text-muted text-xs">
                {movieCount} movies
                {enrichmentTime != null &&
                  ` · enriched in ${enrichmentTime.toFixed(1)}s`}
              </p>
            </div>
          </div>
          <span className="text-muted text-xs group-hover:text-accent transition-colors duration-150 whitespace-nowrap">
            Click to replace
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      );
    }

    // Empty (dropzone)
    return (
      <>
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${
              isDragging
                ? 'border-accent bg-accent/5'
                : 'border-border bg-surface hover:border-accent/50'
            }
          `}
        >
          <div
            className={`text-3xl mb-3 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-40'}`}
          >
            {isDragging ? '📂' : '📁'}
          </div>
          <p className="text-text text-sm mb-1">
            {isDragging
              ? 'Drop your CSV here'
              : 'Drop your CSV here or click to browse'}
          </p>
          <p className="text-muted text-xs">
            Supports IMDb and Letterboxd exports
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <ExportGuide />
      </>
    );
  };

  return <div className="w-full">{renderContent()}</div>;
};

export default CSVUpload;
