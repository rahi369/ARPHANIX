import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { clientConfig, normalizeWhatsappHref } from '../config/clientConfig';

export function Footer() {
  const { profile, settings, navigate } = useApp();
  const [tapCount, setTapCount] = useState(0);
  const tapResetRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        navigate(clientConfig.adminEntryPath);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleCopyrightTap = () => {
    const next = tapCount + 1;
    if (tapResetRef.current) window.clearTimeout(tapResetRef.current);
    if (next >= 5) {
      setTapCount(0);
      navigate(clientConfig.adminEntryPath);
      return;
    }
    setTapCount(next);
    tapResetRef.current = window.setTimeout(() => setTapCount(0), 2200);
  };

  const whatsappHref = normalizeWhatsappHref(settings.whatsappNumber);
  const socialEntries = Object.entries(settings.socialLinks || {}).filter(
    ([, url]) => Boolean(url && url.trim())
  );
  const currentYear = new Date().getFullYear();
  const labels = settings.navLabels;
  const footerInfo = settings.footerInfo;

  return (
    <footer
      className="border-t mt-20"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {/* Brand & Identity */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight">
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.brandName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded object-contain shrink-0"
                />
              )}
              <span>{settings.brandName}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {profile.ownerName} · {profile.professionalTitle}
            </p>
            <p className="text-sm italic font-display" style={{ color: 'var(--text-muted)' }}>
              “{profile.tagline}”
            </p>
            {profile.location && (
              <div className="flex items-center gap-2 text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {footerInfo?.directoryTitle || 'Directory'}
            </div>
            <ul className="space-y-2 text-sm">
              {[
                { label: labels?.about || 'About', path: '/about' },
                { label: labels?.gallery || 'Portfolio', path: '/gallery' },
                { label: labels?.projects || 'Case Studies', path: '/projects' },
                { label: labels?.skills || 'Skills', path: '/skills' },
                { label: labels?.experience || 'Education & Experience', path: '/experience' },
                { label: labels?.services || 'Services', path: '/services' },
                { label: labels?.faq || 'FAQ', path: '/faq' },
                { label: labels?.assistant || 'AI Assistant', path: '/assistant' },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className="hover:underline underline-offset-4 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact & Social */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {footerInfo?.channelsTitle || 'Direct Channels'}
            </div>
            <div className="space-y-2 text-sm">
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-2 hover:underline underline-offset-4"
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <span>{settings.contactEmail}</span>
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline underline-offset-4"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-secondary)' }} />
                  <span>WhatsApp · {settings.whatsappNumber}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}
            </div>

            {socialEntries.length > 0 && (
              <div className="pt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {socialEntries.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize hover:underline inline-flex items-center gap-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{platform}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <button
            type="button"
            onClick={handleCopyrightTap}
            className="text-left select-none cursor-default"
            title="Copyright"
          >
            © {currentYear} {settings.brandName}. {footerInfo?.copyrightText || 'All rights reserved.'}
          </button>

          <a
            href={(footerInfo?.developerContactUrl || '').trim() || clientConfig.developerWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${clientConfig.developerFullName} — ${clientConfig.developerBrand}`}
            className="inline-flex items-center gap-1 hover:underline underline-offset-4 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Website Designed &amp; Developed by</span>
            <span className="font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {clientConfig.developerBrand}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </footer>
  );
}
