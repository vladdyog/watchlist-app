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
  /** Called with the confirmed winner. Does NOT close the overlay — onClose does. */
  onWatchThis: (movie: Movie) => void;
  onClose: () => void;
};

const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const CARD_OFFSET = 40;
const SHUFFLE_DURATION = 3500;
const OVERLAY_SCALE = 1.65;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

const getFanRotation = (i: number, total: number) => {
  const center = (total - 1) / 2;
  return (i - center) * 2.5;
};

// ── Poster card ───────────────────────────────────────────────────────────────
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
        perspective: '600px',
      }}
      animate={{
        x: nudge,
        y: isLifted ? -70 : 0,
        rotate: isLifted ? 0 : getFanRotation(index, total),
        scale: isLifted ? 1.08 : 1,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 32 }}
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
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className={`
            absolute inset-0 rounded-xl overflow-hidden border-2 transition-colors duration-200
            ${
              isWinner
                ? 'border-accent shadow-xl shadow-accent/40'
                : isActive
                  ? 'border-accent/50'
                  : isHovered
                    ? 'border-accent'
                    : 'border-border'
            }
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <AnimatePresence>
            {isHovered && !isShuffling && !isFlipped && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-1 right-1 z-50 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-500 transition"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>

          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center text-3xl">
              🎬
            </div>
          )}

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 rounded-xl flex flex-col justify-end p-2"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)',
                }}
              >
                <p className="text-white text-xs font-medium leading-tight line-clamp-2">
                  {movie.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {movie.year && (
                    <p className="text-white/60 text-xs">{movie.year}</p>
                  )}
                  {movie.rating && (
                    <p className="text-accent text-xs">
                      ★ {movie.rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-border bg-surface flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl opacity-20">🎬</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
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
  // Single source of truth: the actual winner object — no title-based lookup.
  const [winnerMovie, setWinnerMovie] = useState<Movie | null>(null);
  // True once the user (or auto-win) confirms the pick; overlay transforms to reveal screen.
  const [watchAccepted, setWatchAccepted] = useState(false);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // If the current winner card is removed before it's been accepted, reset.
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

  // Scroll-lock while overlay is open.
  useEffect(() => {
    if (shuffleActive) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [shuffleActive]);

  // Full reset when overlay is dismissed (X button or App-level close).
  const prevShuffleRef = useRef(false);
  useEffect(() => {
    if (prevShuffleRef.current && !shuffleActive) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsShuffling(false);
      setWinnerMovie(null);
      setWatchAccepted(false);
      setActiveIndex(null);
      setFlippedCards(new Set());
    }
    prevShuffleRef.current = shuffleActive;
  }, [shuffleActive]);

  // ── Animation ──────────────────────────────────────────────────────────────
  const runSpin = (pool: Movie[]) => {
    if (pool.length < 2) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);

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
        if (!startTimeRef.current) startTimeRef.current = ts;
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
            const n = new Set(prev);
            n.delete(picked);
            return n;
          });
          setWinnerMovie(pool[picked]); // store the full object — no title lookup needed
          setIsShuffling(false);
        }
      };
      animRef.current = requestAnimationFrame(animate);
    }, 600);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleShuffle = () => {
    onShuffleStart();
    runSpin(movies);
  };

  const handleWatchThis = () => {
    if (!winnerMovie) return;
    setWatchAccepted(true);
    onWatchThis(winnerMovie); // App stores deckWinner + clears deck; overlay stays open
  };

  const handleEliminate = () => {
    if (!winnerMovie) return;
    onRemove(winnerMovie);
    const remaining = movies.filter((m) => m.title !== winnerMovie.title);
    setWinnerMovie(null);
    setActiveIndex(null);
    setFlippedCards(new Set());

    if (remaining.length === 1) {
      // Auto-win: immediately confirm the last card as winner.
      const autoWinner = remaining[0];
      setWinnerMovie(autoWinner);
      setWatchAccepted(true);
      onWatchThis(autoWinner);
    } else if (remaining.length >= 2) {
      setTimeout(() => runSpin(remaining), 300);
    }
  };

  // ── Derived layout ─────────────────────────────────────────────────────────
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
        nudge={hoveredIndex === null ? 0 : (i - hoveredIndex) * 45}
        onHoverStart={() => setHoveredIndex(i)}
        onHoverEnd={() => setHoveredIndex(null)}
        onClick={() =>
          !isShuffling && !flippedCards.has(i) && setModalMovie(movie)
        }
        onRemove={() => onRemove(movie)}
      />
    ));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* In-page view — hidden while overlay is open */}
      {!shuffleActive && (
        <>
          {movies.length > 0 ? (
            <div
              className="relative mx-auto"
              style={{
                width: `${deckWidth}px`,
                height: `${CARD_HEIGHT + 80}px`,
              }}
            >
              {renderFan()}
            </div>
          ) : (
            <div className="text-center py-8 space-y-1">
              <p className="text-muted text-sm">No movies on the deck yet.</p>
              <p className="text-muted text-xs">
                Pick some movies to get started!
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <motion.button
              onClick={handleShuffle}
              disabled={movies.length < 2}
              whileHover={movies.length >= 2 ? { scale: 1.04 } : {}}
              whileTap={movies.length >= 2 ? { scale: 0.96 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`
                px-8 py-3 rounded-full text-sm font-medium transition-colors duration-150
                ${
                  movies.length < 2
                    ? 'bg-surface text-muted cursor-not-allowed border border-border'
                    : 'bg-accent text-bg cursor-pointer shadow-lg shadow-accent/25'
                }
              `}
            >
              Shuffle
            </motion.button>

            {movies.length > 0 && (
              <button
                onClick={() => {
                  onClear();
                  setFlippedCards(new Set());
                }}
                className="px-4 py-3 rounded-full text-xs border border-border text-muted hover:border-accent/50 hover:text-text transition-all duration-150 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {movies.length === 1 && (
            <p className="text-center text-muted text-xs">
              Add at least one more movie to shuffle.
            </p>
          )}
        </>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {shuffleActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-surface border border-border text-muted hover:text-text hover:border-accent transition-all duration-150 flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>

            {/* ── Accepted / winner-reveal state ── */}
            <AnimatePresence mode="wait">
              {watchAccepted && winnerMovie ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.2, 0.64, 1] }}
                  className="relative z-10 flex flex-col items-center gap-6"
                >
                  <p className="text-accent text-xs uppercase tracking-widest">
                    Tonight you're watching
                  </p>
                  <div className="w-[320px] max-w-[85vw]">
                    <MovieCard movie={winnerMovie} />
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-8 py-2.5 rounded-full text-sm border border-border text-muted hover:border-accent/50 hover:text-text transition-all duration-150 cursor-pointer"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                /* ── Shuffle / selection state ── */
                <motion.div
                  key="shuffle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 flex flex-col items-center gap-16"
                >
                  {/* Scaled deck fan */}
                  <div
                    style={{
                      width: `${deckWidth * OVERLAY_SCALE}px`,
                      height: `${(CARD_HEIGHT + 80) * OVERLAY_SCALE}px`,
                      position: 'relative',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="relative"
                        style={{
                          width: `${deckWidth}px`,
                          height: `${CARD_HEIGHT + 80}px`,
                          transform: `scale(${OVERLAY_SCALE})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        {renderFan()}
                      </div>
                    </div>
                  </div>

                  {/* Winner action buttons */}
                  <div className="min-h-[72px] flex items-center justify-center">
                    <AnimatePresence>
                      {winnerMovie && !isShuffling && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center gap-3"
                        >
                          <p className="text-text text-sm">
                            🎬{' '}
                            <span className="font-medium">
                              {winnerMovie.title}
                            </span>
                            {winnerMovie.year ? ` (${winnerMovie.year})` : ''}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={handleWatchThis}
                              className="px-5 py-2 rounded-full text-sm bg-accent text-bg font-medium cursor-pointer hover:bg-accent-hover transition-colors duration-150"
                            >
                              Watch this!
                            </button>
                            <button
                              onClick={handleEliminate}
                              className="px-5 py-2 rounded-full text-sm border border-border text-muted hover:border-accent/50 hover:text-text transition-all duration-150 cursor-pointer"
                            >
                              Eliminate & Shuffle again
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

      {/* Card detail modal */}
      {modalMovie && (
        <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />
      )}
    </div>
  );
};

export default MovieDeck;
