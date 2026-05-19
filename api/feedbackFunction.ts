import type { IncomingMessage, ServerResponse } from 'http';

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

export default async function handler(
  req: IncomingMessage,
  res: VercelResponse,
): Promise<void> {
  const endpoint = process.env.FEEDBACK_ENDPOINT;
  if (!endpoint) {
    res.status(500).json({ error: 'Feedback endpoint not configured' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://watchlist-app.vercel.app',
      },
      body,
    });
    res.status(upstream.status).json(await upstream.json());
  } catch {
    res.status(502).json({ error: 'Failed to submit feedback' });
  }
}
