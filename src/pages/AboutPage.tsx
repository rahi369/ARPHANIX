import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResilientImage } from '../components/ResilientImage';

export function AboutPage() {
  const { about, profile, settings, navigate, setAiDrawerOpen } = useApp();

  const chapters = [
    { num: '01', title: 'Professional Biography', content: about.personalIntroduction },
    { num: '02', title: 'Brand Philosophy & Journey', content: about.myJourney },
    { num: '03', title: 'Marketing & Design Craft', content: about.businessOrTechBackground },
    { num: '04', title: 'Value Proposition & Practice', content: about.entrepreneurship },
    { num: '05', title: 'Education & Qualifications', content: about.education },
    { num: '06', title: 'Professional Direction', content: about.professionalGoals },
    { num: '07', title: 'Business Information', content: about.businessInformation },
    { num: '08', title: 'Project & Pricing Notes', content: about.customInstructions },
    { num: '09', title: 'Languages & Additional Information', content: about.additionalInformation },
  ].filter((c) => Boolean(c.content && c.content.trim()));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      {/* Header Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b items-center" style={{ borderColor: 'var(--border-color)' }}>
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
            Profile · {settings.brandName}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
            {profile.ownerName}
          </h1>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {profile.professionalTitle}
            {profile.location ? ` · ${profile.location}` : ''}
          </div>
          <p className="text-lg font-display italic" style={{ color: 'var(--accent-primary)' }}>
            “{profile.tagline}”
          </p>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            {profile.shortIntro}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div
            className="rounded-2xl border p-2.5 h-72 sm:h-80"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <ResilientImage
              src={profile.heroImageUrl}
              alt={profile.ownerName}
              className="w-full h-full object-cover rounded-xl"
              aspectClass="w-full h-full"
              fallbackLabel={profile.ownerName}
            />
          </div>
        </div>
      </div>

      {/* Structured Biography & Business Chapters */}
      <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {chapters.map((ch) => (
          <section
            key={ch.num}
            className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="lg:col-span-4 flex items-baseline gap-3">
              <span className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                {ch.num}.
              </span>
              <h2 className="font-display text-2xl font-semibold tracking-tight">{ch.title}</h2>
            </div>
            <div className="lg:col-span-8">
              <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
                {ch.content}
              </p>
            </div>
          </section>
        ))}
      </div>

      <div className="pt-8 flex flex-wrap items-center justify-between gap-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <span>Explore Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/faq')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <span>Read FAQ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAiDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--accent-secondary)' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/contact')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
        >
          <span>Contact for custom quotation</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
