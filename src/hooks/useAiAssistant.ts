import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import type { AiMessage, AiMode, AiPersona, AiSource, AiThread } from '../types/portfolio';

const LOCAL_STORAGE_KEY = 'client_studio_ai_threads_v1';

function createThreadTitle(firstText: string): string {
  const clean = firstText.trim().replace(/\s+/g, ' ');
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean || 'New Conversation';
}

function loadLocalThreads(): AiThread[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalThreads(threads: AiThread[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(threads.slice(0, 20)));
  } catch {
    // ignore storage quota errors
  }
}

export function useAiAssistant() {
  const { isAdmin, user } = useApp();
  const [threads, setThreads] = useState<AiThread[]>(() => loadLocalThreads());
  const [activeThreadId, setActiveThreadId] = useState<string>(() => loadLocalThreads()[0]?.id || '');
  const [persona, setPersona] = useState<AiPersona>('concierge');
  const [mode, setMode] = useState<AiMode>('fast');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const sessionKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess-${Date.now()}`
  );

  // Sync admin threads from Firestore when signed in as Admin
  useEffect(() => {
    if (!isAdmin || !user?.uid) {
      const local = loadLocalThreads();
      setThreads(local);
      if (!local.some((t) => t.id === activeThreadId)) {
        setActiveThreadId(local[0]?.id || '');
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'ai_threads'), where('ownerUid', '==', user.uid))
        );
        const loaded: AiThread[] = [];
        for (const tDoc of snap.docs) {
          const data = tDoc.data() as { title?: string; persona?: AiPersona };
          const msgSnap = await getDocs(
            query(
              collection(db, 'ai_threads', tDoc.id, 'messages'),
              where('ownerUid', '==', user.uid),
              orderBy('createdAt', 'asc')
            )
          );
          const msgs: AiMessage[] = msgSnap.docs.map((m) => {
            const md = m.data() as {
              role: 'user' | 'assistant';
              content: string;
              sources?: AiSource[];
            };
            return {
              id: m.id,
              role: md.role,
              content: md.content,
              sources: md.sources,
              createdAt: Date.now(),
            };
          });
          loaded.push({
            id: tDoc.id,
            title: data.title || 'Studio Conversation',
            persona: data.persona || 'concierge',
            messages: msgs,
            updatedAt: Date.now(),
          });
        }
        if (!cancelled) {
          loaded.sort((a, b) => b.updatedAt - a.updatedAt);
          setThreads(loaded);
          if (loaded[0]) setActiveThreadId(loaded[0].id);
        }
      } catch {
        // fallback cleanly to local threads if index or network unavailable
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, user?.uid]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  const createNewThread = useCallback(
    (initialPersona?: AiPersona) => {
      const nextPersona = initialPersona || persona;
      const newThread: AiThread = {
        id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: 'New Conversation',
        persona: nextPersona,
        messages: [],
        updatedAt: Date.now(),
      };
      setThreads((prev) => {
        const next = [newThread, ...prev];
        if (!isAdmin) saveLocalThreads(next);
        return next;
      });
      setActiveThreadId(newThread.id);
      setError(null);
      return newThread;
    },
    [isAdmin, persona]
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== threadId);
        if (!isAdmin) saveLocalThreads(next);
        if (activeThreadId === threadId) {
          setActiveThreadId(next[0]?.id || '');
        }
        return next;
      });

      if (isAdmin && user?.uid) {
        try {
          await deleteDoc(doc(db, 'ai_threads', threadId));
        } catch {
          // ignore if thread wasn't persisted yet
        }
      }
    },
    [activeThreadId, isAdmin, user?.uid]
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const persistAdminTurn = useCallback(
    async (
      thread: AiThread,
      isFirstTurn: boolean,
      userMsg: AiMessage,
      assistantMsg: AiMessage
    ) => {
      if (!isAdmin || !user?.uid) return;
      try {
        const threadRef = doc(db, 'ai_threads', thread.id);
        if (isFirstTurn) {
          await setDoc(threadRef, {
            ownerUid: user.uid,
            title: thread.title,
            persona: thread.persona,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(threadRef, {
            title: thread.title,
            persona: thread.persona,
            updatedAt: serverTimestamp(),
          });
        }

        const msgsCol = collection(db, 'ai_threads', thread.id, 'messages');
        await addDoc(msgsCol, {
          ownerUid: user.uid,
          role: 'user',
          content: userMsg.content,
          createdAt: serverTimestamp(),
        });
        if (assistantMsg.content.trim()) {
          await addDoc(msgsCol, {
            ownerUid: user.uid,
            role: 'assistant',
            content: assistantMsg.content,
            ...(assistantMsg.sources?.length ? { sources: assistantMsg.sources } : {}),
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn('Admin AI thread persistence skipped:', err);
      }
    },
    [isAdmin, user?.uid]
  );

  const sendMessage = useCallback(
    async (rawText: string) => {
      const prompt = rawText.trim();
      if (!prompt || streaming) return;

      setError(null);
      let targetThread = activeThread;
      if (!targetThread) {
        targetThread = createThreadWithId(persona);
      }
      const isFirstTurn = targetThread.messages.length === 0;
      const computedTitle = isFirstTurn ? createThreadTitle(prompt) : targetThread.title;

      const userMsg: AiMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: Date.now(),
      };
      const assistantId = `a-${Date.now() + 1}`;
      const assistantMsg: AiMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        sources: [],
        createdAt: Date.now(),
      };

      const priorHistory = targetThread.messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setThreads((prev) => {
        const exists = prev.some((t) => t.id === targetThread!.id);
        const updatedThread: AiThread = {
          ...targetThread!,
          title: computedTitle,
          persona,
          messages: [...targetThread!.messages, userMsg, assistantMsg],
          updatedAt: Date.now(),
        };
        const next = exists
          ? prev.map((t) => (t.id === targetThread!.id ? updatedThread : t))
          : [updatedThread, ...prev];
        if (!isAdmin) saveLocalThreads(next);
        return next;
      });

      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      let accumulatedText = '';
      let collectedSources: AiSource[] = [];

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: prompt,
            history: priorHistory,
            persona,
            mode,
            useSearchGrounding,
            sessionKey: sessionKeyRef.current,
          }),
        });

        if (!response.ok || !response.body) {
          let errMsg = `Assistant request failed (${response.status}).`;
          try {
            const json = await response.json();
            if (json.error) errMsg = json.error;
          } catch {}
          throw new Error(errMsg);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() || '';

          for (const block of blocks) {
            const lines = block.split('\n');
            let eventName = 'message';
            let dataLine = '';
            for (const line of lines) {
              if (line.startsWith('event:')) eventName = line.slice(6).trim();
              if (line.startsWith('data:')) dataLine += line.slice(5).trim();
            }
            if (!dataLine) continue;
            try {
              const payload = JSON.parse(dataLine);
              if (eventName === 'chunk' && payload.text) {
                accumulatedText += payload.text;
                setThreads((prev) => {
                  const next = prev.map((t) =>
                    t.id === targetThread!.id
                      ? {
                          ...t,
                          messages: t.messages.map((m) =>
                            m.id === assistantId ? { ...m, content: accumulatedText } : m
                          ),
                          updatedAt: Date.now(),
                        }
                      : t
                  );
                  if (!isAdmin) saveLocalThreads(next);
                  return next;
                });
              } else if (eventName === 'sources' && Array.isArray(payload.sources)) {
                collectedSources = payload.sources;
                setThreads((prev) => {
                  const next = prev.map((t) =>
                    t.id === targetThread!.id
                      ? {
                          ...t,
                          messages: t.messages.map((m) =>
                            m.id === assistantId ? { ...m, sources: collectedSources } : m
                          ),
                        }
                      : t
                  );
                  if (!isAdmin) saveLocalThreads(next);
                  return next;
                });
              } else if (eventName === 'error' && payload.message) {
                setError(payload.message);
              }
            } catch {
              // ignore malformed SSE packet
            }
          }
        }

        const finalAssistant: AiMessage = {
          ...assistantMsg,
          content: accumulatedText || 'No response generated.',
          sources: collectedSources,
        };
        await persistAdminTurn(
          { ...targetThread, title: computedTitle, persona },
          isFirstTurn,
          userMsg,
          finalAssistant
        );
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Unable to reach AI assistant.');
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [activeThread, isAdmin, mode, persistAdminTurn, persona, streaming, useSearchGrounding]
  );

  function createThreadWithId(nextPersona: AiPersona): AiThread {
    const newThread: AiThread = {
      id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: 'New Conversation',
      persona: nextPersona,
      messages: [],
      updatedAt: Date.now(),
    };
    setActiveThreadId(newThread.id);
    return newThread;
  }

  return {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    createNewThread,
    deleteThread,
    persona,
    setPersona,
    mode,
    setMode,
    useSearchGrounding,
    setUseSearchGrounding,
    streaming,
    error,
    sendMessage,
    stopGenerating,
  };
}
