import { useState } from 'react';
import { ArrowUpRight, Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResilientImage } from '../components/ResilientImage';
import type { AchievementItem } from '../types/portfolio';

export function ExperiencePage() {
  const { experience, achievements, settings, theme } = useApp();
  const [inspectCert, setInspectCert] = useState<AchievementItem | null>(null);

  const workItems = experience.filter((e) => e.type === 'work');
  const eduItems = experience.filter((e) => e.type === 'education');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="space-y-2">
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
            Education &amp; Credentials
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Education &amp; Experience
          </h1>
          <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Academic qualifications, freelancing training, work history, and verified certifications.
          </p>
        </div>

        {settings.cvUrl && (
          <a
            href={settings.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
            }}
          >
            <Download className="w-4 h-4" />
            <span>Download CV</span>
          </a>
        )}
      </div>

      {/* Career & Education Timeline */}
      <div className="py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Work Experience</h2>
          {workItems.length === 0 ? (
            <div
              className="p-6 rounded-2xl border text-sm leading-relaxed"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
            >
              No external work history entries are listed yet. Samia Sultana Bushra is the founder of ARPHANIX, combining digital marketing strategy and creative design in one integrated service practice.
            </div>
          ) : (
            <div className="space-y-4">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl border space-y-2"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{item.organization}{item.location ? ` · ${item.location}` : ''}</span>
                    <span className="font-mono-tabular">{item.period}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold">{item.role}</h3>
                  {item.summary && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {item.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Education &amp; Training</h2>
          {eduItems.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No academic entries published yet.</p>
          ) : (
            <div className="space-y-4">
              {eduItems.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl border space-y-2"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{item.organization}</span>
                    <span className="font-mono-tabular">{item.period}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold">{item.role}</h3>
                  {item.summary && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {item.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certifications & Awards */}
      <div className="pt-12 space-y-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Achievements &amp; Awards</h2>
        {achievements.length === 0 ? (
          <div
            className="p-6 rounded-2xl border text-sm"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            No awards or external accolades currently listed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((ach) => (
              <article
                key={ach.id}
                className="rounded-2xl border overflow-hidden flex flex-col sm:flex-row"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                {ach.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setInspectCert(ach)}
                    className="sm:w-44 h-44 sm:h-auto shrink-0 cursor-pointer overflow-hidden"
                    aria-label={`Inspect ${ach.title}`}
                  >
                    <ResilientImage
                      src={ach.imageUrl}
                      alt={ach.title}
                      className="w-full h-full object-cover"
                      aspectClass="w-full h-full"
                      fallbackLabel={ach.issuer}
                    />
                  </button>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{ach.issuer}</span>
                      <span className="font-mono-tabular">{ach.year}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">{ach.title}</h3>
                    {ach.description && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {ach.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    {ach.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setInspectCert(ach)}
                        className="hover:underline cursor-pointer"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        Inspect Certificate
                      </button>
                    )}
                    {ach.certificateUrl && (
                      <a
                        href={ach.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--accent-secondary)' }}
                      >
                        <span>Verify Link</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {inspectCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectCert(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm font-medium">{inspectCert.title}</span>
              <button
                type="button"
                onClick={() => setInspectCert(null)}
                className="p-1.5 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto">
              <ResilientImage
                src={inspectCert.imageUrl}
                alt={inspectCert.title}
                className="w-full max-h-[70vh] object-contain"
                fallbackLabel={inspectCert.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
