import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  Maximize2,
  Plus,
  Send,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAiAssistant } from '../hooks/useAiAssistant';
import type { AiMode, AiPersona } from '../types/portfolio';

export function AiDrawer() {
  const { isAiDrawerOpen, setAiDrawerOpen, navigate, settings, aiKnowledge, theme } = useApp();
  const {
    activeThread,
    createNewThread,
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
  } = useAiAssistant();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isAiDrawerOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const msg = input;
    setInput('');
    void sendMessage(msg);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const messages = activeThread?.messages || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label={aiKnowledge.assistantName || 'AI Studio Assistant'}>
      <div
        className="w-full max-w-lg h-dvh flex flex-col border-l shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-page)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
            <div className="truncate">
              <div className="font-display text-base font-semibold truncate">
                {aiKnowledge.assistantName || `${settings.brandName} Assistant`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => createNewThread()}
              className="p-2 rounded-lg border cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--border-color)' }}
              title="New conversation"
              aria-label="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAiDrawerOpen(false);
                navigate('/assistant');
              }}
              className="p-2 rounded-lg border cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--border-color)' }}
              title="Open full workspace"
              aria-label="Open full assistant workspace"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setAiDrawerOpen(false)}
              className="p-2 rounded-lg border cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--border-color)' }}
              aria-label="Close assistant drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode & Persona Controls */}
        <div
          className="px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as AiPersona)}
              className="px-2.5 py-1.5 rounded-md border text-xs bg-transparent"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              aria-label="Assistant persona"
            >
              <option value="concierge">Concierge</option>
              <option value="advisor">Scope Advisor</option>
              <option value="strategist">Strategist</option>
            </select>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as AiMode)}
              className="px-2.5 py-1.5 rounded-md border text-xs bg-transparent"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              aria-label="Reasoning mode"
            >
              <option value="fast">Fast</option>
              <option value="balanced">Balanced</option>
              <option value="deep">Deep</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-pointer transition-colors"
            style={{
              borderColor: useSearchGrounding ? 'var(--accent-primary)' : 'var(--border-color)',
              color: useSearchGrounding ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Grounding</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 0 ? (
            <div className="space-y-4 pt-6">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {aiKnowledge.greetingMessage || `Ask in English or Bangla about ${settings.brandName}, Samia Sultana Bushra’s services, skills, or how to request a custom quote.`}
              </p>
              <div className="space-y-2">
                {[
                  'Who is Samia Sultana Bushra and what services does ARPHANIX offer?',
                  'ARPHANIX কোন কোন সার্ভিস দেয় এবং প্রাইসিং কীভাবে নির্ধারণ করা হয়?',
                  'How can I contact Samia directly on email, WhatsApp, or Facebook?',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg border text-xs leading-relaxed cursor-pointer transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'space-y-2'}>
                {m.role === 'user' ? (
                  <div
                    className="max-w-[85%] px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                    }}
                  >
                    {m.content}
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-xl border text-sm leading-relaxed space-y-3"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {m.content || (streaming ? 'Thinking…' : '')}
                      </Markdown>
                    </div>

                    {m.sources && m.sources.length > 0 && (
                      <div className="pt-2 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
                        {m.sources.map((src) => (
                          <a
                            key={src.uri}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs hover:underline"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--accent-secondary)' }}
                          >
                            <span className="truncate max-w-[180px]">{src.title}</span>
                            <ArrowUpRight className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}

                    {m.content && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void handleCopy(m.id, m.content)}
                          className="inline-flex items-center gap-1 text-xs cursor-pointer hover:underline"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {error && (
            <div
              className="p-3 rounded-lg border text-xs"
              style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {streaming ? (
            <button
              type="button"
              onClick={stopGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer shrink-0"
              style={{ backgroundColor: 'var(--accent-highlight)', color: '#FFFFFF' }}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer disabled:opacity-40 shrink-0"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
              }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
