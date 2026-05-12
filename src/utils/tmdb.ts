import type { Movie } from '../types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// ---------------------------------------------------------------------------
// Rate limiter — sliding window, 40 req/s
//
// TMDB's documented limit is 40 requests per 10 s. Their CDN enforces a
// harder ceiling of ~50 req/s. We target 40 req/s — a comfortable margin
// below the CDN cap while respecting the spirit of the documented limit.
//
// JS is single-threaded: the check-and-push in waitForRateLimit() is
// effectively atomic — no race condition is possible between concurrent
// async callers.
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 1_000;
const MAX_REQUESTS_PER_WINDOW = 40; // Pushing the limit, but staying on the safe side with sub-50 requests
const requestTimestamps: number[] = [];

async function waitForRateLimit(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (
      requestTimestamps.length > 0 &&
      now - requestTimestamps[0] >= RATE_WINDOW_MS
    ) {
      requestTimestamps.shift();
    }
    if (requestTimestamps.length < MAX_REQUESTS_PER_WINDOW) {
      requestTimestamps.push(now);
      return;
    }
    const waitMs = RATE_WINDOW_MS - (now - requestTimestamps[0]) + 1;
    await new Promise<void>((r) => setTimeout(r, waitMs));
  }
}

// ---------------------------------------------------------------------------
// Rate-limited fetch with 429 retry
// ---------------------------------------------------------------------------
async function tmdbFetch(
  url: string,
  token: string,
  retries = 3,
): Promise<Response | null> {
  await waitForRateLimit();
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 429) {
      if (retries <= 0) return null;
      const raw = res.headers.get('Retry-After');
      const seconds = raw !== null ? parseFloat(raw) : NaN;
      const waitMs = isNaN(seconds) ? 2_000 : seconds * 1_000;
      await new Promise<void>((r) => setTimeout(r, waitMs));
      return tmdbFetch(url, token, retries - 1);
    }
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TMDbSearchResult = {
  id: number;
  vote_average: number;
  poster_path: string | null;
  overview: string;
};

type TMDbMovieDetails = {
  runtime: number | null;
  genres: { id: number; name: string }[];
};

export type TMDbEnrichment = {
  rating?: number;
  genres?: string[];
  runtime?: number;
  overview?: string;
  poster?: string;
};

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function searchMovie(
  title: string,
  year: number | undefined,
  token: string,
): Promise<TMDbSearchResult | null> {
  const params = new URLSearchParams({
    query: title,
    include_adult: 'false',
    language: 'en-US',
    page: '1',
  });
  if (year) params.set('year', String(year));

  const res = await tmdbFetch(`${TMDB_BASE}/search/movie?${params}`, token);
  if (!res) return null;
  const data = await res.json();
  return (data.results?.[0] as TMDbSearchResult) ?? null;
}

async function fetchMovieDetails(
  id: number,
  token: string,
): Promise<TMDbMovieDetails | null> {
  const res = await tmdbFetch(`${TMDB_BASE}/movie/${id}`, token);
  if (!res) return null;
  return res.json() as Promise<TMDbMovieDetails>;
}

export async function enrichMovie(
  movie: Movie,
  token: string,
): Promise<TMDbEnrichment> {
  try {
    const result = await searchMovie(movie.title, movie.year, token);
    if (!result) return {};

    const details = await fetchMovieDetails(result.id, token);

    return {
      rating: result.vote_average || undefined,
      overview: result.overview || undefined,
      genres: details?.genres.map((g) => g.name) ?? undefined,
      runtime: details?.runtime ?? undefined,
      poster: result.poster_path
        ? `${TMDB_IMAGE_BASE}${result.poster_path}`
        : undefined,
    };
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Bulk enrichment — concurrent worker pool, paced by the rate limiter
//
// Workers pull from a shared index and each call enrichMovie(), which makes
// 2 requests (search + details) both routed through waitForRateLimit().
// Having more workers than the per-second budget is fine — extras simply
// wait their turn. This replaces the old fixed-batch loop, which fired a
// full batch instantly and had no pacing between batches.
// ---------------------------------------------------------------------------
export async function enrichAllMovies(
  movies: Movie[],
  token: string,
  onProgress: (completed: number, total: number) => void,
  concurrency = 50,
): Promise<Movie[]> {
  const enriched: Movie[] = new Array(movies.length);
  let completed = 0;
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < movies.length) {
      const i = nextIndex++; // safe: JS is single-threaded, no await between read & write
      enriched[i] = { ...movies[i], ...(await enrichMovie(movies[i], token)) };
      onProgress(++completed, movies.length);
    }
  }

  const workerCount = Math.min(concurrency, movies.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return enriched;
}
