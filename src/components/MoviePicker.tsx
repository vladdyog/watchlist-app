import React, { useState } from "react";
import type { Movie } from "../types";

type Props = {
  movies: Movie[];
};

const MoviePicker: React.FC<Props> = ({ movies }) => {
  const [selected, setSelected] = useState<Movie | null>(null);

  const pickRandom = () => {
    if (movies.length === 0) return;
    const index = Math.floor(Math.random() * movies.length);
    setSelected(movies[index]);
  };

  return (
    <div>
      {movies.length === 0 ? (
        <p>No movies loaded yet.</p>
      ) : (
        <button onClick={pickRandom}>Pick a movie!</button>
      )}

      {selected && (
        <p>
          {selected.title}
          {selected.year ? ` (${selected.year})` : ""}
        </p>
      )}
    </div>
  );
};

export default MoviePicker;
