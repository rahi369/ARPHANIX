import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_SERVE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

function readProvisionedFirebaseConfig(): { projectId?: string; databaseId?: string } {
  try {
    const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      return {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || parsed.projectId,
        databaseId: process.env.VITE_FIREBASE_DATABASE_ID || parsed.firestoreDatabaseId || '(default)',
      };
    }
  } catch {
    // ignore
  }
  return {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    databaseId: process.env.VITE_FIREBASE_DATABASE_ID || '(default)',
  };
}

export async function fetchStoredMediaAsset(
  assetId: string
): Promise<{ ok: true; mimeType: string; buffer: Buffer } | { ok: false; status: number; error: string }> {
  const cleanId = (assetId || '').trim();
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(cleanId)) {
    return { ok: false, status: 400, error: 'Invalid media asset ID.' };
  }

  const { projectId, databaseId } = readProvisionedFirebaseConfig();
  if (!projectId) {
    return { ok: false, status: 500, error: 'Firebase project configuration missing.' };
  }

  const dbSegment = databaseId || '(default)';
  const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(dbSegment)}/documents/media_assets/${encodeURIComponent(cleanId)}`;

  try {
    const res = await fetch(docUrl, { signal: AbortSignal.timeout(6000) });
    if (res.status === 404) {
      return { ok: false, status: 404, error: 'Media asset not found.' };
    }
    if (!res.ok) {
      return { ok: false, status: 502, error: 'Unable to load media asset.' };
    }
    const json = (await res.json()) as {
      fields?: {
        mimeType?: { stringValue?: string };
        dataBase64?: { stringValue?: string };
      };
    };
    const mimeType = (json.fields?.mimeType?.stringValue || '').toLowerCase();
    const dataBase64 = json.fields?.dataBase64?.stringValue || '';
    if (!ALLOWED_SERVE_MIME.has(mimeType) || !dataBase64) {
      return { ok: false, status: 404, error: 'Invalid or empty media payload.' };
    }

    const buffer = Buffer.from(dataBase64, 'base64');
    if (buffer.byteLength === 0) {
      return { ok: false, status: 404, error: 'Empty media payload.' };
    }

    return { ok: true, mimeType, buffer };
  } catch {
    return { ok: false, status: 504, error: 'Timed out loading media asset.' };
  }
}
