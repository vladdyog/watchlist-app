import React, { useState } from "react";
import CSVUpload from "./components/CSVUpload";
import MoviePicker from "./components/MoviePicker";
import type { Movie } from "./types";

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

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
