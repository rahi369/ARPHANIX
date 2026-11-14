import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export interface RelayUploadInput {
  fileName: string;
  mimeType: string;
  base64Data: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const MAX_RELAY_BYTES = 3.2 * 1024 * 1024;

function getConfiguredProjectId(): string | undefined {
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env.VITE_FIREBASE_PROJECT_ID;
  try {
    const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      return cfg.projectId;
    }
  } catch {
    // ignore
  }
  return undefined;
}

function getAllowedAdminEmails(): Set<string> {
  const raw = [
    ...(process.env.VITE_ADMIN_EMAIL || 'rahihumaun369@gmail.com').split(','),
    ...(process.env.VITE_CLIENT_ADMIN_EMAIL || 'seo.expert.samiaa@gmail.com').split(','),
    'rahihumaun369@gmail.com',
    'seo.expert.samiaa@gmail.com',
  ];
  return new Set(raw.map((e) => e.trim().toLowerCase()).filter(Boolean));
}

export async function verifyAdminFirebaseToken(authHeader?: string): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Missing Bearer authentication token.' };
  }
  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return { ok: false, status: 401, error: 'Empty authentication token.' };
  }

  const projectId = getConfiguredProjectId();
  const allowedEmails = getAllowedAdminEmails();

  // Try firebase-admin verification first when ADC/project credentials exist
  try {
    if (getApps().length === 0 && projectId) {
      initializeApp({ projectId });
    }
    const decoded = await getAuth().verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase();
    if (!decoded.email_verified || !allowedEmails.has(email)) {
      return { ok: false, status: 403, error: 'Verified admin email required.' };
    }
    return { ok: true, email };
  } catch {
    // Fallback to Google Identity Toolkit accounts:lookup using the project's public Web API key
    // when running in local/Vercel environments without GCP ADC service account keys.
    try {
      const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
      let webApiKey = process.env.VITE_FIREBASE_API_KEY || '';
      if (!webApiKey && fs.existsSync(cfgPath)) {
        const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        webApiKey = parsed.apiKey || '';
      }
      if (!webApiKey) {
        return { ok: false, status: 401, error: 'Unable to verify authentication token.' };
      }
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(webApiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          signal: AbortSignal.timeout(4000),
        }
      );
      if (!verifyRes.ok) {
        return { ok: false, status: 401, error: 'Invalid or expired Firebase ID token.' };
      }
      const data = (await verifyRes.json()) as {
        users?: Array<{ email?: string; emailVerified?: boolean }>;
      };
      const user = data.users?.[0];
      const email = (user?.email || '').toLowerCase();
      if (!user?.emailVerified || !allowedEmails.has(email)) {
        return { ok: false, status: 403, error: 'Verified admin email required.' };
      }
      return { ok: true, email };
    } catch {
      return { ok: false, status: 401, error: 'Token verification failed.' };
    }
  }
}

export async function relayUploadToCloudinary(
  input: RelayUploadInput
): Promise<{ ok: true; secureUrl: string; publicId?: string } | { ok: false; status: number; error: string }> {
  const cloudName = (input.cloudName || '').trim();
  const uploadPreset = (input.uploadPreset || '').trim();
  if (!cloudName || !uploadPreset) {
    return { ok: false, status: 400, error: 'Cloudinary Cloud Name and Upload Preset are required.' };
  }
  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
    return { ok: false, status: 400, error: 'Unsupported MIME type.' };
  }
  if (!input.base64Data || typeof input.base64Data !== 'string') {
    return { ok: false, status: 400, error: 'Missing file data.' };
  }

  const buffer = Buffer.from(input.base64Data, 'base64');
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_RELAY_BYTES) {
    return { ok: false, status: 413, error: 'Payload exceeds 3.2 MB in-memory relay limit.' };
  }

  const isPdf = input.mimeType === 'application/pdf';
  const resourceType = isPdf ? 'raw' : 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`;

  const formData = new FormData();
  const blob = new Blob([buffer], { type: input.mimeType });
  formData.append('file', blob, input.fileName || (isPdf ? 'document.pdf' : 'upload.webp'));
  formData.append('upload_preset', uploadPreset);
  if (input.folder) {
    formData.append('folder', input.folder);
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(25_000),
  });

  const json = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url) {
    return {
      ok: false,
      status: res.status >= 400 ? res.status : 502,
      error: json?.error?.message || 'Cloudinary relay upload failed.',
    };
  }

  return { ok: true, secureUrl: json.secure_url, publicId: json.public_id };
}
