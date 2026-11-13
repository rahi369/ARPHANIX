import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  relayUploadToCloudinary,
  verifyAdminFirebaseToken,
  type RelayUploadInput,
} from '../server/cloudinaryRelay.ts';

interface VercelReq extends IncomingMessage {
  body?: RelayUploadInput;
}

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authCheck = await verifyAdminFirebaseToken(req.headers.authorization);
  if (!authCheck.ok) {
    res.status(authCheck.status).json({ error: authCheck.error });
    return;
  }

  const result = await relayUploadToCloudinary(req.body || ({} as RelayUploadInput));
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(200).json({ secureUrl: result.secureUrl, publicId: result.publicId });
}
