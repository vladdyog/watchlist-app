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

function parseYear(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? undefined : parsed;
}

export function normalizeMovies(rows: Record<string, string>[]): Movie[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const source = detectSource(headers);

  return rows
    .map((row) => {
      let title: string;
      let year: number | undefined;

      if (source === "imdb") {
        title = row["Title"] ?? "";
        year = parseYear(row["Year"]);
      } else if (source === "letterboxd") {
        title = row["Name"] ?? "";
        year = parseYear(row["Year"]);
      } else {
        // unknown source: try common column names
        title =
          row["Title"] ?? row["title"] ?? row["Name"] ?? row["name"] ?? "";
        year = parseYear(row["Year"] ?? row["year"]);
      }

      return { title: title.trim(), year };
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
