import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowUpRight, CheckCircle2, Globe, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { normalizeWhatsappHref, PRICING_NOTICE } from '../config/clientConfig';

const RATE_LIMIT_KEY = 'studio_last_inquiry_ts';
const COOLDOWN_MS = 45_000;

export function ContactPage() {
  const { settings, profile, services, theme } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [projectType, setProjectType] = useState(services[0]?.title || 'Digital Marketing & Design');
  const [budgetRange, setBudgetRange] = useState('Custom Quotation (Discuss Scope)');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappHref = normalizeWhatsappHref(settings.whatsappNumber);
  const facebookUrl = settings.socialLinks?.facebook;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const lastTs = Number(sessionStorage.getItem(RATE_LIMIT_KEY) || 0);
      if (lastTs && Date.now() - lastTs < COOLDOWN_MS) {
        const secs = Math.ceil((COOLDOWN_MS - (Date.now() - lastTs)) / 1000);
        setError(`Please wait ${secs}s before submitting another inquiry.`);
        return;
      }
    } catch {}

    if (name.trim().length < 2) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.includes('@') || email.trim().length < 5) {
      setError('Please provide a valid email address.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please share at least a brief overview (10+ characters) of your project.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        name: name.trim().slice(0, 120),
        email: email.trim().slice(0, 160),
        whatsapp: whatsapp.trim().slice(0, 40),
        projectType: projectType.trim().slice(0, 100),
        budgetRange: budgetRange.trim().slice(0, 80),
        description: description.trim().slice(0, 3000),
        status: 'unread',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      try {
        sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      } catch {}

      setSubmitted(true);
      setName('');
      setEmail('');
      setWhatsapp('');
      setDescription('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'messages');
      } catch (wrappedErr) {
        setError('Unable to send inquiry right now. Please try direct email, WhatsApp, or Facebook.');
        console.error(wrappedErr);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="space-y-2 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
          {settings.brandName} · Bangla &amp; English
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          {PRICING_NOTICE} Reach out in Bangla or English with your project goals and requirements.
        </p>
      </div>

      <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Direct Channels */}
        <div className="lg:col-span-4 space-y-4">
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="block p-6 rounded-2xl border space-y-2 editorial-card-lift"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between">
                <Mail className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Direct Email
              </div>
              <div className="text-sm font-medium break-all">{settings.contactEmail}</div>
            </a>
          )}

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-2xl border space-y-2 editorial-card-lift"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between">
                <MessageCircle className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                WhatsApp
              </div>
              <div className="text-sm font-medium font-mono-tabular">
                {settings.whatsappNumber}
              </div>
            </a>
          )}

          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-2xl border space-y-2 editorial-card-lift"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between">
                <Globe className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Facebook
              </div>
              <div className="text-sm font-medium">Connect on Facebook</div>
            </a>
          )}

          {profile.location && (
            <div
              className="p-6 rounded-2xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <MapPin className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Location &amp; Languages
              </div>
              <div className="text-sm font-medium">{profile.location}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Bangla &amp; English
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-8">
          <div
            className="p-6 sm:p-8 rounded-2xl border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: 'var(--accent-primary)' }} />
                <h2 className="font-display text-2xl font-semibold">Inquiry Received</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Thank you for reaching out to {settings.brandName}. Your project brief has been received and Samia will review it to prepare a personalized quotation.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      WhatsApp (Optional)
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="01XXXXXXXXX or +880..."
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Service / Project Type
                    </label>
                    <input
                      type="text"
                      required
                      list="arphanix-services-list"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <datalist id="arphanix-services-list">
                      {services.map((s) => (
                        <option key={s.id} value={s.title} />
                      ))}
                      <option value="Combined Marketing & Design" />
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Quotation Preference
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="Custom Quotation (Discuss Scope)">Custom Quotation (Discuss Scope)</option>
                      <option value="Digital Marketing Campaign">Digital Marketing Campaign</option>
                      <option value="Branding & Logo Design">Branding &amp; Logo Design</option>
                      <option value="UI/UX Design Project">UI/UX Design Project</option>
                      <option value="Combined Marketing & Design">Combined Marketing &amp; Design</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Project Requirements (Bangla or English) *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share your brand goals, required services, and any key details for a custom quotation..."
                    className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="p-3 rounded-lg border text-xs"
                    style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
