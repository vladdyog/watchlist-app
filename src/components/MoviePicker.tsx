import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";
import type { Movie } from "../types";

type Props = {
  movies: Movie[];
  onMoviePicked?: (movie: Movie) => void;
  wheelEnabled?: boolean;
  shuffleActive?: boolean;
};

const MoviePicker: React.FC<Props> = ({
  movies,
  onMoviePicked,
  wheelEnabled,
  shuffleActive,
}) => {
  const [selected, setSelected] = useState<Movie | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pickRandom = () => {
    if (movies.length === 0) return;
    const movie = movies[Math.floor(Math.random() * movies.length)];
    setSelected(movie);
    if (!wheelEnabled) setShowModal(true);
    onMoviePicked?.(movie);
  };

  const isEmpty = movies.length === 0;

  const label = wheelEnabled
    ? "Add to deck"
    : selected
    ? "Pick another"
    : "Pick a movie";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-text text-sm">No movies match your filters</p>
          <p className="text-muted text-xs">
            Try adjusting or resetting the filters above
          </p>
        </div>
      ) : (
        // Hidden while the deck's shuffle session is running
        !shuffleActive && (
          <motion.button
            onClick={pickRandom}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`
              px-12 py-4 rounded-full cursor-pointer
              text-sm font-normal uppercase tracking-wide
              transition-all duration-600
              ${wheelEnabled
                ? "bg-surface border border-border text-text hover:border-accent/50"
                : "bg-accent text-bg shadow-lg shadow-accent/25 hover:bg-accent-hover"
              }
            `}
          >
            {label}
          </motion.button>
        )
      )}

      {/* Deck mode: show added movie name as a link that opens the popup */}
      {wheelEnabled && selected && !shuffleActive && (
        <p className="text-muted text-xs -mt-2">
          Added{" "}
          <button
            onClick={() => setShowModal(true)}
            className="text-text hover:text-accent transition-colors duration-150 cursor-pointer"
          >
            {selected.title}
          </button>{" "}
          to the deck
        </p>
      )}

      {/* Modal — rendered for both normal and deck mode */}
      {showModal && selected && (
        <MovieModal movie={selected} onClose={() => setShowModal(false)} />
      )}

      {/* Last pick card — normal mode only */}
      {!wheelEnabled && (
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
      )}
    </div>
  );
};

export default MoviePicker;