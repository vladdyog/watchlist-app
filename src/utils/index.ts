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

      if (source === "imdb") {
        title = row["Title"] ?? "";
        year = Number(row["Year"]) || undefined;
        dateAdded = row["Created"] ?? undefined;
      } else if (source === "letterboxd") {
        title = row["Name"] ?? "";
        year = Number(row["Year"]) || undefined;
        dateAdded = row["Date"] ?? undefined;
      } else {
        title =
          row["Title"] ?? row["title"] ?? row["Name"] ?? row["name"] ?? "";
        year = Number(row["Year"] ?? row["year"]) || undefined;
      }

      return { title: title.trim(), year, dateAdded };
    })
    .filter((movie) => movie.title !== "");
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
