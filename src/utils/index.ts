// Utility functions will go here
import Papa from "papaparse";

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
