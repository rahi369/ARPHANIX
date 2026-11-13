import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  acquireRequestLock,
  releaseRequestLock,
  streamGeminiChat,
  type ChatRequestPayload,
} from '../../server/gemini.ts';

interface VercelReq extends IncomingMessage {
  body?: ChatRequestPayload;
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

  const body = req.body || ({} as ChatRequestPayload);
  const sessionKey = String(body.sessionKey || req.headers['x-forwarded-for'] || 'default-session');

  if (!acquireRequestLock(sessionKey)) {
    res.status(429).json({ error: 'A response is already generating for this session.' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28_000);
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
}
