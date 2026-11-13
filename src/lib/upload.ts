import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';

export interface UploadOptions {
  file: File;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  folder?: string;
  onProgress?: (percent: number, stage: string) => void;
  signal?: AbortSignal;
}

export interface UploadResult {
  url: string;
  provider: 'cloudinary-direct' | 'cloudinary-relay' | 'firebase-storage';
  bytes: number;
  mimeType: string;
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);
const ALLOWED_DOC_TYPES = new Set(['application/pdf']);
const MAX_INPUT_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB pre-compression limit
const RELAY_MAX_BYTES = 3.2 * 1024 * 1024; // 3.2 MB Vercel serverless relay body cap
const FIRST_PASS_MAX_DIM = 1600;
const SECOND_PASS_THRESHOLD = 480 * 1024; // 480 KB adaptive second pass

const activeUploadKeys = new Set<string>();

export function validateUploadFile(file: File): { ok: true; isImage: boolean; isPdf: boolean } | { ok: false; error: string } {
  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isPdf = ALLOWED_DOC_TYPES.has(file.type);
  if (!isImage && !isPdf) {
    return { ok: false, error: 'Unsupported file type. Allowed formats: PNG, JPG, WEBP, GIF, PDF.' };
  }
  if (file.size <= 0) {
    return { ok: false, error: 'Selected file is empty.' };
  }
  if (file.size > MAX_INPUT_SIZE_BYTES) {
    return { ok: false, error: 'File exceeds 12 MB maximum upload limit.' };
  }
  return { ok: true, isImage, isPdf };
}

async function renderCanvasWebp(img: HTMLImageElement, maxDim: number, quality: number): Promise<Blob> {
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode WebP image.'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality
    );
  });
}

async function compressImageIfNeeded(file: File): Promise<{ blob: Blob; fileName: string; mimeType: string }> {
  // Keep animated GIFs intact
  if (file.type === 'image/gif') {
    return { blob: file, fileName: file.name, mimeType: file.type };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Unable to decode image for compression.'));
      el.src = objectUrl;
    });

    // Pass 1: Resize to max 1600px @ 0.84 quality
    let blob = await renderCanvasWebp(img, FIRST_PASS_MAX_DIM, 0.84);

    // Adaptive Pass 2: If still > 480 KB, compress down further for mobile speed
    if (blob.size > SECOND_PASS_THRESHOLD) {
      const secondPass = await renderCanvasWebp(img, 1280, 0.72);
      if (secondPass.size < blob.size) {
        blob = secondPass;
      }
    }

    // Only keep compressed output if it is smaller or originally non-webp
    if (blob.size >= file.size && file.type === 'image/webp') {
      return { blob: file, fileName: file.name, mimeType: file.type };
    }

    const baseName = file.name.replace(/\.[^.]+$/, '');
    return { blob, fileName: `${baseName}.webp`, mimeType: 'image/webp' };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function uploadDirectCloudinaryXhr(
  blob: Blob,
  fileName: string,
  cloudName: string,
  uploadPreset: string,
  folder: string,
  isPdf: boolean,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    const resourceType = isPdf ? 'raw' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    let settled = false;
    let lastActivityAt = Date.now();

    const finishError = (msg: string) => {
      if (settled) return;
      settled = true;
      clearInterval(stallTimer);
      clearTimeout(hardCapTimer);
      reject(new Error(msg));
    };

    const stallTimer = window.setInterval(() => {
      if (Date.now() - lastActivityAt > 25000) {
        xhr.abort();
        finishError('Direct Cloudinary upload stalled.');
      }
    }, 3000);

    const hardCapTimer = window.setTimeout(() => {
      xhr.abort();
      finishError('Direct Cloudinary upload exceeded 90s timeout.');
    }, 90000);

    const onAbort = () => {
      xhr.abort();
      finishError('Upload cancelled by user.');
    };

    if (signal) {
      if (signal.aborted) {
        finishError('Upload cancelled by user.');
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      lastActivityAt = Date.now();
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      clearInterval(stallTimer);
      clearTimeout(hardCapTimer);
      if (signal) signal.removeEventListener('abort', onAbort);
      if (settled) return;
      settled = true;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            onProgress?.(100);
            resolve(data.secure_url as string);
            return;
          }
        } catch {
          // fall through
        }
      }
      reject(new Error(`Cloudinary rejected upload (${xhr.status}).`));
    };

    xhr.onerror = () => finishError('Network error during direct Cloudinary upload.');
    xhr.onabort = () => finishError('Upload aborted.');

    xhr.open('POST', url, true);
    xhr.send(formData);
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file for server relay.'));
    reader.readAsDataURL(blob);
  });
}

async function uploadViaServerRelay(
  blob: Blob,
  fileName: string,
  mimeType: string,
  cloudName: string,
  uploadPreset: string,
  folder: string,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required for server relay upload.');
  }
  const idToken = await user.getIdToken();
  const base64Data = await blobToBase64(blob);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const onAbort = () => {
      xhr.abort();
      reject(new Error('Upload cancelled by user.'));
    };
    if (signal) {
      if (signal.aborted) {
        reject(new Error('Upload cancelled by user.'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(95, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (signal) signal.removeEventListener('abort', onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.secureUrl) {
            onProgress?.(100);
            resolve(json.secureUrl as string);
            return;
          }
        } catch {
          // fall through
        }
      }
      let message = `Relay failed (${xhr.status})`;
      try {
        const errJson = JSON.parse(xhr.responseText);
        if (errJson.error) message = errJson.error;
      } catch {}
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error('Network error reaching upload relay.'));
    xhr.open('POST', '/api/cloudinary-relay', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.send(
      JSON.stringify({
        fileName,
        mimeType,
        base64Data,
        cloudName,
        uploadPreset,
        folder,
      })
    );
  });
}

async function uploadViaFirebaseStorage(
  blob: Blob,
  fileName: string,
  mimeType: string,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal
): Promise<string> {
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `studio-media/${safeName}`);
  const task = uploadBytesResumable(storageRef, blob, { contentType: mimeType });

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      task.cancel();
      reject(new Error('Upload cancelled by user.'));
    };
    if (signal) {
      if (signal.aborted) {
        task.cancel();
        reject(new Error('Upload cancelled by user.'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0 && onProgress) {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        }
      },
      (error) => {
        if (signal) signal.removeEventListener('abort', onAbort);
        reject(error);
      },
      async () => {
        if (signal) signal.removeEventListener('abort', onAbort);
        const url = await getDownloadURL(task.snapshot.ref);
        onProgress?.(100);
        resolve(url);
      }
    );
  });
}

export async function uploadResilientMedia(options: UploadOptions): Promise<UploadResult> {
  const { file, cloudinaryCloudName, cloudinaryUploadPreset, folder = 'client-studio', onProgress, signal } = options;

  const dedupeKey = `${file.name}:${file.size}:${file.lastModified}`;
  if (activeUploadKeys.has(dedupeKey)) {
    throw new Error('This file is already uploading.');
  }

  const validation = validateUploadFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  activeUploadKeys.add(dedupeKey);

  try {
    onProgress?.(5, validation.isImage ? 'Optimizing image...' : 'Preparing document...');

    let payloadBlob: Blob = file;
    let payloadName = file.name;
    let payloadMime = file.type;

    if (validation.isImage) {
      const optimized = await compressImageIfNeeded(file);
      payloadBlob = optimized.blob;
      payloadName = optimized.fileName;
      payloadMime = optimized.mimeType;
    }

    if (signal?.aborted) {
      throw new Error('Upload cancelled by user.');
    }

    const cloudName = cloudinaryCloudName?.trim() || '';
    const uploadPreset = cloudinaryUploadPreset?.trim() || '';

    // Tier 1: Direct Cloudinary Unsigned Upload
    if (cloudName && uploadPreset) {
      try {
        onProgress?.(12, 'Uploading to Cloudinary CDN...');
        const url = await uploadDirectCloudinaryXhr(
          payloadBlob,
          payloadName,
          cloudName,
          uploadPreset,
          folder,
          validation.isPdf,
          (pct) => onProgress?.(Math.max(12, pct), 'Uploading to Cloudinary CDN...'),
          signal
        );
        return { url, provider: 'cloudinary-direct', bytes: payloadBlob.size, mimeType: payloadMime };
      } catch (err) {
        if (signal?.aborted) throw err;
        // Tier 2: In-Memory Authenticated Server Relay (if <= 3.2 MB)
        if (payloadBlob.size <= RELAY_MAX_BYTES) {
          try {
            onProgress?.(20, 'Retrying via secure server relay...');
            const url = await uploadViaServerRelay(
              payloadBlob,
              payloadName,
              payloadMime,
              cloudName,
              uploadPreset,
              folder,
              (pct) => onProgress?.(Math.max(20, pct), 'Uploading via server relay...'),
              signal
            );
            return { url, provider: 'cloudinary-relay', bytes: payloadBlob.size, mimeType: payloadMime };
          } catch (relayErr) {
            if (signal?.aborted) throw relayErr;
          }
        }
      }
    }

    // Tier 3: Firebase Storage Resumable Fallback
    onProgress?.(25, 'Uploading via Firebase Storage...');
    const url = await uploadViaFirebaseStorage(
      payloadBlob,
      payloadName,
      payloadMime,
      (pct) => onProgress?.(Math.max(25, pct), 'Uploading via Firebase Storage...'),
      signal
    );
    return { url, provider: 'firebase-storage', bytes: payloadBlob.size, mimeType: payloadMime };
  } finally {
    activeUploadKeys.delete(dedupeKey);
  }
}

export async function testCloudinaryConnection(cloudName: string, uploadPreset: string): Promise<{ ok: boolean; message: string }> {
  const cn = cloudName.trim();
  const up = uploadPreset.trim();
  if (!cn || !up) {
    return { ok: false, message: 'Enter both Cloud Name and Unsigned Upload Preset first.' };
  }
  try {
    // 1x1 transparent PNG tiny probe
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const bytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'connection-probe.png');
    formData.append('upload_preset', up);
    formData.append('folder', 'connection-probes');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cn)}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data?.error?.message || `Cloudinary returned HTTP ${res.status}` };
    }
    return { ok: true, message: `Connected successfully (${data.public_id || 'verified'}).` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Network error testing Cloudinary.' };
  }
}
