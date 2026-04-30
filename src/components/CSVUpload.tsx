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
  "Sit back and relax - we're gathering info on your watchlist...",
  'Good taste detected! Fetching all the details...',
  "Hold tight! We're looking up your movies...",
  'Consulting the cinema archives...',
  'Great watchlist! Give us a moment to look everything up...',
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
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const renderContent = () => {
    if (isParsing) {
      return (
        <div className="bg-surface/80 border border-border rounded-3xl p-6 flex items-center gap-4 backdrop-blur-sm">
          <svg
            className="animate-spin w-5 h-5 text-accent flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-100"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>

          <div>
            <p className="text-white text-sm font-semibold">
              Parsing {fileName}...
            </p>

            <p className="text-muted text-sm mt-1">Reading your watchlist</p>
          </div>
        </div>
      );
    }

    if (isEnriching && progress) {
      const pct = Math.round((progress.completed / progress.total) * 100);

      const message =
        ENRICHING_MESSAGES[progress.total % ENRICHING_MESSAGES.length];

      return (
        <div className="bg-surface/80 border border-border rounded-3xl p-6 space-y-5 backdrop-blur-sm">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-white text-sm font-semibold leading-relaxed">
                {message}
              </p>

              <p className="text-muted text-sm mt-2">
                {progress.completed} / {progress.total} movies collected
              </p>
            </div>

            <div className="text-accent font-bold text-lg whitespace-nowrap">
              {pct}%
            </div>
          </div>

          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    }

    if (movieCount > 0) {
      return (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="
            flex flex-col sm:flex-row sm:items-center sm:justify-between
            gap-5
            bg-surface/80
            border border-border
            rounded-3xl
            px-6 py-5
            cursor-pointer
            hover:border-accent/40
            transition-all duration-200
            backdrop-blur-sm
            group
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
              w-11 h-11 rounded-2xl
              bg-accent/10
              flex items-center justify-center
              text-accent text-lg
            "
            >
              ✓
            </div>

            <div>
              <p className="text-white text-sm font-semibold">
                {fileName ?? 'Watchlist loaded'}
              </p>

              <p className="text-muted text-sm mt-1">
                {movieCount} movies
                {enrichmentTime != null &&
                  ` · enriched in ${enrichmentTime.toFixed(1)}s`}
              </p>
            </div>
          </div>

          <p className="text-muted text-sm group-hover:text-white transition-colors duration-200">
            Click to replace
          </p>

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

    return (
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-[2rem]
          p-12 sm:p-16
          text-center
          cursor-pointer
          transition-all duration-300
          backdrop-blur-sm
          ${
            isDragging
              ? `
                border-accent
                bg-accent/10
                scale-[1.01]
              `
              : `
                border-border
                bg-surface/50
                hover:border-accent/40
                hover:bg-surface/70
              `
          }
        `}
      >
        <div
          className={`
            text-5xl mb-5 transition-all duration-300
            ${isDragging ? 'scale-110' : 'opacity-70'}
          `}
        >
          {isDragging ? '📂' : '📁'}
        </div>

        <p className="text-white text-lg font-semibold">
          {isDragging
            ? 'Drop your CSV here'
            : 'Drop your CSV here or click to browse'}
        </p>

        <p className="text-muted text-sm mt-3 leading-relaxed">
          Supports IMDb and Letterboxd exports
          <br />
          or click to browse files
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  };

  return <div className="w-full">{renderContent()}</div>;
};

export default CSVUpload;
