import type { IncomingMessage, ServerResponse } from 'node:http';
import { invalidateAiSnapshotCache } from '../../server/gemini.ts';
import { verifyAdminFirebaseToken } from '../../server/cloudinaryRelay.ts';

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default async function handler(req: IncomingMessage, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authCheck = await verifyAdminFirebaseToken(req.headers.authorization);
  if (!authCheck.ok) {
    res.status(authCheck.status).json({ error: authCheck.error });
    return;
  }

  invalidateAiSnapshotCache();
  res.status(200).json({ ok: true });
}
