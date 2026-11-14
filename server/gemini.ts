import { GoogleGenAI, ThinkingLevel, type GenerateContentResponse } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import { CLIENT_KNOWLEDGE_BASE } from './clientKnowledgeBase.ts';

export type ChatPersona = 'concierge' | 'advisor' | 'strategist';
export type ChatMode = 'fast' | 'balanced' | 'deep';

export interface ChatTurnInput {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestPayload {
  message: string;
  history?: ChatTurnInput[];
  persona?: ChatPersona;
  mode?: ChatMode;
  useSearchGrounding?: boolean;
  sessionKey?: string;
  bypassCache?: boolean;
}

interface FirestoreRestValue {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  arrayValue?: { values?: FirestoreRestValue[] };
  mapValue?: { fields?: Record<string, FirestoreRestValue> };
}

function decodeFirestoreValue(val?: FirestoreRestValue): unknown {
  if (!val) return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if (val.arrayValue) {
    return (val.arrayValue.values || []).map((v) => decodeFirestoreValue(v));
  }
  if (val.mapValue) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

function decodeFirestoreDoc(fields?: Record<string, FirestoreRestValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!fields) return out;
  for (const [k, v] of Object.entries(fields)) {
    out[k] = decodeFirestoreValue(v);
  }
  return out;
}

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
    // ignore missing config
  }
  return {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    databaseId: process.env.VITE_FIREBASE_DATABASE_ID || '(default)',
  };
}

let cachedSnapshot: { snapshotText: string; customKb: Record<string, unknown> | null; fetchedAt: number } | null = null;
const SNAPSHOT_TTL_MS = 4_000;

export function invalidateAiSnapshotCache() {
  cachedSnapshot = null;
}

async function fetchCollectionRest(
  baseUrl: string,
  collectionName: string,
  limit = 15
): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${baseUrl}/${collectionName}?pageSize=${limit}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      documents?: Array<{ fields?: Record<string, FirestoreRestValue> }>;
    };
    return (data.documents || []).map((d) => decodeFirestoreDoc(d.fields));
  } catch {
    return [];
  }
}

async function fetchDocumentRest(baseUrl: string, docPath: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${baseUrl}/${docPath}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { fields?: Record<string, FirestoreRestValue> };
    return decodeFirestoreDoc(data.fields);
  } catch {
    return null;
  }
}

async function getCompactLiveFirestoreSnapshot(bypassCache = false): Promise<{
  snapshotText: string;
  customKb: Record<string, unknown> | null;
}> {
  if (!bypassCache && cachedSnapshot && Date.now() - cachedSnapshot.fetchedAt < SNAPSHOT_TTL_MS) {
    return { snapshotText: cachedSnapshot.snapshotText, customKb: cachedSnapshot.customKb };
  }

  const { projectId, databaseId } = readProvisionedFirebaseConfig();
  if (!projectId) {
    return {
      snapshotText: 'Live Firestore snapshot unavailable (using baseline knowledge base).',
      customKb: null,
    };
  }

  const dbSegment = databaseId || '(default)';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(dbSegment)}/documents`;

  const [profile, about, settings, customKb, projects, services, skills, experience, achievements, faqs] =
    await Promise.all([
      fetchDocumentRest(baseUrl, 'site_profile/main'),
      fetchDocumentRest(baseUrl, 'site_about/main'),
      fetchDocumentRest(baseUrl, 'site_settings/main'),
      fetchDocumentRest(baseUrl, 'ai_knowledge_base/main'),
      fetchCollectionRest(baseUrl, 'projects', 10),
      fetchCollectionRest(baseUrl, 'services', 10),
      fetchCollectionRest(baseUrl, 'skills', 24),
      fetchCollectionRest(baseUrl, 'experience', 10),
      fetchCollectionRest(baseUrl, 'achievements', 10),
      fetchCollectionRest(baseUrl, 'faqs', 30),
    ]);

  const snapshotObj = {
    profile: profile || undefined,
    aboutSummary: about
      ? {
          personalIntroduction: about.personalIntroduction,
          myJourney: about.myJourney,
          businessOrTechBackground: about.businessOrTechBackground,
          entrepreneurship: about.entrepreneurship,
          education: about.education,
          professionalGoals: about.professionalGoals,
          businessInformation: about.businessInformation,
          customInstructions: about.customInstructions,
          additionalInformation: about.additionalInformation,
        }
      : undefined,
    settings: settings
      ? {
          brandName: settings.brandName,
          contactEmail: settings.contactEmail,
          whatsappNumber: settings.whatsappNumber,
          hasCvDownload: Boolean(settings.cvUrl),
          socialLinks: settings.socialLinks,
        }
      : undefined,
    projects: projects.map((p) => ({
      title: p.title,
      client: p.client,
      status: p.status,
      problem: p.problem,
      solution: p.solution,
      techStack: p.techStack,
    })),
    services: services.map((s) => ({
      title: s.title,
      category: s.category,
      summary: s.summary,
      startingPrice: s.startingPrice,
      features: s.features,
    })),
    skills: skills.map((sk) => `${sk.name} (${sk.category}${sk.proficiency ? `, ${sk.proficiency}` : ''})`),
    experience: experience.map((ex) => ({
      type: ex.type,
      role: ex.role,
      organization: ex.organization,
      period: ex.period,
      location: ex.location,
    })),
    achievements: achievements.map((a) => ({
      title: a.title,
      issuer: a.issuer,
      year: a.year,
    })),
    faqs: faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
      category: f.category,
    })),
  };

  const snapshotText = JSON.stringify(snapshotObj);
  cachedSnapshot = { snapshotText, customKb, fetchedAt: Date.now() };
  return { snapshotText, customKb };
}

function buildSystemInstruction(
  persona: ChatPersona,
  snapshotText: string,
  customKb: Record<string, unknown> | null
): string {
  const personaDirectives: Record<ChatPersona, string> = {
    concierge:
      'Persona: ARPHANIX Client Guide. Be warm, professional, clear, concise, and helpful for visitors exploring Samia Sultana Bushra’s services, skills, background, and contact options.',
    advisor:
      'Persona: Project Inquiry Advisor. Help prospective clients clarify which of ARPHANIX’s 5 core services fit their goals and invite them to contact Samia directly for a custom quote without inventing prices or timelines.',
    strategist:
      'Persona: Marketing & Design Strategist. Explain how ARPHANIX combines marketing strategy with creative visual & UI/UX design using only verified capabilities.',
  };

  const kbName = String(customKb?.assistantName || `${CLIENT_KNOWLEDGE_BASE.brandName} Assistant`);
  const kbRole = String(customKb?.assistantRole || `AI Assistant representing ${CLIENT_KNOWLEDGE_BASE.ownerName} & ${CLIENT_KNOWLEDGE_BASE.brandName}`);
  const kbLang = String(customKb?.responseLanguage || 'Auto-detect (Bangla when user writes in Bangla, English when user writes in English)');
  const kbTone = String(customKb?.responseTone || 'Warm, professional, clear, concise, and helpful');
  const devContact = String(customKb?.developerContactDetails || '').trim();

  // Strip internal versioning fields from the prompt payload
  const sanitizedKb = customKb
    ? Object.fromEntries(
        Object.entries(customKb).filter(
          ([k, v]) =>
            k !== 'previousSnapshotJson' &&
            k !== 'versionNumber' &&
            k !== 'updatedAt' &&
            v !== '' &&
            v !== undefined &&
            v !== null
        )
      )
    : null;

  const devFullName = CLIENT_KNOWLEDGE_BASE.developerFullName;
  const devBrand = CLIENT_KNOWLEDGE_BASE.developerBrand;
  const devWebsite = CLIENT_KNOWLEDGE_BASE.developerWebsiteUrl;
  const attributionRule = devContact
    ? `Only if the user specifically asks who created, designed, or developed this website, answer truthfully that it was designed and developed by ${devFullName} (${devBrand}), include his website link ${devWebsite}, and include any additional configured developer details (${devContact}). Never promote ${devFullName} or ${devBrand} unprompted.`
    : `Only if the user specifically asks who created, designed, or developed this website, answer truthfully: "This website was designed and developed by ${devFullName} (${devBrand}). Website: ${devWebsite}" (or the natural Bangla equivalent if asked in Bangla). Never promote ${devFullName} or ${devBrand} unprompted.`;

  return [
    `You are ${kbName}, acting as ${kbRole}.`,
    `Preferred Response Language: ${kbLang}`,
    `Response Tone & Personality: ${kbTone}`,
    personaDirectives[persona],
    '',
    'CORE VERIFIED CLIENT KNOWLEDGE BASE:',
    JSON.stringify(CLIENT_KNOWLEDGE_BASE),
    '',
    sanitizedKb
      ? 'ADMIN-MANAGED CLIENT AI KNOWLEDGE BASE (LIVE CMS OVERRIDES):'
      : 'NO CUSTOM FIRESTORE KNOWLEDGE OVERRIDE YET (USE CORE VERIFIED KNOWLEDGE BASE ABOVE).',
    ...(sanitizedKb ? [JSON.stringify(sanitizedKb)] : []),
    '',
    'LIVE FIRESTORE PORTFOLIO SNAPSHOT:',
    snapshotText,
    '',
    'STRICT BEHAVIORAL RULES:',
    ...CLIENT_KNOWLEDGE_BASE.strictGuardrails.map((rule, i) => `${i + 1}. ${rule}`),
    `${CLIENT_KNOWLEDGE_BASE.strictGuardrails.length + 1}. ${attributionRule}`,
  ].join('\n');
}

const activeSessionLocks = new Map<string, number>();

export function acquireRequestLock(sessionKey: string): boolean {
  const now = Date.now();
  const existing = activeSessionLocks.get(sessionKey);
  if (existing && now - existing < 45_000) {
    return false;
  }
  activeSessionLocks.set(sessionKey, now);
  return true;
}

export function releaseRequestLock(sessionKey: string): void {
  activeSessionLocks.delete(sessionKey);
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onSources: (sources: Array<{ title: string; uri: string }>) => void;
  onDone: () => void;
  onError: (statusCode: number, message: string) => void;
}

export async function streamGeminiChat(
  payload: ChatRequestPayload,
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    callbacks.onError(
      503,
      'Gemini API key is not configured on the server yet. Please add GEMINI_API_KEY in Settings > Secrets.'
    );
    return;
  }

  const message = (payload.message || '').trim();
  if (!message) {
    callbacks.onError(400, 'Please enter a message before sending.');
    return;
  }

  const persona: ChatPersona = payload.persona || 'concierge';
  const mode: ChatMode = payload.mode || 'fast';
  const useSearch = Boolean(payload.useSearchGrounding);

  const recentHistory = (payload.history || [])
    .slice(-8)
    .filter((t) => t && typeof t.content === 'string' && t.content.trim().length > 0);

  const { snapshotText, customKb } = await getCompactLiveFirestoreSnapshot(Boolean(payload.bypassCache));
  const systemInstruction = buildSystemInstruction(persona, snapshotText, customKb);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const useProHydrogen = useSearch || mode === 'deep' || mode === 'balanced';
  const model = useProHydrogen ? 'gemini-4-hydrogen' : 'gemini-3.1-flash-lite';

  const thinkingLevel = useProHydrogen
    ? mode === 'deep'
      ? ThinkingLevel.HIGH
      : ThinkingLevel.LOW
    : ThinkingLevel.MINIMAL;

  const contents = [
    ...recentHistory.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const config: Record<string, unknown> = {
    systemInstruction,
    thinkingConfig: { thinkingLevel },
    abortSignal,
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const stream = await ai.models.generateContentStream({
      model,
      contents,
      config,
    });

    const collectedSources = new Map<string, { title: string; uri: string }>();

    for await (const chunk of stream) {
      if (abortSignal?.aborted) {
        break;
      }
      const responseChunk = chunk as GenerateContentResponse;
      if (responseChunk.text) {
        callbacks.onChunk(responseChunk.text);
      }

      const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(groundingChunks)) {
        for (const gc of groundingChunks) {
          const web = (gc as { web?: { uri?: string; title?: string } }).web;
          if (web?.uri) {
            collectedSources.set(web.uri, {
              uri: web.uri,
              title: web.title || web.uri,
            });
          }
        }
      }
    }

    if (collectedSources.size > 0) {
      callbacks.onSources(Array.from(collectedSources.values()));
    }
    callbacks.onDone();
  } catch (err: unknown) {
    if (abortSignal?.aborted) {
      callbacks.onDone();
      return;
    }
    const rawMsg = err instanceof Error ? err.message : String(err);
    const lower = rawMsg.toLowerCase();

    if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
      callbacks.onError(
        429,
        'AI assistant quota is temporarily busy. Please wait a moment and try again, or switch to Fast mode.'
      );
      return;
    }
    if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
      callbacks.onError(403, 'Gemini API key was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.');
      return;
    }
    callbacks.onError(500, 'Unable to complete AI response right now. Please try again.');
  }
}
