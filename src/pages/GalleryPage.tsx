import { useMemo, useState } from 'react';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResilientImage } from '../components/ResilientImage';
import type { GalleryItem } from '../types/portfolio';

export function GalleryPage() {
  const { gallery, navigate, setAiDrawerOpen, theme } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(gallery.map((g) => g.category).filter(Boolean)));
    return ['All', ...cats];
  }, [gallery]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return gallery;
    return gallery.filter((g) => g.category === selectedCategory);
  }, [gallery, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="space-y-2">
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
            Work &amp; Design Showcase
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Portfolio
          </h1>
          <p className="text-sm sm:text-base max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Visual design, branding, UI/UX concepts, and digital campaign creatives.
          </p>
        </div>

        {/* Category Filter Controls */}
        {gallery.length > 0 && (
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
                    color: active
                      ? theme === 'dark'
                        ? '#0A120F'
                        : '#FAF8F3'
                      : 'var(--text-muted)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          className="my-12 p-10 sm:p-14 rounded-2xl border text-center space-y-5"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
            Visual Design &amp; Marketing Work
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Portfolio Coming Soon
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Selected logo design, branding, visual design, and UI/UX work samples will be published here soon. Feel free to contact Samia directly to discuss your upcoming project.
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
        <div className="pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <article
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="editorial-card-lift cursor-pointer rounded-2xl border overflow-hidden flex flex-col"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="h-60">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  aspectClass="w-full h-full"
                  fallbackLabel={item.title}
                />
              </div>
              <div className="p-5 space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{item.category}</span>
                  {item.featured && (
                    <span style={{ color: 'var(--accent-secondary)' }}>Featured</span>
                  )}
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">{item.title}</h2>
                {item.description && (
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Full Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setActiveItem(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between gap-4"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {activeItem.category}
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                aria-label="Close lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <div className="bg-black/5 max-h-[58vh] flex items-center justify-center overflow-hidden">
                <ResilientImage
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full max-h-[58vh] object-contain"
                  fallbackLabel={activeItem.title}
                />
              </div>

              <div className="p-6 space-y-3">
                <h2 className="font-display text-2xl font-semibold">{activeItem.title}</h2>
                {activeItem.description && (
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {activeItem.description}
                  </p>
                )}
                {activeItem.externalUrl && (
                  <div className="pt-2">
                    <a
                      href={activeItem.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      <span>View live reference</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
