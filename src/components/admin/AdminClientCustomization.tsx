import { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowRight, Check, Palette, RotateCcw, Save } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import {
  DEFAULT_FOOTER_INFO,
  DEFAULT_NAV_LABELS,
  DEFAULT_THEME_COLORS,
} from '../../config/clientConfig';
import { MediaUploadField } from '../MediaUploadField';
import type { FooterInfo, NavLabels, ThemeColors } from '../../types/portfolio';

interface AdminClientCustomizationProps {
  onNavigateTab: (tab: string) => void;
}

export function AdminClientCustomization({ onNavigateTab }: AdminClientCustomizationProps) {
  const { profile, about, settings, isFirestoreSeeded, ensureStarterSeeded, theme } = useApp();

  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [brandName, setBrandName] = useState(settings.brandName);
  const [professionalTitle, setProfessionalTitle] = useState(profile.professionalTitle);
  const [ventureName, setVentureName] = useState(profile.ventureName);
  const [location, setLocation] = useState(profile.location);
  const [tagline, setTagline] = useState(profile.tagline);
  const [shortIntro, setShortIntro] = useState(profile.shortIntro);
  const [heroImageUrl, setHeroImageUrl] = useState(profile.heroImageUrl);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(settings.coverImageUrl || '');

  const [personalIntroduction, setPersonalIntroduction] = useState(about.personalIntroduction);
  const [myJourney, setMyJourney] = useState(about.myJourney);

  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks || {});

  const [seoTitle, setSeoTitle] = useState(settings.seoTitle);
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription);

  const [themeColors, setThemeColors] = useState<ThemeColors>(
    settings.themeColors || DEFAULT_THEME_COLORS
  );
  const [navLabels, setNavLabels] = useState<NavLabels>(
    settings.navLabels || DEFAULT_NAV_LABELS
  );
  const [footerInfo, setFooterInfo] = useState<FooterInfo>(
    settings.footerInfo || DEFAULT_FOOTER_INFO
  );

  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOwnerName(profile.ownerName);
    setProfessionalTitle(profile.professionalTitle);
    setVentureName(profile.ventureName);
    setLocation(profile.location);
    setTagline(profile.tagline);
    setShortIntro(profile.shortIntro);
    setHeroImageUrl(profile.heroImageUrl);
  }, [profile]);

  useEffect(() => {
    setPersonalIntroduction(about.personalIntroduction);
    setMyJourney(about.myJourney);
  }, [about]);

  useEffect(() => {
    setBrandName(settings.brandName);
    setLogoUrl(settings.logoUrl || '');
    setCoverImageUrl(settings.coverImageUrl || '');
    setContactEmail(settings.contactEmail);
    setWhatsappNumber(settings.whatsappNumber);
    setSocialLinks(settings.socialLinks || {});
    setSeoTitle(settings.seoTitle);
    setSeoDescription(settings.seoDescription);
    setThemeColors(settings.themeColors || DEFAULT_THEME_COLORS);
    setNavLabels(settings.navLabels || DEFAULT_NAV_LABELS);
    setFooterInfo(settings.footerInfo || DEFAULT_FOOTER_INFO);
  }, [settings]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedNotice(null);

    try {
      if (!isFirestoreSeeded) {
        await ensureStarterSeeded();
      }
      const now = serverTimestamp();

      await setDoc(doc(db, 'site_profile', 'main'), {
        ownerName: ownerName.trim().slice(0, 120) || 'Samia Sultana Bushra',
        professionalTitle:
          professionalTitle.trim().slice(0, 160) ||
          'Full Stack Digital Marketer, Visual Designer & UI/UX Designer',
        ventureName: ventureName.trim().slice(0, 120),
        location: location.trim().slice(0, 120),
        tagline: tagline.trim().slice(0, 240) || 'Artistry Meets Growth.',
        shortIntro: shortIntro.trim().slice(0, 600) || 'Digital marketing and creative design studio.',
        heroImageUrl: heroImageUrl.trim().slice(0, 1000),
        availabilityStatus: (profile.availabilityStatus || '').trim().slice(0, 100),
        yearsExperience: (profile.yearsExperience || '').trim().slice(0, 40),
        projectsDelivered: (profile.projectsDelivered || '').trim().slice(0, 40),
        clientSatisfaction: (profile.clientSatisfaction || '').trim().slice(0, 40),
        updatedAt: now,
      });

      await setDoc(doc(db, 'site_about', 'main'), {
        personalIntroduction: personalIntroduction.trim().slice(0, 3000) || 'Studio overview.',
        myJourney: myJourney.trim().slice(0, 3000) || 'Practice journey.',
        businessOrTechBackground: (about.businessOrTechBackground || '').trim().slice(0, 3000),
        entrepreneurship: (about.entrepreneurship || '').trim().slice(0, 3000),
        education: (about.education || '').trim().slice(0, 3000),
        professionalGoals: (about.professionalGoals || '').trim().slice(0, 3000),
        businessInformation: (about.businessInformation || '').trim().slice(0, 3000),
        customInstructions: (about.customInstructions || '').trim().slice(0, 3000),
        additionalInformation: (about.additionalInformation || '').trim().slice(0, 3000),
        updatedAt: now,
      });

      await setDoc(doc(db, 'site_settings', 'main'), {
        brandName: brandName.trim().slice(0, 100) || 'ARPHANIX',
        logoUrl: logoUrl.trim().slice(0, 1000),
        coverImageUrl: coverImageUrl.trim().slice(0, 1000),
        contactEmail: contactEmail.trim().slice(0, 160),
        whatsappNumber: whatsappNumber.trim().slice(0, 40),
        cvUrl: (settings.cvUrl || '').trim().slice(0, 1000),
        cvFileName: (settings.cvFileName || 'ARPHANIX-Profile.pdf').trim().slice(0, 160),
        cloudinaryCloudName: (settings.cloudinaryCloudName || '').trim().slice(0, 120),
        cloudinaryUploadPreset: (settings.cloudinaryUploadPreset || '').trim().slice(0, 120),
        seoTitle: seoTitle.trim().slice(0, 160),
        seoDescription: seoDescription.trim().slice(0, 320),
        seoOgImage: (settings.seoOgImage || '').trim().slice(0, 1000),
        socialLinks: {
          facebook: (socialLinks.facebook || '').trim(),
          linkedin: (socialLinks.linkedin || '').trim(),
          github: (socialLinks.github || '').trim(),
          behance: (socialLinks.behance || '').trim(),
          instagram: (socialLinks.instagram || '').trim(),
          x: (socialLinks.x || '').trim(),
          website: (socialLinks.website || '').trim(),
        },
        themeColors: {
          lightPrimary: themeColors.lightPrimary,
          lightSecondary: themeColors.lightSecondary,
          lightBg: themeColors.lightBg,
          lightSurface: themeColors.lightSurface,
          darkPrimary: themeColors.darkPrimary,
          darkSecondary: themeColors.darkSecondary,
          darkBg: themeColors.darkBg,
          darkSurface: themeColors.darkSurface,
        },
        navLabels: {
          about: navLabels.about,
          gallery: navLabels.gallery,
          projects: navLabels.projects,
          services: navLabels.services,
          contact: navLabels.contact,
          hireMe: navLabels.hireMe,
          skills: navLabels.skills,
          experience: navLabels.experience,
          faq: navLabels.faq || 'FAQ',
          assistant: navLabels.assistant,
        },
        footerInfo: {
          directoryTitle: footerInfo.directoryTitle,
          channelsTitle: footerInfo.channelsTitle,
          copyrightText: footerInfo.copyrightText,
          developerContactUrl: footerInfo.developerContactUrl,
        },
        updatedAt: now,
      });

      // Notify server AI cache to refresh immediately
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          await fetch('/api/ai/invalidate-cache', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch {}

      setSavedNotice('All client customization changes published live to Cloud Firestore.');
      setTimeout(() => setSavedNotice(null), 5000);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'client_customization');
      } catch {
        setError('Unable to publish customization. Verify admin permissions and field lengths.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h2 className="font-display text-2xl font-semibold">Client Customization Hub</h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Rebrand identity, media, theme colors, navigation labels, and footer details with zero code edits.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 shrink-0"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
          }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Save & Publish All'}</span>
        </button>
      </div>

      {savedNotice && (
        <div
          className="p-3.5 rounded-xl border flex items-center gap-2 text-sm"
          style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}
      {error && (
        <div
          className="p-3.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
        >
          {error}
        </div>
      )}

      {/* 1. Identity & Brand */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">1. Client Identity &amp; Brand</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *" value={ownerName} onChange={setOwnerName} required />
          <Field label="Brand / Business Name *" value={brandName} onChange={setBrandName} required />
          <Field label="Professional Title *" value={professionalTitle} onChange={setProfessionalTitle} required />
          <Field label="Venture / Studio Subtitle" value={ventureName} onChange={setVentureName} />
          <Field label="Location" value={location} onChange={setLocation} />
          <Field label="Tagline *" value={tagline} onChange={setTagline} required />
        </div>
        <TextAreaField label="Short Hero Introduction *" value={shortIntro} onChange={setShortIntro} rows={3} required />
      </section>

      {/* 2. Photos & Brand Media */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">2. Profile Photo, Logo &amp; Cover Image</h3>
        <MediaUploadField label="Profile / Hero Portrait Photo" value={heroImageUrl} onChange={setHeroImageUrl} folder="profiles" />
        <MediaUploadField label="Brand Logo (Optional)" value={logoUrl} onChange={setLogoUrl} folder="logos" />
        <MediaUploadField label="Cover / Social Share Image" value={coverImageUrl} onChange={setCoverImageUrl} folder="covers" />
      </section>

      {/* 3. Biography & About Summary */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">3. Biography &amp; About Overview</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline cursor-pointer"
            style={{ color: 'var(--accent-primary)' }}
          >
            <span>Edit all About chapters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <TextAreaField label="Personal Introduction *" value={personalIntroduction} onChange={setPersonalIntroduction} rows={4} required />
        <TextAreaField label="Journey & Story *" value={myJourney} onChange={setMyJourney} rows={4} required />
      </section>

      {/* 4. Quick Links to Structured Content Sections */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-3"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">4. Portfolio Modules</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Jump directly to edit structured items for this client:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {[
            { id: 'skills', label: 'Skills' },
            { id: 'experience', label: 'Experience & Edu' },
            { id: 'services', label: 'Services' },
            { id: 'projects', label: 'Projects' },
            { id: 'gallery', label: 'Portfolio' },
            { id: 'achievements', label: 'Achievements' },
            { id: 'faqs', label: 'FAQs' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateTab(item.id)}
              className="px-3 py-2.5 rounded-lg border text-xs font-medium text-center cursor-pointer hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Contact & Social Links */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">5. Contact &amp; Social Media Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Public Contact Email" value={contactEmail} onChange={setContactEmail} type="email" />
          <Field label="WhatsApp Number" value={whatsappNumber} onChange={setWhatsappNumber} />
          <Field
            label="Facebook URL"
            value={socialLinks.facebook || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, facebook: v })}
          />
          <Field
            label="LinkedIn URL"
            value={socialLinks.linkedin || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, linkedin: v })}
          />
          <Field
            label="GitHub URL"
            value={socialLinks.github || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, github: v })}
          />
          <Field
            label="Behance / Dribbble URL"
            value={socialLinks.behance || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, behance: v })}
          />
          <Field
            label="Instagram URL"
            value={socialLinks.instagram || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, instagram: v })}
          />
          <Field
            label="X (Twitter) URL"
            value={socialLinks.x || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, x: v })}
          />
          <Field
            label="Personal Website URL"
            value={socialLinks.website || ''}
            onChange={(v) => setSocialLinks({ ...socialLinks, website: v })}
          />
        </div>
      </section>

      {/* 6. Website Title & SEO */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">6. Website Title &amp; Meta Description</h3>
        <Field label="Website SEO Title" value={seoTitle} onChange={setSeoTitle} />
        <TextAreaField label="Website Meta Description" value={seoDescription} onChange={setSeoDescription} rows={2} />
      </section>

      {/* 7. Website Theme Colors */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-display text-lg font-semibold">7. Website Theme Colors</h3>
          </div>
          <button
            type="button"
            onClick={() => setThemeColors(DEFAULT_THEME_COLORS)}
            className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Editorial Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorField
            label="Light Primary"
            value={themeColors.lightPrimary}
            onChange={(v) => setThemeColors({ ...themeColors, lightPrimary: v })}
          />
          <ColorField
            label="Light Secondary"
            value={themeColors.lightSecondary}
            onChange={(v) => setThemeColors({ ...themeColors, lightSecondary: v })}
          />
          <ColorField
            label="Light Background"
            value={themeColors.lightBg}
            onChange={(v) => setThemeColors({ ...themeColors, lightBg: v })}
          />
          <ColorField
            label="Light Card Surface"
            value={themeColors.lightSurface}
            onChange={(v) => setThemeColors({ ...themeColors, lightSurface: v })}
          />
          <ColorField
            label="Dark Primary"
            value={themeColors.darkPrimary}
            onChange={(v) => setThemeColors({ ...themeColors, darkPrimary: v })}
          />
          <ColorField
            label="Dark Secondary"
            value={themeColors.darkSecondary}
            onChange={(v) => setThemeColors({ ...themeColors, darkSecondary: v })}
          />
          <ColorField
            label="Dark Background"
            value={themeColors.darkBg}
            onChange={(v) => setThemeColors({ ...themeColors, darkBg: v })}
          />
          <ColorField
            label="Dark Card Surface"
            value={themeColors.darkSurface}
            onChange={(v) => setThemeColors({ ...themeColors, darkSurface: v })}
          />
        </div>
      </section>

      {/* 8. Navigation Labels & Footer Information */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">8. Navigation Labels &amp; Footer Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Nav: About" value={navLabels.about} onChange={(v) => setNavLabels({ ...navLabels, about: v })} />
          <Field label="Nav: Gallery" value={navLabels.gallery} onChange={(v) => setNavLabels({ ...navLabels, gallery: v })} />
          <Field label="Nav: Projects" value={navLabels.projects} onChange={(v) => setNavLabels({ ...navLabels, projects: v })} />
          <Field label="Nav: Services" value={navLabels.services} onChange={(v) => setNavLabels({ ...navLabels, services: v })} />
          <Field label="Nav: Contact" value={navLabels.contact} onChange={(v) => setNavLabels({ ...navLabels, contact: v })} />
          <Field label="CTA: Hire Me" value={navLabels.hireMe} onChange={(v) => setNavLabels({ ...navLabels, hireMe: v })} />
          <Field label="Utility: Skills" value={navLabels.skills} onChange={(v) => setNavLabels({ ...navLabels, skills: v })} />
          <Field label="Utility: Experience" value={navLabels.experience} onChange={(v) => setNavLabels({ ...navLabels, experience: v })} />
          <Field label="Utility: FAQ" value={navLabels.faq || 'FAQ'} onChange={(v) => setNavLabels({ ...navLabels, faq: v })} />
          <Field label="Utility: AI Assistant" value={navLabels.assistant} onChange={(v) => setNavLabels({ ...navLabels, assistant: v })} />
        </div>

        <div className="pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderColor: 'var(--border-color)' }}>
          <Field
            label="Footer Directory Heading"
            value={footerInfo.directoryTitle}
            onChange={(v) => setFooterInfo({ ...footerInfo, directoryTitle: v })}
          />
          <Field
            label="Footer Channels Heading"
            value={footerInfo.channelsTitle}
            onChange={(v) => setFooterInfo({ ...footerInfo, channelsTitle: v })}
          />
          <Field
            label="Copyright Notice Suffix"
            value={footerInfo.copyrightText}
            onChange={(v) => setFooterInfo({ ...footerInfo, copyrightText: v })}
          />
          <Field
            label="WENDAXY Developer Link (Footer Ad)"
            value={footerInfo.developerContactUrl}
            onChange={(v) => setFooterInfo({ ...footerInfo, developerContactUrl: v })}
            placeholder="https://wendaxy.vercel.app"
          />
        </div>
      </section>

      {savedNotice && (
        <div
          className="p-3.5 rounded-xl border flex items-center gap-2 text-sm"
          style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}
      {error && (
        <div
          className="p-3.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
        >
          {error}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
          }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Save & Publish All'}</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
        style={{
          backgroundColor: 'var(--bg-page)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <textarea
        rows={rows}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
        style={{
          backgroundColor: 'var(--bg-page)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border cursor-pointer shrink-0 p-0.5 bg-transparent"
          style={{ borderColor: 'var(--border-color)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-xs font-mono-tabular"
          style={{
            backgroundColor: 'var(--bg-page)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
    </div>
  );
}
