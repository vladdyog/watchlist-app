import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import type { Movie } from '../types';
import MovieCard from './MovieCard';
import MovieModal from './MovieModal';

type Props = {
  movies: Movie[];
  onRemove: (movie: Movie) => void;
  onClear: () => void;
  shuffleActive: boolean;
  onShuffleStart: () => void;
  onWatchThis: (movie: Movie) => void;
  onClose: () => void;
};

const CARD_WIDTH = 140;
const CARD_HEIGHT = 210;
const CARD_OFFSET = 52;
const SHUFFLE_DURATION = 3500;
const OVERLAY_SCALE = 1.75;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

const getFanRotation = (i: number, total: number) => {
  const center = (total - 1) / 2;
  return (i - center) * 3;
};

const PosterCard: React.FC<{
  movie: Movie;
  index: number;
  total: number;
  isHovered: boolean;
  isActive: boolean;
  isWinner: boolean;
  isShuffling: boolean;
  isFlipped: boolean;
  nudge: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  onRemove: () => void;
}> = ({
  movie,
  index,
  total,
  isHovered,
  isActive,
  isWinner,
  isShuffling,
  isFlipped,
  nudge,
  onHoverStart,
  onHoverEnd,
  onClick,
  onRemove,
}) => {
  const isLifted = isHovered || isActive || isWinner;

  const showInfo = (isHovered || isWinner) && !isShuffling;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        left: `${index * CARD_OFFSET}px`,
        bottom: 0,
        originX: '50%',
        originY: '100%',
        zIndex: isLifted ? 50 : index,
        perspective: '1000px',
      }}
      animate={{
        x: nudge,
        y: isLifted ? -88 : 0,
        rotate: isLifted ? 0 : getFanRotation(index, total),
        scale: isLifted ? 1.08 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 28,
      }}
      onHoverStart={() => !isShuffling && onHoverStart()}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {/* FRONT */}
        <div
          className={`
            absolute inset-0 overflow-hidden rounded-[1.6rem]
            border transition-all duration-300
            ${
              isWinner
                ? 'border-accent shadow-[0_0_40px_rgba(255,170,60,0.45)]'
                : isActive
                  ? 'border-accent/60 shadow-[0_0_24px_rgba(255,170,60,0.18)]'
                  : isHovered
                    ? 'border-white/20'
                    : 'border-white/10'
            }
          `}
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Remove button */}
          <AnimatePresence>
            {isHovered && !isShuffling && !isFlipped && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="
                  absolute right-2 top-2 z-50
                  flex h-7 w-7 items-center justify-center
                  rounded-full border border-white/10
                  bg-black/70 text-xs text-white
                  backdrop-blur-md
                  transition-all duration-200
                  hover:border-red-400/40 hover:bg-red-500
                "
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>

          {/* Poster */}
          {movie.poster ? (
            <>
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface text-5xl">
              🎬
            </div>
          )}

          {/* Info overlay */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 bottom-0 p-4"
              >
                <p className="line-clamp-2 text-sm font-semibold leading-tight text-white">
                  {movie.title}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {movie.year && (
                    <span className="text-xs text-white/60">{movie.year}</span>
                  )}

                  {movie.rating && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                      ★ {movie.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BACK */}
        <div
          className="
            absolute inset-0 flex items-center justify-center
            rounded-[1.6rem] border border-white/10
            bg-gradient-to-br from-[#181818] to-[#101010]
            shadow-2xl
          "
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-5xl opacity-15">🎬</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MovieDeck: React.FC<Props> = ({
  movies,
  onRemove,
  onClear,
  shuffleActive,
  onShuffleStart,
  onWatchThis,
  onClose,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [isShuffling, setIsShuffling] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [winnerMovie, setWinnerMovie] = useState<Movie | null>(null);

  const [watchAccepted, setWatchAccepted] = useState(false);

  const [modalMovie, setModalMovie] = useState<Movie | null>(null);

  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const animRef = useRef<number | null>(null);

  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      !watchAccepted &&
      winnerMovie &&
      !movies.find((m) => m.title === winnerMovie.title)
    ) {
      setWinnerMovie(null);
      setActiveIndex(null);
      setFlippedCards(new Set());
    }
  }, [movies, winnerMovie, watchAccepted]);

  useEffect(() => {
    if (shuffleActive) {
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [shuffleActive]);

  const prevShuffleRef = useRef(false);

  useEffect(() => {
    if (prevShuffleRef.current && !shuffleActive) {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }

      setIsShuffling(false);
      setWinnerMovie(null);
      setWatchAccepted(false);
      setActiveIndex(null);
      setFlippedCards(new Set());
    }

    prevShuffleRef.current = shuffleActive;
  }, [shuffleActive]);

  const runSpin = (pool: Movie[]) => {
    if (pool.length < 2) return;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const picked = Math.floor(Math.random() * pool.length);

    const totalTicks = 5 * pool.length + picked;

    setWinnerMovie(null);
    setWatchAccepted(false);
    setHoveredIndex(null);
    setActiveIndex(0);

    setFlippedCards(new Set(pool.map((_, i) => i)));

    setIsShuffling(true);

    startTimeRef.current = null;

    setTimeout(() => {
      const animate = (ts: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = ts;
        }

        const elapsed = ts - startTimeRef.current;

        const progress = Math.min(elapsed / SHUFFLE_DURATION, 1);

        setActiveIndex(
          Math.floor(easeOut(progress) * totalTicks) % pool.length,
        );

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setActiveIndex(picked);

          setFlippedCards((prev) => {
            const next = new Set(prev);

            next.delete(picked);

            return next;
          });

          setWinnerMovie(pool[picked]);

          setIsShuffling(false);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    }, 700);
  };

  const handleShuffle = () => {
    onShuffleStart();
    runSpin(movies);
  };

  const handleWatchThis = () => {
    if (!winnerMovie) return;

    setWatchAccepted(true);

    onWatchThis(winnerMovie);
  };

  const handleEliminate = () => {
    if (!winnerMovie) return;

    onRemove(winnerMovie);

    const remaining = movies.filter((m) => m.title !== winnerMovie.title);

    setWinnerMovie(null);

    setActiveIndex(null);

    setFlippedCards(new Set());

    if (remaining.length === 1) {
      const autoWinner = remaining[0];

      setWinnerMovie(autoWinner);

      setWatchAccepted(true);

      onWatchThis(autoWinner);
    } else if (remaining.length >= 2) {
      setTimeout(() => runSpin(remaining), 350);
    }
  };

  const cardCount = Math.max(1, movies.length);

  const deckWidth = CARD_WIDTH + CARD_OFFSET * (cardCount - 1);

  const renderFan = () =>
    movies.map((movie, i) => (
      <PosterCard
        key={movie.title}
        movie={movie}
        index={i}
        total={movies.length}
        isHovered={hoveredIndex === i}
        isActive={activeIndex === i && isShuffling}
        isWinner={winnerMovie?.title === movie.title && !isShuffling}
        isShuffling={isShuffling}
        isFlipped={flippedCards.has(i)}
        nudge={hoveredIndex === null ? 0 : (i - hoveredIndex) * 50}
        onHoverStart={() => setHoveredIndex(i)}
        onHoverEnd={() => setHoveredIndex(null)}
        onClick={() =>
          !isShuffling && !flippedCards.has(i) && setModalMovie(movie)
        }
        onRemove={() => onRemove(movie)}
      />
    ));

  return (
    <div className="space-y-10">
      {/* NORMAL DECK */}
      {!shuffleActive && (
        <>
          {movies.length > 0 ? (
            <div
              className="relative mx-auto"
              style={{
                width: `${deckWidth}px`,
                height: `${CARD_HEIGHT + 110}px`,
              }}
            >
              {renderFan()}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface/50 py-12 text-center backdrop-blur-xl shadow-card">
              <p className="text-base font-medium text-text">
                Your deck is empty
              </p>

              <p className="mt-2 text-sm text-muted">
                Add some movies to start the showdown
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={handleShuffle}
              disabled={movies.length < 2}
              whileHover={movies.length >= 2 ? { scale: 1.03 } : {}}
              whileTap={movies.length >= 2 ? { scale: 0.97 } : {}}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 22,
              }}
              className={`
                rounded-full px-8 py-3.5
                text-sm font-semibold tracking-wide
                transition-all duration-300
                ${
                  movies.length < 2
                    ? 'cursor-not-allowed border border-border bg-surface text-muted'
                    : 'bg-accent text-white shadow-glow hover:brightness-110'
                }
              `}
            >
              Shuffle Deck
            </motion.button>

            {movies.length > 0 && (
              <button
                onClick={() => {
                  onClear();
                  setFlippedCards(new Set());
                }}
                className="
                  rounded-full border border-border
                  px-5 py-3 text-xs font-medium text-muted
                  transition-all duration-200
                  hover:border-accent/40 hover:bg-white/[0.03] hover:text-text
                "
              >
                Clear Deck
              </button>
            )}
          </div>

          {movies.length === 1 && (
            <p className="text-center text-xs text-muted">
              Add at least one more movie to shuffle.
            </p>
          )}
        </>
      )}

      {/* OVERLAY */}
      <AnimatePresence>
        {shuffleActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,170,60,0.10),transparent_60%)]" />

            {/* Close */}
            <button
              onClick={onClose}
              className="
                absolute right-6 top-6 z-20
                flex h-11 w-11 items-center justify-center
                rounded-full border border-white/10
                bg-white/5 text-sm text-muted
                backdrop-blur-xl
                transition-all duration-200
                hover:border-accent/40 hover:text-white
              "
            >
              ✕
            </button>

            <AnimatePresence mode="wait">
              {watchAccepted && winnerMovie ? (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.34, 1.2, 0.64, 1],
                  }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-px w-12 bg-white/10" />

                    <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
                      Tonight You’re Watching
                    </p>

                    <div className="h-px w-12 bg-white/10" />
                  </div>

                  <div className="w-[360px] max-w-[88vw]">
                    <MovieCard movie={winnerMovie} />
                  </div>

                  <button
                    onClick={onClose}
                    className="
                      mt-8 rounded-full border border-white/10
                      bg-white/[0.03] px-8 py-3
                      text-sm font-medium text-muted
                      transition-all duration-200
                      hover:border-accent/40 hover:text-white
                    "
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="shuffle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 flex flex-col items-center gap-20"
                >
                  {/* Title */}
                  <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-accent">
                      Movie Night Shuffle
                    </p>

                    <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                      Let fate decide
                    </h2>

                    <p className="mt-3 text-sm text-muted">
                      One movie survives.
                    </p>
                  </div>

                  {/* Deck */}
                  <div
                    style={{
                      width: `${deckWidth * OVERLAY_SCALE}px`,
                      height: `${(CARD_HEIGHT + 120) * OVERLAY_SCALE}px`,
                      position: 'relative',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="relative"
                        style={{
                          width: `${deckWidth}px`,
                          height: `${CARD_HEIGHT + 120}px`,
                          transform: `scale(${OVERLAY_SCALE})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        {renderFan()}
                      </div>
                    </div>
                  </div>

                  {/* Winner actions */}
                  <div className="min-h-[90px] flex items-center justify-center">
                    <AnimatePresence>
                      {winnerMovie && !isShuffling && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          transition={{ duration: 0.22 }}
                          className="flex flex-col items-center gap-5"
                        >
                          <div className="text-center">
                            <p className="text-lg font-semibold text-white">
                              {winnerMovie.title}
                            </p>

                            {winnerMovie.year && (
                              <p className="mt-1 text-sm text-muted">
                                {winnerMovie.year}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              onClick={handleWatchThis}
                              className="
                                rounded-full bg-accent
                                px-6 py-3 text-sm font-semibold text-white
                                shadow-glow
                                transition-all duration-200
                                hover:brightness-110
                              "
                            >
                              Watch This
                            </button>

                            <button
                              onClick={handleEliminate}
                              className="
                                rounded-full border border-white/10
                                bg-white/[0.03]
                                px-6 py-3 text-sm font-medium text-muted
                                transition-all duration-200
                                hover:border-accent/40 hover:text-white
                              "
                            >
                              Eliminate & Shuffle Again
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      {modalMovie && (
        <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />
      )}
    </div>
  );
};

export default MovieDeck;
