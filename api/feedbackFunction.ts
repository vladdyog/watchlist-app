import type { IncomingMessage, ServerResponse } from 'http';

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const MAX_BODY_BYTES = 10_000; // 10 KB - plenty for a feedback message

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

  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('application/json')) {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return;
  }

  let body: string;
  try {
    body = await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => {
        data += chunk;
        if (data.length > MAX_BODY_BYTES) {
          reject(new Error('PAYLOAD_TOO_LARGE'));
        }
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE') {
      res.status(413).json({ error: 'Payload too large' });
    } else {
      res.status(500).json({ error: 'Failed to read request body' });
    }
    return;
  }

  // Validate that the body is actually parseable JSON before forwarding.
  try {
    JSON.parse(body);
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Referer: 'https://cuemovie.app',
      },
      body,
    });
    res.status(upstream.status).json(await upstream.json());
  } catch {
    res.status(502).json({ error: 'Failed to submit feedback' });
  }
}
