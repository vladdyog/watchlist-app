import Papa from "papaparse";
import type { Movie } from "../types";

type CSVSource = "imdb" | "letterboxd" | "unknown";

function detectSource(headers: string[]): CSVSource {
  if (headers.includes("Title") && headers.includes("Title Type"))
    return "imdb";
  if (headers.includes("Name") && headers.includes("Letterboxd URI"))
    return "letterboxd";
  return "unknown";
}

function parseNumber(raw: string | undefined): number | undefined {
  if (!raw || raw.trim() === "") return undefined;
  const parsed = Number(raw);
  return isNaN(parsed) ? undefined : parsed;
}

function parseGenres(raw: string | undefined): string[] | undefined {
  if (!raw || raw.trim() === "") return undefined;
  return raw
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g !== "");
}

export function normalizeMovies(rows: Record<string, string>[]): Movie[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const source = detectSource(headers);

  return rows
    .map((row) => {
      let title: string;
      let year: number | undefined;
      let rating: number | undefined;
      let genres: string[] | undefined;
      let runtime: number | undefined;
      let dateAdded: string | undefined;

      if (source === "imdb") {
        title = row["Title"] ?? "";
        year = parseNumber(row["Year"]);
        rating = parseNumber(row["IMDb Rating"]);
        genres = parseGenres(row["Genres"]);
        runtime = parseNumber(row["Runtime (mins)"]);
        dateAdded = row["Created"] ?? undefined;
      } else if (source === "letterboxd") {
        title = row["Name"] ?? "";
        year = parseNumber(row["Year"]);
        // Letterboxd watchlist export does not include rating
        dateAdded = row["Date"] ?? undefined;
      } else {
        title =
          row["Title"] ?? row["title"] ?? row["Name"] ?? row["name"] ?? "";
        year = parseNumber(row["Year"] ?? row["year"]);
      }

      return { title: title.trim(), year, rating, genres, runtime, dateAdded };
    })
    .filter((movie) => movie.title !== "");
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

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
