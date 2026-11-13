import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRICING_NOTICE } from '../config/clientConfig';
import { ResilientImage } from '../components/ResilientImage';

export function ServicesPage() {
  const { services, settings, navigate, theme } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="space-y-2 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
          {settings.brandName} · Services &amp; Pricing
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Services</h1>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Digital marketing and creative design services handled directly by one dedicated specialist, with communication available in Bangla and English.
        </p>
      </div>

      <div
        className="mt-8 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="space-y-1">
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
            Pricing Policy
          </div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {PRICING_NOTICE}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/faq')}
          className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer hover:underline"
          style={{ color: 'var(--accent-primary)' }}
        >
          <span>View Services FAQ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {services.length === 0 ? (
        <div
          className="my-12 p-12 rounded-2xl border text-center text-sm"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          No services published yet.
        </div>
      ) : (
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <article
              key={svc.id}
              className="rounded-2xl border overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div>
                {svc.imageUrl && (
                  <div className="h-48 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <ResilientImage
                      src={svc.imageUrl}
                      alt={svc.title}
                      className="w-full h-full object-cover"
                      aspectClass="w-full h-full"
                      fallbackLabel={svc.title}
                    />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {svc.category && (
                    <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                      {svc.category}
                    </div>
                  )}
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{svc.title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {svc.summary}
                  </p>

                  {svc.features?.length > 0 && (
                    <ul className="pt-2 space-y-2 text-sm">
                      {svc.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {svc.startingPrice && (
                    <p
                      className="pt-2 border-t text-xs leading-relaxed"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                    >
                      {svc.startingPrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                  }}
                >
                  <span>Contact for custom quotation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
