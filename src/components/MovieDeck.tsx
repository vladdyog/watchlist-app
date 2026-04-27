import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MovieModal from './MovieModal'
import type { Movie } from '../types'

type Props = {
  movies: Movie[]
  onRemove: (movie: Movie) => void
  onClear: () => void
}

const CARD_WIDTH    = 120
const CARD_HEIGHT   = 180
const CARD_OFFSET   = 40
const SHUFFLE_DURATION = 3500

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

const getFanRotation = (i: number, total: number) => {
  const center = (total - 1) / 2
  return (i - center) * 2.5
}

// ── Poster card ──────────────────────────────────────────────────────────────
const PosterCard: React.FC<{
  movie:        Movie
  index:        number
  total:        number
  isHovered:    boolean
  isActive:     boolean
  isWinner:     boolean
  isShuffling:   boolean
  isFlipped:    boolean   // face-down during shuffle phase
  nudge:        number
  onHoverStart: () => void
  onHoverEnd:   () => void
  onClick:      () => void
  onRemove:     () => void
}> = ({ movie, index, total, isHovered, isActive, isWinner, isShuffling, isFlipped, nudge, onHoverStart, onHoverEnd, onClick, onRemove }) => {
  const isLifted  = isHovered || isActive || isWinner
  const showInfo  = (isHovered || isWinner) && !isShuffling

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width:   `${CARD_WIDTH}px`,
        height:  `${CARD_HEIGHT}px`,
        left:    `${index * CARD_OFFSET}px`,
        bottom:  0,
        originX: '50%',
        originY: '100%',
        zIndex:  isLifted ? 50 : index,
        perspective: '600px',
      }}
      animate={{
        x:       nudge,
        y:       isLifted ? -70 : 0,
        rotate:  isLifted ? 0 : getFanRotation(index, total),
        scale:   isLifted ? 1.08 : 1,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 32 }}
      onHoverStart={() => !isShuffling && onHoverStart()}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
    >
      {/* Card with flip */}
      <motion.div
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Front face */}
        <div
          className={`
            absolute inset-0 rounded-xl overflow-hidden border-2 transition-colors duration-200
            ${isWinner ? 'border-accent shadow-xl shadow-accent/40'
              : isActive ? 'border-accent/50'
              : isHovered ? 'border-accent'
              : 'border-border'}
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
                  e.stopPropagation()
                  onRemove()
                }}
                className="absolute top-1 right-1 z-50 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-500 transition"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
          {movie.poster
            ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-surface flex items-center justify-center text-3xl">🎬</div>
          }
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 rounded-xl flex flex-col justify-end p-2"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)' }}
              >
                <p className="text-white text-xs font-medium leading-tight line-clamp-2">{movie.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {movie.year   && <p className="text-white/60 text-xs">{movie.year}</p>}
                  {movie.rating && <p className="text-accent text-xs">★ {movie.rating.toFixed(1)}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back face (face-down) */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-border bg-surface flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl opacity-20">🎬</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
const MovieDeck: React.FC<Props> = ({ movies, onRemove, onClear }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isShuffling, setIsShuffling]     = useState(false)
  const [activeIndex, setActiveIndex]   = useState<number | null>(null)
  const [winnerTitle, setWinnerTitle]   = useState<string | null>(null)
  const [accepted, setAccepted]         = useState(false)
  const [modalMovie, setModalMovie]     = useState<Movie | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

  const animRef      = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Reset winner if it's no longer in the movie list
  useEffect(() => {
    if (winnerTitle && !movies.find(m => m.title === winnerTitle)) {
      setWinnerTitle(null)
      setActiveIndex(null)
      setAccepted(false)
      setFlippedCards(new Set())
    }
  }, [movies])

  const runSpin = (pool: Movie[]) => {
    if (pool.length < 2) return
    if (animRef.current) cancelAnimationFrame(animRef.current)

    // ── Pick winner BEFORE animation starts ──
    const picked      = Math.floor(Math.random() * pool.length)
    const fullRounds  = 5
    // totalTicks always ends exactly on picked — no skipping possible
    const totalTicks  = fullRounds * pool.length + picked

    setWinnerTitle(null)
    setAccepted(false)
    setHoveredIndex(null)
    setActiveIndex(0)

    // ── Phase 1: flip all cards face-down ──
    const allFlipped = new Set(pool.map((_, i) => i))
    setFlippedCards(allFlipped)
    setIsShuffling(true)
    startTimeRef.current = null

    // ── Phase 2: shuffle through face-down cards ──
    setTimeout(() => {
      const animate = (ts: number) => {
        if (!startTimeRef.current) startTimeRef.current = ts
        const elapsed   = ts - startTimeRef.current
        const progress  = Math.min(elapsed / SHUFFLE_DURATION, 1)
        // Continuous eased tick — Math.floor ensures we visit every card in order
        const easedTick = Math.floor(easeOut(progress) * totalTicks)
        setActiveIndex(easedTick % pool.length)

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          // ── Phase 3: flip winner face-up ──
          setActiveIndex(picked)
          setFlippedCards(prev => {
            const next = new Set(prev)
            next.delete(picked)
            return next
          })
          setWinnerTitle(pool[picked].title)
          setIsShuffling(false)
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }, 600) // wait for flip-down to complete
  }

  const handleEliminate = () => {
    if (!winner) return
    onRemove(winner)
    const remaining = movies.filter(m => m.title !== winner.title)
    setWinnerTitle(null)
    setActiveIndex(null)
    setFlippedCards(new Set())

    if (remaining.length === 1) {
      setWinnerTitle(remaining[0].title)
      setAccepted(true)
    } else if (remaining.length >= 2) {
      setTimeout(() => runSpin(remaining), 300)
    }
  }

  const winner    = movies.find(m => m.title === winnerTitle) ?? null
  const deckWidth = CARD_WIDTH + CARD_OFFSET * (movies.length - 1)

  return (
    <div className="space-y-8">

      {/* Fan deck */}
      {movies.length > 0 ? (
        <div
          className="relative mx-auto"
          style={{ width: `${deckWidth}px`, height: `${CARD_HEIGHT + 80}px` }}
        >
          {movies.map((movie, i) => (
            <PosterCard
              key={movie.title}
              movie={movie}
              index={i}
              total={movies.length}
              isHovered={hoveredIndex === i}
              isActive={activeIndex === i && isShuffling}
              isWinner={winner?.title === movie.title && !isShuffling}
              isShuffling={isShuffling}
              isFlipped={flippedCards.has(i)}
              nudge={hoveredIndex === null ? 0 : (i - hoveredIndex) * 45}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => !isShuffling && !flippedCards.has(i) && setModalMovie(movie)}
              onRemove={() => onRemove(movie)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-1">
          <p className="text-muted text-sm">No movies on the deck yet.</p>
          <p className="text-muted text-xs">Pick some movies to get started!</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={() => runSpin(movies)}
          disabled={isShuffling || movies.length < 2}
          whileHover={!isShuffling && movies.length >= 2 ? { scale: 1.04 } : {}}
          whileTap={!isShuffling && movies.length >= 2 ? { scale: 0.96 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`
            px-8 py-3 rounded-full text-sm font-medium transition-colors duration-150
            ${isShuffling || movies.length < 2
              ? 'bg-surface text-muted cursor-not-allowed border border-border'
              : 'bg-accent text-bg cursor-pointer shadow-lg shadow-accent/25'}
          `}
        >
          {isShuffling ? 'Shuffling...' : 'Shuffle'}
        </motion.button>

        {movies.length > 0 && (
          <button
            onClick={() => { onClear(); setFlippedCards(new Set()) }}
            disabled={isShuffling}
            className="px-4 py-3 rounded-full text-xs border border-border text-muted hover:border-accent/50 hover:text-text transition-all duration-150 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {movies.length === 1 && (
        <p className="text-center text-muted text-xs">Add at least one more movie to shuffle.</p>
      )}

      {/* Winner actions */}
      <AnimatePresence>
        {winner && !isShuffling && !accepted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-text text-sm">
              🎬 <span className="font-medium">{winner.title}</span>
              {winner.year ? ` (${winner.year})` : ''}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAccepted(true)}
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

      <AnimatePresence>
        {accepted && winner && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text text-sm"
          >
            🍿 Tonight you're watching: <strong>{winner.title}</strong>
          </motion.p>
        )}
      </AnimatePresence>

      {modalMovie && (
        <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />
      )}
    </div>
  )
}

export default MovieDeck