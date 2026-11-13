import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAiAssistant } from '../hooks/useAiAssistant';
import type { AiMode, AiPersona } from '../types/portfolio';

export function AssistantPage() {
  const { settings, aiKnowledge, theme, isAdmin } = useApp();
  const {
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
  } = useAiAssistant();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const text = input;
    setInput('');
    void sendMessage(text);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-editorial-enter">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono-tabular mb-2" style={{ color: 'var(--text-muted)' }}>
            {aiKnowledge.assistantRole || 'Grounded AI Workspace'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            {aiKnowledge.assistantName || `${settings.brandName} Assistant`}
          </h1>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {isAdmin ? 'Admin Cloud Thread Persistence' : 'Local Browser Session'}
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border overflow-hidden min-h-[640px]"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Thread Sidebar */}
        <aside
          className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r p-4 flex flex-col gap-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            type="button"
            onClick={() => createNewThread()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Thread</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56 lg:max-h-[520px]">
            {threads.length === 0 ? (
              <p className="text-xs px-2 py-4" style={{ color: 'var(--text-muted)' }}>
                Start a conversation to save your workspace threads.
              </p>
            ) : (
              threads.map((t) => {
                const active = t.id === activeThreadId;
                return (
                  <div
                    key={t.id}
                    className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--bg-page)' : 'transparent',
                      borderColor: active ? 'var(--border-strong)' : 'transparent',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveThreadId(t.id)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      <span className="truncate">{t.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteThread(t.id)}
                      className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                      aria-label={`Delete ${t.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Chat Workspace */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
          {/* Controls Toolbar */}
          <div
            className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Persona
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as AiPersona)}
                  className="ml-2 px-2.5 py-1.5 rounded-md border text-xs bg-transparent"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="concierge">Executive Concierge</option>
                  <option value="advisor">Project Scope Advisor</option>
                  <option value="strategist">Technical &amp; Brand Strategist</option>
                </select>
              </label>

              <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                {(['fast', 'balanced', 'deep'] as AiMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium capitalize cursor-pointer transition-colors"
                    style={{
                      backgroundColor: mode === m ? 'var(--bg-surface)' : 'transparent',
                      color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setUseSearchGrounding(!useSearchGrounding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer"
              style={{
                borderColor: useSearchGrounding ? 'var(--accent-primary)' : 'var(--border-color)',
                color: useSearchGrounding ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Grounding {useSearchGrounding ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 max-h-[480px]">
            {messages.length === 0 ? (
              <div className="max-w-xl mx-auto py-10 space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                  <Sparkles className="w-4 h-4" />
                  <span>Grounded in Verified {settings.brandName} Knowledge</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {aiKnowledge.greetingMessage || `Ask in English or Bangla about ${settings.brandName}, Samia Sultana Bushra’s services, skills, background, or how to request a custom quotation.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Who is Samia Sultana Bushra and what is ARPHANIX?',
                    'What services does ARPHANIX offer and how is pricing set?',
                    'ARPHANIX কোন কোন সার্ভিস দেয় এবং কীভাবে যোগাযোগ করব?',
                    'What are Samia’s skills, education, and languages?',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="text-left p-3.5 rounded-xl border text-xs leading-relaxed cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'space-y-2'}>
                  {m.role === 'user' ? (
                    <div
                      className="max-w-[80%] px-4 py-3 rounded-xl text-sm"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                      }}
                    >
                      {m.content}
                    </div>
                  ) : (
                    <div
                      className="p-5 rounded-xl border text-sm leading-relaxed space-y-3"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {m.content || (streaming ? 'Synthesizing response…' : '')}
                        </Markdown>
                      </div>

                      {m.sources && m.sources.length > 0 && (
                        <div className="pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
                          {m.sources.map((src) => (
                            <a
                              key={src.uri}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs hover:underline"
                              style={{ borderColor: 'var(--border-color)', color: 'var(--accent-secondary)' }}
                            >
                              <span className="truncate max-w-[220px]">{src.title}</span>
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
                            className="inline-flex items-center gap-1.5 text-xs cursor-pointer hover:underline"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === m.id ? 'Copied' : 'Copy response'}</span>
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
                className="p-3.5 rounded-lg border text-xs"
                style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, case studies, credentials, or process..."
              className="flex-1 px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer shrink-0"
                style={{ backgroundColor: 'var(--accent-highlight)', color: '#FFFFFF' }}
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 shrink-0"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                }}
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
