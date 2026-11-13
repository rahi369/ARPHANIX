import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizeWhatsappHref } from '../config/clientConfig';

export function Navbar() {
  const {
    currentPath,
    navigate,
    theme,
    toggleTheme,
    settings,
    isAdmin,
    unreadCount,
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const labels = settings.navLabels || {
    about: 'About',
    gallery: 'Gallery',
    projects: 'Projects',
    services: 'Services',
    contact: 'Contact',
    hireMe: 'Hire Me',
    skills: 'Skills',
    experience: 'Experience & Achievements',
    assistant: 'AI Assistant',
  };

  const PRIMARY_NAV = [
    { label: labels.about || 'About', path: '/about' },
    { label: labels.gallery || 'Portfolio', path: '/gallery' },
    { label: labels.projects || 'Case Studies', path: '/projects' },
    { label: labels.services || 'Services', path: '/services' },
    { label: labels.contact || 'Contact', path: '/contact' },
  ];

  const MOBILE_DRAWER_LINKS = [
    { num: '01', label: 'Home', path: '/' },
    { num: '02', label: labels.about || 'About', path: '/about' },
    { num: '03', label: labels.gallery || 'Portfolio', path: '/gallery' },
    { num: '04', label: labels.projects || 'Case Studies', path: '/projects' },
    { num: '05', label: labels.skills || 'Skills', path: '/skills' },
    { num: '06', label: labels.experience || 'Education & Experience', path: '/experience' },
    { num: '07', label: labels.services || 'Services', path: '/services' },
    { num: '08', label: labels.faq || 'FAQ', path: '/faq' },
    { num: '09', label: labels.assistant || 'AI Assistant', path: '/assistant' },
    { num: '10', label: labels.contact || 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const whatsappHref = normalizeWhatsappHref(settings.whatsappNumber);
  const socialEntries = Object.entries(settings.socialLinks || {}).filter(
    ([, url]) => Boolean(url && url.trim())
  );

  return (
    <>
      <div
        className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-page) 92%, transparent)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Slim Desktop Utility Bar */}
        <div
          className="hidden lg:block border-b text-xs"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="max-w-6xl mx-auto px-6 h-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => navigate('/skills')}
                className="hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                style={{ color: currentPath === '/skills' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {labels.skills || 'Skills'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/experience')}
                className="hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                style={{ color: currentPath === '/experience' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {labels.experience || 'Education & Experience'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/faq')}
                className="hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                style={{ color: currentPath === '/faq' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {labels.faq || 'FAQ'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/assistant')}
                className="inline-flex items-center gap-1.5 hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors font-medium"
                style={{ color: currentPath === '/assistant' ? 'var(--accent-primary)' : 'var(--text-primary)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-secondary)' }} />
                <span>{labels.assistant || 'AI Assistant'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              {settings.cvUrl && (
                <a
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:underline whitespace-nowrap shrink-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </a>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/overview')}
                  className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 cursor-pointer hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    Admin Console{unreadCount > 0 ? ` (${unreadCount})` : ''}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Zone Main Navigation Header */}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="inline-flex items-center gap-2.5 font-display text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap shrink-0"
            style={{ color: 'var(--text-primary)' }}
          >
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt={settings.brandName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded object-contain shrink-0"
              />
            )}
            <span>{settings.brandName}</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium" aria-label="Primary Navigation">
            {PRIMARY_NAV.map((item) => {
              const active = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                  className="whitespace-nowrap shrink-0 transition-colors hover:underline underline-offset-4"
                  style={{
                    color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                    textDecoration: active ? 'underline' : undefined,
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
              }}
            >
              <span>{labels.hireMe || 'Hire Me'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Full-Viewport Numbered Mobile Drawer (h-dvh) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 h-dvh flex flex-col overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="px-4 h-16 flex items-center justify-between border-b shrink-0"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <span className="font-display text-lg font-semibold tracking-tight">{settings.brandName}</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-5 py-6 divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {MOBILE_DRAWER_LINKS.map((item) => {
              const active = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className="w-full py-3.5 flex items-baseline justify-between text-left cursor-pointer"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono-tabular text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.num}
                    </span>
                    <span
                      className="font-display text-xl font-medium"
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                    >
                      {item.label}
                    </span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 opacity-60" />
                </button>
              );
            })}
          </nav>

          <div
            className="px-5 py-5 border-t space-y-4 shrink-0"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  navigate('/contact');
                  setMobileOpen(false);
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-center cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                }}
              >
                {labels.hireMe || 'Hire Me'}
              </button>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-center border"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  WhatsApp
                </a>
              ) : (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-center border"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  Email
                </a>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {settings.cvUrl && (
                <a
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download CV</span>
                </a>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/overview');
                    setMobileOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border font-medium cursor-pointer"
                  style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
            </div>

            {socialEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                {socialEntries.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize hover:underline"
                  >
                    {name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
