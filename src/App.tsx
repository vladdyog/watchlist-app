import React, { useState, useEffect } from "react";
import CSVUpload from "./components/CSVUpload";
import MoviePicker from "./components/MoviePicker";
import type { Movie } from "./types";

const STORAGE_KEY = "watchlist";

function loadMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Movie[];
  } catch {
    return [];
  }
}

function saveMovies(movies: Movie[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(loadMovies);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveMovies(movies);
  }, [movies]);

  return (
    <div>
      <h1>Watchlist Movie Picker</h1>

      <CSVUpload onMoviesLoaded={setMovies} onError={setError} />

      {error && <p>{error}</p>}

      {movies.length > 0 && <p>{movies.length} movies loaded.</p>}

      <MoviePicker movies={movies} />
    </div>
  );
};

export default App;
