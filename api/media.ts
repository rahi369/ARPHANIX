import type { IncomingMessage, ServerResponse } from 'node:http';
import { fetchStoredMediaAsset } from '../server/mediaStore.ts';

interface VercelReq extends IncomingMessage {
  query?: { id?: string | string[] };
}

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
  send: (body: Buffer | string) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawUrl = req.url || '';
  let idParam = Array.isArray(req.query?.id) ? req.query?.id[0] : req.query?.id;
  if (!idParam && rawUrl.includes('?')) {
    const search = new URLSearchParams(rawUrl.split('?')[1]);
    idParam = search.get('id') || '';
  }

  const result = await fetchStoredMediaAsset(idParam || '');
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = 200;
  res.end(result.buffer);
}
