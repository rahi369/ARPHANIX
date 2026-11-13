import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  acquireRequestLock,
  invalidateAiSnapshotCache,
  releaseRequestLock,
  streamGeminiChat,
  type ChatRequestPayload,
} from './server/gemini.ts';
import {
  relayUploadToCloudinary,
  verifyAdminFirebaseToken,
  type RelayUploadInput,
} from './server/cloudinaryRelay.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.post('/api/ai/invalidate-cache', async (req, res) => {
    const authCheck = await verifyAdminFirebaseToken(req.headers.authorization);
    if (!authCheck.ok) {
      res.status(authCheck.status).json({ error: authCheck.error });
      return;
    }
    invalidateAiSnapshotCache();
    res.json({ ok: true });
  });

  // SSE Streaming AI Assistant Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const body = (req.body || {}) as ChatRequestPayload;
    const sessionKey = String(body.sessionKey || req.ip || 'default-session');

    if (!acquireRequestLock(sessionKey)) {
      res.status(429).json({ error: 'A response is already generating for this session.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35_000);
    res.on('close', () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    const sendEvent = (event: string, data: unknown) => {
      if (!res.writableEnded) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    };

    try {
      await streamGeminiChat(
        body,
        {
          onChunk: (text) => sendEvent('chunk', { text }),
          onSources: (sources) => sendEvent('sources', { sources }),
          onDone: () => {
            sendEvent('done', { ok: true });
            if (!res.writableEnded) res.end();
          },
          onError: (statusCode, message) => {
            sendEvent('error', { statusCode, message });
            if (!res.writableEnded) res.end();
          },
        },
        controller.signal
      );
    } finally {
      clearTimeout(timeout);
      releaseRequestLock(sessionKey);
      if (!res.writableEnded) res.end();
    }
  });

  // Authenticated In-Memory Cloudinary Relay Endpoint
  app.post('/api/cloudinary-relay', async (req, res) => {
    const authCheck = await verifyAdminFirebaseToken(req.headers.authorization);
    if (!authCheck.ok) {
      res.status(authCheck.status).json({ error: authCheck.error });
      return;
    }

    const result = await relayUploadToCloudinary((req.body || {}) as RelayUploadInput);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.status(200).json({ secureUrl: result.secureUrl, publicId: result.publicId });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use('/assets', express.static(path.join(distDir, 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(distDir, { index: false }));

    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output missing.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ARPHANIX server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
