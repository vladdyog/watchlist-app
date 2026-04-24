import React, { useState, useEffect, useRef } from "react";
import type { Movie } from "../types";

type Props = {
  movies: Movie[];
  onRemove: (movie: Movie) => void;
  onClear: () => void;
};

const WHEEL_SIZE = 420;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 14;
const SPIN_DURATION = 4000;
const MIN_SPINS = 6;

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#82E0AA",
  "#F1948A",
  "#AED6F1",
  "#A9DFBF",
  "#FAD7A0",
];

/** t ∈ [0,1] → eased value */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

/** Degrees → point on circle (0° = 12 o'clock, clockwise) */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const slicePath = (startDeg: number, endDeg: number): string => {
  const s = polar(CENTER, CENTER, RADIUS, startDeg);
  const e = polar(CENTER, CENTER, RADIUS, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${CENTER},${CENTER} L${s.x},${s.y} A${RADIUS},${RADIUS} 0 ${large} 1 ${e.x},${e.y} Z`;
};

const MovieWheel: React.FC<Props> = ({ movies, onRemove, onClear }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Movie | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [rotation, setRotation] = useState(0);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rotRef = useRef(0); // always in sync with state

  useEffect(() => {
    rotRef.current = rotation;
  }, [rotation]);

  useEffect(
    () => () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    },
    [],
  );

  // ── Build slice descriptors ──────────────────────────────────────────────
  const buildSlices = (pool: Movie[]) =>
    pool.map((movie, i) => {
      const step = 360 / pool.length;
      const startDeg = i * step;
      const endDeg = startDeg + step;
      return {
        movie,
        startDeg,
        endDeg,
        midDeg: startDeg + step / 2,
        color: COLORS[i % COLORS.length],
      };
    });

  const slices = buildSlices(movies);

  // ── Spin logic ───────────────────────────────────────────────────────────
  const runSpin = (pool: Movie[]) => {
    if (pool.length < 2) return;
    setWinner(null);
    setAccepted(false);
    setIsSpinning(true);

    const pickedIdx = Math.floor(Math.random() * pool.length);
    const picked = pool[pickedIdx];
    const poolSlices = buildSlices(pool);
    const winnerMid = poolSlices[pickedIdx].midDeg;

    // We want: (winnerMid + finalRotation) % 360 === 0  (pointer at top)
    const currentMod = rotRef.current % 360;
    const targetMod = (360 - (winnerMid % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;
    delta += 360 * MIN_SPINS;

    const startRot = rotRef.current;
    startTimeRef.current = null;

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const progress = Math.min((ts - startTimeRef.current) / SPIN_DURATION, 1);
      const cur = startRot + easeOut(progress) * delta;
      setRotation(cur);
      rotRef.current = cur;

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(picked);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleSpin = () => {
    if (!isSpinning && movies.length >= 2) runSpin(movies);
  };
  const handleAccept = () => setAccepted(true);
  const handleEliminate = () => {
    if (!winner) return;
    onRemove(winner);
    const remaining = movies.filter((m) => m.title !== winner.title);
    setWinner(null);
    if (remaining.length >= 2) {
      setTimeout(() => runSpin(remaining), 400);
    } else if (remaining.length === 1) {
      setWinner(remaining[0]);
      setAccepted(true);
    }
  };

  const label = (movie: Movie) =>
    `${movie.title}${movie.year ? ` (${movie.year})` : ""}`;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <h3>
        Wheel ({movies.length} movie{movies.length !== 1 ? "s" : ""})
      </h3>

      {/* Movie list */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {movies.map((movie, i) => (
          <li
            key={movie.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: COLORS[i % COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{label(movie)}</span>
            <button
              onClick={() => onRemove(movie)}
              disabled={isSpinning}
              aria-label={`Remove ${movie.title}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {movies.length > 0 && (
        <button
          onClick={onClear}
          disabled={isSpinning}
          style={{ marginTop: 8 }}
        >
          Clear wheel
        </button>
      )}

      {/* Wheel */}
      {movies.length >= 2 && (
        <div style={{ marginTop: 20, position: "relative", width: WHEEL_SIZE }}>
          {/* Pointer arrow */}
          <div
            style={{
              position: "absolute",
              top: -2,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              zIndex: 10,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "26px solid #e63946",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))",
            }}
          />

          <svg
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            style={{ display: "block", transform: `rotate(${rotation}deg)` }}
          >
            {slices.map((s) => {
              const tp = polar(CENTER, CENTER, RADIUS * 0.62, s.midDeg);
              const fontSize =
                movies.length > 10 ? 9 : movies.length > 6 ? 11 : 13;
              const maxChars = movies.length > 8 ? 8 : 14;
              const text =
                s.movie.title.length > maxChars
                  ? s.movie.title.slice(0, maxChars - 1) + "…"
                  : s.movie.title;

              return (
                <g key={s.movie.title}>
                  <path
                    d={slicePath(s.startDeg, s.endDeg)}
                    fill={s.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    x={tp.x}
                    y={tp.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontWeight="600"
                    fill="#222"
                    transform={`rotate(${s.midDeg}, ${tp.x}, ${tp.y})`}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {text}
                  </text>
                </g>
              );
            })}
            {/* Hub */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={14}
              fill="#fff"
              stroke="#ddd"
              strokeWidth={2}
            />
          </svg>
        </div>
      )}

      {/* Spin button */}
      {!accepted && (
        <div style={{ marginTop: 14 }}>
          <button
            onClick={handleSpin}
            disabled={isSpinning || movies.length < 2}
          >
            {isSpinning ? "Spinning…" : "Spin the wheel"}
          </button>
        </div>
      )}

      {/* Winner actions */}
      {winner && !isSpinning && !accepted && (
        <div style={{ marginTop: 14 }}>
          <p>
            🎬 <strong>{label(winner)}</strong>
          </p>
          <button onClick={handleAccept}>Watch this!</button>
          <button onClick={handleEliminate} style={{ marginLeft: 8 }}>
            Eliminate &amp; spin again
          </button>
        </div>
      )}

      {/* Final pick */}
      {accepted && winner && (
        <p style={{ marginTop: 14 }}>
          🍿 Tonight you're watching: <strong>{label(winner)}</strong>
        </p>
      )}

      {movies.length === 1 && <p>Add at least one more movie to spin.</p>}
    </div>
  );
};

export default MovieWheel;
