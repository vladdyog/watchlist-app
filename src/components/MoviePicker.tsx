import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";
import type { Movie } from "../types";

type Props = {
  movies: Movie[];
  onMoviePicked?: (movie: Movie) => void;
};

const MoviePicker: React.FC<Props> = ({ movies, onMoviePicked }) => {
  const [selected, setSelected] = useState<Movie | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pickRandom = () => {
    if (movies.length === 0) return;
    const movie = movies[Math.floor(Math.random() * movies.length)];
    setSelected(movie);
    setShowModal(true);
    onMoviePicked?.(movie);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {movies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-text text-sm">No movies match your filters</p>
          <p className="text-muted text-xs">
            Try adjusting or resetting the filters above
          </p>
        </div>
      ) : (
        <motion.button
          onClick={pickRandom}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="bg-accent text-bg font-medium text-base px-12 py-4 rounded-full cursor-pointer shadow-lg shadow-accent/25"
        >
          {selected ? "Pick another" : "Pick a movie"}
        </motion.button>
      )}

      {/* Modal — animates in on pick */}
      {showModal && selected && (
        <MovieModal movie={selected} onClose={() => setShowModal(false)} />
      )}

      {/* Compact inline card — shown after modal is closed */}
      <AnimatePresence>
        {selected && !showModal && (
          <motion.div
            key={selected.title}
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="text-muted text-xs uppercase tracking-wider mb-3 text-center">
              Last pick
            </p>
            <div className="cursor-pointer" onClick={() => setShowModal(true)}>
              <MovieCard movie={selected} compact />
            </div>
            <p className="text-center text-muted text-xs mt-2">
              Click to expand
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoviePicker;
