import Papa from 'papaparse';

import type { Movie } from '../types';

type CSVSource = 'imdb' | 'letterboxd' | 'unknown';

function detectSource(headers: string[]): CSVSource {
  if (headers.includes('Title') && headers.includes('Title Type'))
    return 'imdb';
  if (headers.includes('Name') && headers.includes('Letterboxd URI'))
    return 'letterboxd';
  return 'unknown';
}

// Only extracts title, year, and dateAdded — everything else comes from TMDb
export function normalizeMovies(rows: Record<string, string>[]): Movie[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const source = detectSource(headers);

  return rows
    .map((row) => {
      let title: string;
      let year: number | undefined;
      let dateAdded: string | undefined;

      if (source === 'imdb') {
        title = row['Title'] ?? '';
        year = Number(row['Year']) || undefined;
        dateAdded = row['Created'] ?? undefined;
      } else if (source === 'letterboxd') {
        title = row['Name'] ?? '';
        year = Number(row['Year']) || undefined;
        dateAdded = row['Date'] ?? undefined;
      } else {
        title =
          row['Title'] ?? row['title'] ?? row['Name'] ?? row['name'] ?? '';
        year = Number(row['Year'] ?? row['year']) || undefined;
      }

      return { title: title.trim(), year, dateAdded };
    })
    .filter((movie) => movie.title !== '');
}

export function filterMovies(
  movies: Movie[],
  filters: import('../types').FilterOptions,
): Movie[] {
  return movies.filter((movie) => {
    if (
      filters.minRating !== undefined &&
      (movie.rating ?? 0) < filters.minRating
    )
      return false;
    if (
      filters.minRuntime !== undefined &&
      (movie.runtime ?? 0) < filters.minRuntime
    )
      return false;
    if (
      filters.maxRuntime !== undefined &&
      (movie.runtime ?? Infinity) > filters.maxRuntime
    )
      return false;
    if (filters.minYear !== undefined && (movie.year ?? 0) < filters.minYear)
      return false;
    if (
      filters.maxYear !== undefined &&
      (movie.year ?? Infinity) > filters.maxYear
    )
      return false;

    if (filters.genres && filters.genres.length > 0) {
      const movieGenres = movie.genres ?? [];
      const hasGenre = filters.genres.some((g) => movieGenres.includes(g));
      if (!hasGenre) return false;
    }

    if (filters.addedAfter && movie.dateAdded) {
      if (movie.dateAdded < filters.addedAfter) return false;
    }

    if (filters.addedBefore && movie.dateAdded) {
      if (movie.dateAdded > filters.addedBefore) return false;
    }

    return true;
  });
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export type ParsedRow = Record<string, string>;

export type ParseCSVResult =
  | { success: true; rows: ParsedRow[] }
  | { success: false; error: string };

export function parseCSV(file: File): Promise<ParseCSVResult> {
  return new Promise((resolve) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({ success: false, error: results.errors[0].message });
        } else {
          resolve({ success: true, rows: results.data });
        }
      },
      error: (error) => {
        resolve({ success: false, error: error.message });
      },
    });
  });
}
