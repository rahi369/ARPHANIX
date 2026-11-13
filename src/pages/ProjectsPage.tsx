import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Code2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResilientImage } from '../components/ResilientImage';

export function ProjectsPage() {
  const { projects, navigate, setAiDrawerOpen, theme } = useApp();
  const [slideIndexes, setSlideIndexes] = useState<Record<string, number>>({});

  const stepSlide = (id: string, total: number, delta: number) => {
    setSlideIndexes((prev) => {
      const curr = prev[id] || 0;
      return { ...prev, [id]: (curr + delta + total) % total };
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="space-y-2 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
          Selected Case Studies
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Client case studies highlighting marketing strategy, visual craft, and digital design outcomes.
        </p>
      </div>

      {projects.length === 0 ? (
        <div
          className="my-12 p-10 sm:p-14 rounded-2xl border text-center space-y-5"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
            Case Studies &amp; Work
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Portfolio Coming Soon
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Detailed client projects and case studies are currently being curated and will be published here soon. Reach out directly to discuss your brand or campaign requirements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
              }}
            >
              <span>Contact for custom quotation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setAiDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-10 space-y-10">
          {projects.map((proj) => {
            const shots = proj.screenshots || [];
            const activeIdx = slideIndexes[proj.id] || 0;
            const currentShot = shots[activeIdx];

            return (
              <article
                key={proj.id}
                className="rounded-2xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* Screenshot Carousel / Visual */}
                <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[340px] border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'var(--border-color)' }}>
                  <ResilientImage
                    src={currentShot}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    aspectClass="w-full h-full"
                    fallbackLabel={proj.title}
                  />
                  {shots.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stepSlide(proj.id, shots.length, -1)}
                        className="p-1.5 rounded-lg bg-black/65 text-white cursor-pointer hover:bg-black/80"
                        aria-label="Previous screenshot"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-2 py-1 rounded bg-black/65 text-white font-mono-tabular text-[11px]">
                        {activeIdx + 1} / {shots.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => stepSlide(proj.id, shots.length, 1)}
                        className="p-1.5 rounded-lg bg-black/65 text-white cursor-pointer hover:bg-black/80"
                        aria-label="Next screenshot"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Case Study Details */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {proj.client && <span>{proj.client}</span>}
                      {proj.client && <span aria-hidden="true">·</span>}
                      <span>{proj.status}</span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                      {proj.title}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium" style={{ color: 'var(--accent-secondary)' }}>
                          Challenge
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {proj.problem}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                          Solution
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {proj.solution}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
                    {proj.techStack?.length > 0 && (
                      <div className="font-mono-tabular text-xs" style={{ color: 'var(--text-muted)' }}>
                        {proj.techStack.join(' · ')}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm font-medium">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          <span>Live Demo</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Code2 className="w-4 h-4" />
                          <span>Repository</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
