import type { Movie } from '../types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

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

  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return (data.results?.[0] as TMDbSearchResult) ?? null;
}

async function fetchMovieDetails(
  id: number,
  token: string,
): Promise<TMDbMovieDetails | null> {
  const res = await fetch(`${TMDB_BASE}/movie/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
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

// Enriches all movies in parallel batches to balance speed and rate limits
export async function enrichAllMovies(
  movies: Movie[],
  token: string,
  onProgress: (completed: number, total: number) => void,
  batchSize = 20,
): Promise<Movie[]> {
  const enriched: Movie[] = new Array(movies.length);
  let completed = 0;

  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (movie, batchIndex) => {
        const enrichment = await enrichMovie(movie, token);
        enriched[i + batchIndex] = { ...movie, ...enrichment };
        completed++;
        onProgress(completed, movies.length);
      }),
    );
  }

  return enriched;
}
