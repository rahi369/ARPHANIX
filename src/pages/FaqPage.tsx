import { useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function FaqPage() {
  const { faqs, navigate, setAiDrawerOpen, theme } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category || 'General').filter(Boolean)));
    return ['All', ...cats];
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((item) => {
      const catMatch = selectedCategory === 'All' || (item.category || 'General') === selectedCategory;
      const textMatch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="space-y-2 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
          10. Frequently Asked Questions
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Questions &amp; Answers
        </h1>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Verified answers about Samia Sultana Bushra, ARPHANIX services, custom quotations, and direct communication in Bangla and English.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="pt-8 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          {categories.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                  color: active ? (theme === 'dark' ? '#0A120F' : '#FAF8F3') : 'var(--text-muted)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Accordion List */}
      {filtered.length === 0 ? (
        <div
          className="my-8 p-10 rounded-2xl border text-center text-sm"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          No matching questions found. Ask our AI Assistant or contact Samia directly.
        </div>
      ) : (
        <div
          className="divide-y rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          {filtered.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 text-left cursor-pointer hover:opacity-90"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono-tabular" style={{ color: 'var(--accent-secondary)' }}>
                      <span>{String(idx + 1).padStart(2, '0')}.</span>
                      {item.category && <span>{item.category}</span>}
                    </div>
                    <h2 className="font-display text-lg font-semibold tracking-tight">
                      {item.question}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Follow-Up CTA */}
      <div
        className="mt-10 p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="space-y-1">
          <h3 className="font-display text-xl font-semibold">Still have a question?</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Contact Samia directly in Bangla or English for a personalized quote, or ask the ARPHANIX AI Assistant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setAiDrawerOpen(true)}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            Ask AI Assistant
          </button>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
            }}
          >
            <span>Contact for custom quotation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
