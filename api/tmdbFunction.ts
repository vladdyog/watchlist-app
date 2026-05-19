import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const TMDB_BASE = 'https://api.themoviedb.org/3';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'TMDB token not configured' });
    return;
  }

  const path = req.query.path;
  if (!path || typeof path !== 'string') {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  const upstream = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') upstream.set(k, Array.isArray(v) ? v[0] : v);
  }

  try {
    const tmdbRes = await fetch(
      `${TMDB_BASE}${path}${upstream.size ? `?${upstream}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    res.status(tmdbRes.status).json(await tmdbRes.json());
  } catch {
    res.status(502).json({ error: 'Upstream TMDB request failed' });
  }
}
