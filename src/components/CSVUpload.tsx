import React from "react";
import { parseCSV, normalizeMovies } from "../utils";
import type { Movie } from "../types";

type Props = {
  onMoviesLoaded: (movies: Movie[]) => void;
  onError: (error: string) => void;
};

const CSVUpload: React.FC<Props> = ({ onMoviesLoaded, onError }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await parseCSV(file);
    if (!result.success) {
      onError(result.error);
      return;
    }
    const movies = normalizeMovies(result.rows);
    if (movies.length === 0) {
      onError("No valid movies found in the CSV file.");
      return;
    }
    onMoviesLoaded(movies);
  };

  return (
    <div>
      <label
        htmlFor="csv-upload"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.875rem",
          color: "var(--text)",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        Upload CSV
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>
      <p
        style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "8px" }}
      >
        Supports IMDb and Letterboxd exports
      </p>
    </div>
  );
};

export default CSVUpload;
