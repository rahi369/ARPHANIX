import { ArrowRight, ArrowUpRight, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRICING_NOTICE } from '../config/clientConfig';
import { ResilientImage } from '../components/ResilientImage';

export function HomePage() {
  const {
    profile,
    about,
    settings,
    gallery,
    skills,
    experience,
    services,
    projects,
    faqs,
    navigate,
    setAiDrawerOpen,
    theme,
  } = useApp();

  const featuredDesigns = gallery.filter((g) => g.featured);
  const nonFeaturedDesigns = gallery.filter((g) => !g.featured);
  const displayDesigns = [...featuredDesigns, ...nonFeaturedDesigns].slice(0, 4);
  const topSkills = skills.slice(0, 8);
  const recentExperience = experience.slice(0, 4);
  const featuredServices = services.slice(0, 5);
  const selectedProjects = projects.slice(0, 4);
  const previewFaqs = faqs.slice(0, 4);

  const skillCategories = Array.from(new Set(skills.map((s) => s.name)));
  const ribbonItems =
    skillCategories.length > 0
      ? skillCategories
      : [
          'SEO',
          'Social Media Marketing',
          'Paid Advertising',
          'Logo Design',
          'Branding',
          'Visual Design',
          'UI/UX Design',
        ];

  return (
    <div className="animate-editorial-enter">
      {/* Split Hero */}
      <section className="studio-hero-bg border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Editorial Hierarchy */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-medium tracking-wide" style={{ color: 'var(--accent-secondary)' }}>
                  {profile.professionalTitle}
                  {profile.ventureName ? ` · ${profile.ventureName}` : ''}
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] text-balance">
                  {profile.ownerName}
                </h1>

                <p
                  className="font-display italic text-xl sm:text-2xl leading-snug max-w-2xl"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  “{profile.tagline}”
                </p>

                <p
                  className="text-base leading-relaxed max-w-xl"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {profile.shortIntro}
                </p>

                {profile.location && (
                  <div className="flex items-center gap-2 text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                  }}
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <span>{settings.navLabels?.hireMe || 'Get a Quote'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setAiDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--accent-secondary)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

            {/* Right Column: Framed Portrait Card */}
            <div className="lg:col-span-5">
              <div
                className="h-full rounded-2xl border p-3 flex flex-col"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex-1 rounded-xl overflow-hidden min-h-[320px] lg:min-h-[400px]">
                  <ResilientImage
                    src={profile.heroImageUrl}
                    alt={`${profile.ownerName} — ${settings.brandName}`}
                    className="w-full h-full object-cover"
                    aspectClass="w-full h-full"
                    fallbackLabel={profile.ownerName}
                  />
                </div>
                {profile.availabilityStatus && (
                  <div
                    className="pt-3 px-1 flex items-center justify-between text-xs gap-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span className="font-medium shrink-0">{settings.brandName}</span>
                    <span className="truncate">{profile.availabilityStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Verified Identity Strip */}
      <section className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Brand</div>
            <div className="font-display text-xl sm:text-2xl font-semibold">
              {settings.brandName}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {profile.yearsExperience ? 'Practice Tenure' : 'Business Model'}
            </div>
            <div className="font-display text-lg sm:text-xl font-medium">
              {profile.yearsExperience || 'Marketing & Design'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {profile.projectsDelivered ? 'Engagements Delivered' : 'Communication'}
            </div>
            <div className="font-display text-lg sm:text-xl font-medium">
              {profile.projectsDelivered || 'Bangla & English'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Location</div>
            <div className="font-display text-lg font-medium truncate">
              {profile.location || 'Moulvibazar, Sylhet, Bangladesh'}
            </div>
          </div>
        </div>
      </section>

      {/* Discipline Marquee Ribbon */}
      <div
        className="border-b overflow-hidden py-3 text-xs font-mono-tabular"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        aria-hidden="true"
      >
        <div className="animate-marquee-ribbon gap-8">
          {[...ribbonItems, ...ribbonItems, ...ribbonItems, ...ribbonItems].map((item, idx) => (
            <span key={idx} className="whitespace-nowrap flex items-center gap-8">
              <span>{item}</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* 01. About Narrative */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-2">
            <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
              01. Brand &amp; Biography
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {profile.tagline}
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-5">
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {about.personalIntroduction}
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {about.myJourney}
            </p>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer hover:underline underline-offset-4"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span>Read full biography &amp; business profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 02. Bento Featured Designs Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
              02. Portfolio Showcase
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Selected visual works
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/gallery')}
            className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            <span>Open portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {displayDesigns.length === 0 ? (
          <div
            className="p-10 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="space-y-1.5">
              <h3 className="font-display text-xl font-semibold">Portfolio Coming Soon</h3>
              <p className="text-sm max-w-xl" style={{ color: 'var(--text-muted)' }}>
                Verified visual design and brand showcase samples are currently being curated and will be published here soon.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer shrink-0"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
            >
              <span>Contact for custom quotation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {displayDesigns.map((item, idx) => {
              const isLead = idx === 0;
              return (
                <article
                  key={item.id}
                  onClick={() => navigate('/gallery')}
                  className={`editorial-card-lift cursor-pointer rounded-2xl border overflow-hidden flex flex-col ${
                    isLead ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : 'md:col-span-6'
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className={isLead ? 'h-64 sm:h-80' : 'h-56 sm:h-64'}>
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      aspectClass="w-full h-full"
                      fallbackLabel={item.title}
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.category}
                    </div>
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 03. Skills Ledger & 04. Education & Experience Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 03. Skills Ledger */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                  03. Capabilities
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  Verified skills
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/skills')}
                className="text-xs font-medium hover:underline cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
              >
                All skills
              </button>
            </div>

            <div className="divide-y border-t border-b" style={{ borderColor: 'var(--border-color)' }}>
              {topSkills.length === 0 ? (
                <div className="py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No skills published yet.
                </div>
              ) : (
                topSkills.map((sk) => (
                  <div
                    key={sk.id}
                    className="py-3.5 flex items-baseline justify-between gap-4"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div>
                      <div className="text-sm font-medium">{sk.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {sk.category}
                      </div>
                    </div>
                    {sk.proficiency && (
                      <span className="font-mono-tabular text-xs shrink-0" style={{ color: 'var(--accent-secondary)' }}>
                        {sk.proficiency}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 04. Education & Experience Timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                  04. Education &amp; Background
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  Qualifications &amp; timeline
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/experience')}
                className="text-xs font-medium hover:underline cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
              >
                Full details
              </button>
            </div>

            <div className="space-y-4">
              {recentExperience.length === 0 ? (
                <div className="py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Education and work background entries will be listed here.
                </div>
              ) : (
                recentExperience.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border space-y-1.5"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                    }}
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
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 05. Services Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="space-y-1.5">
            <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
              05. Services &amp; Custom Quotes
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              ARPHANIX services
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            <span>View all services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {PRICING_NOTICE}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.length === 0 ? (
            <div className="col-span-full text-sm" style={{ color: 'var(--text-muted)' }}>
              No services published yet.
            </div>
          ) : (
            featuredServices.map((svc) => (
              <div
                key={svc.id}
                className="editorial-card-lift p-6 rounded-2xl border flex flex-col justify-between gap-6"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="space-y-3">
                  {svc.category && (
                    <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                      {svc.category}
                    </div>
                  )}
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {svc.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {svc.summary}
                  </p>
                  {svc.features?.length > 0 && (
                    <ul className="pt-2 space-y-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                      {svc.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: 'var(--accent-primary)' }}>—</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  <span>Contact for custom quotation</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 06. Selected Projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
              06. Case Studies
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Projects &amp; case studies
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            <span>Open case studies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedProjects.length === 0 ? (
            <div
              className="col-span-full p-8 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-1">
                <h3 className="font-display text-xl font-semibold">Portfolio Coming Soon</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Detailed project case studies will be added as public client releases become available.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer shrink-0"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
              >
                <span>Discuss your project</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            selectedProjects.map((proj) => (
              <article
                key={proj.id}
                onClick={() => navigate('/projects')}
                className="editorial-card-lift cursor-pointer rounded-2xl border overflow-hidden flex flex-col"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {proj.screenshots?.[0] && (
                  <div className="h-56">
                    <ResilientImage
                      src={proj.screenshots[0]}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                      aspectClass="w-full h-full"
                      fallbackLabel={proj.title}
                    />
                  </div>
                )}
                <div className="p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {proj.client && <span>{proj.client}</span>}
                      {proj.client && <span aria-hidden="true">·</span>}
                      <span>{proj.status}</span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">
                      {proj.title}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {proj.problem}
                    </p>
                  </div>
                  {proj.techStack?.length > 0 && (
                    <div className="pt-3 text-xs font-mono-tabular" style={{ color: 'var(--accent-secondary)' }}>
                      {proj.techStack.join(' · ')}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* 07. Frequently Asked Questions Preview */}
      {previewFaqs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                07. Frequently Asked Questions
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Quick answers
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/faq')}
              className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span>View all {faqs.length} FAQs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewFaqs.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border space-y-2"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
                  {item.category}
                </div>
                <h3 className="font-display text-lg font-semibold">{item.question}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dark Executive Contact Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div
          className="rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
          style={{
            backgroundColor: '#111C17',
            color: '#F4F1EA',
            border: '1px solid #24352C',
          }}
        >
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-mono-tabular" style={{ color: '#6EC4A7' }}>
              {settings.brandName} · Bangla &amp; English Inquiries
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Ready to combine creative design with digital growth?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#9BA9A1' }}>
              {PRICING_NOTICE} Reach out in Bangla or English via email, WhatsApp, or the inquiry form.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#52A58C', color: '#0A120F' }}
            >
              <span>Contact for custom quotation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
