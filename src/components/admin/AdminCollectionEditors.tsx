import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Check, Download, Plus, Save, Sparkles, Trash2, Wifi } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import { DEFAULT_SITE_ABOUT, DEFAULT_SITE_PROFILE } from '../../config/clientConfig';
import { testCloudinaryConnection } from '../../lib/upload';
import { MediaUploadField } from '../MediaUploadField';
import { ResilientImage } from '../ResilientImage';
import type {
  AchievementItem,
  ExperienceItem,
  FaqItem,
  GalleryItem,
  MessageStatus,
  ProjectItem,
  ProjectStatus,
  ServiceItem,
  SkillItem,
} from '../../types/portfolio';

const DEFAULT_STARTER_PREFIXES = ['default-', 'skill-', 'svc-', 'edu-', 'ach-', 'faq-'];

function isStarterId(id: string): boolean {
  return DEFAULT_STARTER_PREFIXES.some((prefix) => id.startsWith(prefix));
}

async function invalidateAiCacheSafe() {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      await fetch('/api/ai/invalidate-cache', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // non-fatal
  }
}

export function AdminProfileAboutEditor() {
  const { profile, about, isFirestoreSeeded, ensureStarterSeeded, theme } = useApp();
  const [p, setP] = useState(profile);
  const [a, setA] = useState(about);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setP(profile), [profile]);
  useEffect(() => setA(about), [about]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      if (!isFirestoreSeeded) {
        await ensureStarterSeeded();
      }
      const now = serverTimestamp();
      const profilePayload = {
        ownerName: (p.ownerName || '').trim().slice(0, 120) || DEFAULT_SITE_PROFILE.ownerName,
        professionalTitle:
          (p.professionalTitle || '').trim().slice(0, 160) || DEFAULT_SITE_PROFILE.professionalTitle,
        ventureName: (p.ventureName || '').trim().slice(0, 120),
        location: (p.location || '').trim().slice(0, 120),
        tagline: (p.tagline || '').trim().slice(0, 240) || DEFAULT_SITE_PROFILE.tagline,
        shortIntro: (p.shortIntro || '').trim().slice(0, 600) || DEFAULT_SITE_PROFILE.shortIntro,
        heroImageUrl: (p.heroImageUrl || '').trim().slice(0, 1000),
        availabilityStatus: (p.availabilityStatus || '').trim().slice(0, 100),
        yearsExperience: (p.yearsExperience || '').trim().slice(0, 40),
        projectsDelivered: (p.projectsDelivered || '').trim().slice(0, 40),
        clientSatisfaction: (p.clientSatisfaction || '').trim().slice(0, 40),
        updatedAt: now,
      };
      const aboutPayload = {
        personalIntroduction:
          (a.personalIntroduction || '').trim().slice(0, 3000) || DEFAULT_SITE_ABOUT.personalIntroduction,
        myJourney: (a.myJourney || '').trim().slice(0, 3000) || DEFAULT_SITE_ABOUT.myJourney,
        businessOrTechBackground: (a.businessOrTechBackground || '').trim().slice(0, 3000),
        entrepreneurship: (a.entrepreneurship || '').trim().slice(0, 3000),
        education: (a.education || '').trim().slice(0, 3000),
        professionalGoals: (a.professionalGoals || '').trim().slice(0, 3000),
        businessInformation: (a.businessInformation || '').trim().slice(0, 3000),
        customInstructions: (a.customInstructions || '').trim().slice(0, 3000),
        additionalInformation: (a.additionalInformation || '').trim().slice(0, 3000),
        updatedAt: now,
      };

      await setDoc(doc(db, 'site_profile', 'main'), profilePayload);
      await setDoc(doc(db, 'site_about', 'main'), aboutPayload);

      // Verify server write succeeded
      const verifiedSnap = await getDocFromServer(doc(db, 'site_profile', 'main'));
      if (!verifiedSnap.exists()) {
        throw new Error('Server verification failed after saving site_profile/main.');
      }

      await invalidateAiCacheSafe();
      setStatus('Profile & About chapters saved and published live.');
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'site_profile_about');
      } catch {
        setError('Unable to save profile & about sections. Verify admin sign-in and field limits.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Profile &amp; About Chapters</h2>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 shrink-0"
          style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {status && <SuccessBanner text={status} />}
      {error && <ErrorBanner text={error} />}

      <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Owner Full Name" value={p.ownerName} onChange={(v) => setP({ ...p, ownerName: v })} />
          <Input label="Professional Title" value={p.professionalTitle} onChange={(v) => setP({ ...p, professionalTitle: v })} />
          <Input label="Venture / Studio Name" value={p.ventureName} onChange={(v) => setP({ ...p, ventureName: v })} />
          <Input label="Location" value={p.location} onChange={(v) => setP({ ...p, location: v })} />
          <Input label="Availability Status" value={p.availabilityStatus} onChange={(v) => setP({ ...p, availabilityStatus: v })} />
          <Input label="Years Experience (Optional)" value={p.yearsExperience} onChange={(v) => setP({ ...p, yearsExperience: v })} placeholder="Leave blank if not published" />
          <Input label="Projects Delivered (Optional)" value={p.projectsDelivered} onChange={(v) => setP({ ...p, projectsDelivered: v })} placeholder="Leave blank if not published" />
          <Input label="Client Continuity (Optional)" value={p.clientSatisfaction} onChange={(v) => setP({ ...p, clientSatisfaction: v })} placeholder="Leave blank if not published" />
        </div>
        <Input label="Italic Tagline" value={p.tagline} onChange={(v) => setP({ ...p, tagline: v })} />
        <Area label="Hero Short Intro" value={p.shortIntro} onChange={(v) => setP({ ...p, shortIntro: v })} rows={3} />
        <MediaUploadField label="Hero Portrait Image" value={p.heroImageUrl} onChange={(v) => setP({ ...p, heroImageUrl: v })} folder="profiles" />
      </div>

      <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <h3 className="font-display text-lg font-semibold">About Page Chapters</h3>
        <Area label="01. Professional Biography & Introduction" value={a.personalIntroduction} onChange={(v) => setA({ ...a, personalIntroduction: v })} rows={4} />
        <Area label="02. Brand Philosophy & Journey" value={a.myJourney} onChange={(v) => setA({ ...a, myJourney: v })} rows={4} />
        <Area label="03. Marketing & Design Craft" value={a.businessOrTechBackground} onChange={(v) => setA({ ...a, businessOrTechBackground: v })} rows={3} />
        <Area label="04. Value Proposition & Practice" value={a.entrepreneurship} onChange={(v) => setA({ ...a, entrepreneurship: v })} rows={3} />
        <Area label="05. Education & Qualifications" value={a.education} onChange={(v) => setA({ ...a, education: v })} rows={3} />
        <Area label="06. Professional Goals" value={a.professionalGoals} onChange={(v) => setA({ ...a, professionalGoals: v })} rows={3} />
        <Area label="07. Business Information" value={a.businessInformation || ''} onChange={(v) => setA({ ...a, businessInformation: v })} rows={3} />
        <Area label="08. Project & Pricing Notes" value={a.customInstructions || ''} onChange={(v) => setA({ ...a, customInstructions: v })} rows={3} />
        <Area label="09. Additional Information" value={a.additionalInformation || ''} onChange={(v) => setA({ ...a, additionalInformation: v })} rows={3} />
      </div>

      {status && <SuccessBanner text={status} />}
      {error && <ErrorBanner text={error} />}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
}

export function AdminGalleryEditor() {
  const { gallery, isFirestoreSeeded, ensureStarterSeeded, loadDemoPortfolioItems, theme } = useApp();
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setError(null);
    setNotice(null);
    setEditing({
      title: '',
      category: 'Branding & Visual Design',
      description: '',
      imageUrl: '',
      externalUrl: '',
      featured: true,
      order: 1,
    });
  };

  const handleLoadDemos = async () => {
    setLoadingDemos(true);
    setError(null);
    setNotice(null);
    try {
      await loadDemoPortfolioItems();
      setNotice('Demo portfolio showcase works loaded into Cloud Firestore.');
      setTimeout(() => setNotice(null), 4500);
    } catch {
      setError('Unable to load demo showcase works.');
    } finally {
      setLoadingDemos(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title?.trim() || !editing.imageUrl?.trim()) {
      setError('Please add both a Title and an Artwork Image before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const now = serverTimestamp();
      const payload = {
        title: editing.title.trim().slice(0, 140),
        category: (editing.category || 'Design').trim().slice(0, 80) || 'Design',
        description: (editing.description || '').trim().slice(0, 1200),
        imageUrl: editing.imageUrl.trim().slice(0, 1000),
        externalUrl: (editing.externalUrl || '').trim().slice(0, 1000),
        featured: Boolean(editing.featured),
        order: Number(editing.order ?? 1),
        updatedAt: now,
      };
      if (editing.id && isStarterId(editing.id) && !isFirestoreSeeded) {
        await ensureStarterSeeded();
        await setDoc(doc(db, 'gallery', editing.id), { ...payload, createdAt: now });
      } else if (editing.id) {
        await updateDoc(doc(db, 'gallery', editing.id), payload);
      } else {
        await addDoc(collection(db, 'gallery'), { ...payload, createdAt: now });
      }
      await invalidateAiCacheSafe();
      setEditing(null);
      setNotice('Portfolio item saved and published live on the website.');
      setTimeout(() => setNotice(null), 4500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'gallery');
      } catch {
        setError('Unable to save portfolio item. Verify admin authentication and field values.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setNotice(null);
    try {
      if (!isFirestoreSeeded && isStarterId(id)) {
        await ensureStarterSeeded(id);
        setNotice('Item removed from showcase.');
        return;
      }
      await deleteDoc(doc(db, 'gallery', id));
      await invalidateAiCacheSafe();
      setNotice('Portfolio item removed.');
      setTimeout(() => setNotice(null), 3500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
      } catch {
        setError('Unable to delete portfolio item.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Portfolio Gallery</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loadingDemos}
            onClick={() => void handleLoadDemos()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingDemos ? 'Loading...' : 'Load Demo Works'}</span>
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Work</span>
          </button>
        </div>
      </div>

      {notice && <SuccessBanner text={notice} />}
      {error && <ErrorBanner text={error} />}

      {editing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title *" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} required />
            <Input label="Category *" value={editing.category || ''} onChange={(v) => setEditing({ ...editing, category: v })} required />
          </div>
          <MediaUploadField label="Artwork Image *" value={editing.imageUrl || ''} onChange={(v) => setEditing({ ...editing, imageUrl: v })} folder="gallery" />
          <Area label="Description" value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input label="External Link (Optional)" value={editing.externalUrl || ''} onChange={(v) => setEditing({ ...editing, externalUrl: v })} />
            <Input label="Display Order" type="number" value={String(editing.order ?? 1)} onChange={(v) => setEditing({ ...editing, order: Number(v) })} />
            <label className="flex items-center gap-2 text-sm py-2.5 cursor-pointer">
              <input type="checkbox" checked={Boolean(editing.featured)} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              <span>Featured on Home Bento</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
              {saving ? 'Saving...' : 'Save Item'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {gallery.length === 0 ? (
        <div className="p-8 rounded-2xl border text-center text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          No portfolio items added yet. Public page currently displays “Portfolio Coming Soon”.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="rounded-xl border overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <div className="h-40">
                <ResilientImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" aspectClass="w-full h-full" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.category}</div>
                  <div className="font-display font-semibold">{item.title}</div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <button type="button" onClick={() => setEditing(item)} className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(item.id)} className="inline-flex items-center gap-1 cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminProjectsEditor() {
  const { projects, isFirestoreSeeded, ensureStarterSeeded, loadDemoPortfolioItems, theme } = useApp();
  const [editing, setEditing] = useState<Partial<ProjectItem> | null>(null);
  const [techInput, setTechInput] = useState('');
  const [newShotUrl, setNewShotUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openEdit = (proj?: ProjectItem) => {
    setError(null);
    setNotice(null);
    if (proj) {
      setEditing(proj);
      setTechInput((proj.techStack || []).join(', '));
    } else {
      setEditing({
        title: '',
        client: '',
        status: 'Published',
        problem: '',
        solution: '',
        techStack: [],
        screenshots: [],
        liveUrl: '',
        repoUrl: '',
        featured: true,
        order: 1,
      });
      setTechInput('');
    }
    setNewShotUrl('');
  };

  const handleLoadDemos = async () => {
    setLoadingDemos(true);
    setError(null);
    setNotice(null);
    try {
      await loadDemoPortfolioItems();
      setNotice('Demo showcase case studies loaded into Cloud Firestore.');
      setTimeout(() => setNotice(null), 4500);
    } catch {
      setError('Unable to load demo case studies.');
    } finally {
      setLoadingDemos(false);
    }
  };

  const addScreenshot = (url: string) => {
    const trimmed = url.trim().slice(0, 1000);
    if (!trimmed || !editing) return;
    const list = editing.screenshots || [];
    if (list.length >= 8) return;
    if (list.includes(trimmed)) {
      setNewShotUrl('');
      return;
    }
    setEditing({ ...editing, screenshots: [...list, trimmed] });
    setNewShotUrl('');
  };

  const removeScreenshot = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, screenshots: (editing.screenshots || []).filter((_, i) => i !== idx) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title?.trim()) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const now = serverTimestamp();
      const stack = techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);

      const payload = {
        title: editing.title.trim().slice(0, 160),
        client: (editing.client || '').trim().slice(0, 120),
        status: (editing.status || 'Published') as ProjectStatus,
        problem: (editing.problem || '').trim().slice(0, 2000) || 'Project overview.',
        solution: (editing.solution || '').trim().slice(0, 2500) || 'Delivered solution.',
        techStack: stack,
        screenshots: (editing.screenshots || []).slice(0, 8),
        liveUrl: (editing.liveUrl || '').trim().slice(0, 1000),
        repoUrl: (editing.repoUrl || '').trim().slice(0, 1000),
        featured: Boolean(editing.featured),
        order: Number(editing.order ?? 1),
        updatedAt: now,
      };
      if (editing.id && isStarterId(editing.id) && !isFirestoreSeeded) {
        await ensureStarterSeeded();
        await setDoc(doc(db, 'projects', editing.id), { ...payload, createdAt: now });
      } else if (editing.id) {
        await updateDoc(doc(db, 'projects', editing.id), payload);
      } else {
        await addDoc(collection(db, 'projects'), { ...payload, createdAt: now });
      }
      await invalidateAiCacheSafe();
      setEditing(null);
      setNotice('Project case study saved and published live.');
      setTimeout(() => setNotice(null), 4500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'projects');
      } catch {
        setError('Unable to save project case study. Check required fields and admin permissions.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setNotice(null);
    try {
      if (!isFirestoreSeeded && isStarterId(id)) {
        await ensureStarterSeeded(id);
        setNotice('Project removed.');
        return;
      }
      await deleteDoc(doc(db, 'projects', id));
      await invalidateAiCacheSafe();
      setNotice('Project removed.');
      setTimeout(() => setNotice(null), 3500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      } catch {
        setError('Unable to delete project.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Projects &amp; Case Studies</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loadingDemos}
            onClick={() => void handleLoadDemos()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingDemos ? 'Loading...' : 'Load Demo Case Studies'}</span>
          </button>
          <button
            type="button"
            onClick={() => openEdit()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {notice && <SuccessBanner text={notice} />}
      {error && <ErrorBanner text={error} />}

      {editing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Project Title *" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} required />
            <Input label="Client Name" value={editing.client || ''} onChange={(v) => setEditing({ ...editing, client: v })} />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Status</label>
              <select
                value={editing.status || 'Published'}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as ProjectStatus })}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="Published">Published</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <Area label="Problem / Challenge *" value={editing.problem || ''} onChange={(v) => setEditing({ ...editing, problem: v })} rows={3} required />
          <Area label="Delivered Solution *" value={editing.solution || ''} onChange={(v) => setEditing({ ...editing, solution: v })} rows={3} required />
          <Input label="Tools & Disciplines (comma separated, max 12)" value={techInput} onChange={setTechInput} placeholder="SEO, Meta Ads, Figma" />

          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <MediaUploadField
              label="Multi-Screenshot Uploader (max 8)"
              value={newShotUrl}
              onChange={setNewShotUrl}
              onUploaded={(url) => addScreenshot(url)}
              folder="projects"
            />
            {newShotUrl.trim() && (
              <button type="button" onClick={() => addScreenshot(newShotUrl)} className="text-xs font-medium underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>
                Add URL to screenshots
              </button>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              {(editing.screenshots || []).map((s, idx) => (
                <div key={idx} className="relative w-24 h-16 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                  <img src={s} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(idx)}
                    className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Live URL" value={editing.liveUrl || ''} onChange={(v) => setEditing({ ...editing, liveUrl: v })} />
            <Input label="Repository / Reference URL" value={editing.repoUrl || ''} onChange={(v) => setEditing({ ...editing, repoUrl: v })} />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
              {saving ? 'Saving...' : 'Save Project'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="p-8 rounded-2xl border text-center text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          No projects added yet. Public Projects page currently displays “Portfolio Coming Soon”.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.client || 'ARPHANIX'} · {p.status}</div>
                <div className="font-display text-lg font-semibold">{p.title}</div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <button type="button" onClick={() => openEdit(p)} className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(p.id)}
                  className="inline-flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--accent-highlight)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminSkillsEditor() {
  const { skills, isFirestoreSeeded, theme } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Digital Marketing');
  const [proficiency, setProficiency] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      const now = serverTimestamp();
      await addDoc(collection(db, 'skills'), {
        name: name.trim(),
        category: category.trim() || 'General',
        proficiency: proficiency.trim(),
        order: skills.length + 1,
        createdAt: now,
        updatedAt: now,
      });
      await invalidateAiCacheSafe();
      setName('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'skills');
      } catch {
        setError('Unable to add skill. Ensure you are signed in as verified Admin.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (!isFirestoreSeeded && isStarterId(id)) {
      setError('Starter skills are currently loaded from template defaults. Click “Initialize / Re-Sync Defaults to Firestore” in Overview first to manage them.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'skills', id));
      await invalidateAiCacheSafe();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `skills/${id}`);
      } catch {
        setError('Unable to delete skill.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        Skills &amp; Capabilities
      </h2>

      {error && <ErrorBanner text={error} />}

      <form onSubmit={handleAdd} className="p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-4 gap-3 items-end" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Input label="Skill Name *" value={name} onChange={setName} required />
        <Input label="Category *" value={category} onChange={setCategory} required />
        <Input label="Label (Optional)" value={proficiency} onChange={setProficiency} placeholder="Leave blank if unrated" />
        <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
          Add Skill
        </button>
      </form>

      <div className="divide-y rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        {skills.map((sk: SkillItem) => (
          <div key={sk.id} className="px-4 py-3 flex items-center justify-between gap-4 text-sm" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <span className="font-medium">{sk.name}</span>
              <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>· {sk.category} {sk.proficiency ? `(${sk.proficiency})` : ''}</span>
            </div>
            <button type="button" onClick={() => void handleDelete(sk.id)} className="text-xs cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminExperienceEditor() {
  const { experience, isFirestoreSeeded, theme } = useApp();
  const [editing, setEditing] = useState<Partial<ExperienceItem> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.role?.trim() || !editing?.organization?.trim()) return;
    setError(null);
    try {
      const now = serverTimestamp();
      const payload = {
        type: (editing.type || 'work') as 'work' | 'education',
        role: editing.role.trim(),
        organization: editing.organization.trim(),
        period: (editing.period || 'Present').trim(),
        location: (editing.location || '').trim(),
        summary: (editing.summary || '').trim(),
        order: Number(editing.order || experience.length + 1),
        updatedAt: now,
      };
      if (editing.id && !isStarterId(editing.id)) {
        await updateDoc(doc(db, 'experience', editing.id), payload);
      } else {
        await addDoc(collection(db, 'experience'), { ...payload, createdAt: now });
      }
      await invalidateAiCacheSafe();
      setEditing(null);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'experience');
      } catch {
        setError('Unable to save experience/education entry.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (!isFirestoreSeeded && isStarterId(id)) {
      setError('Starter entries are loaded from template defaults. Initialize Defaults from Overview first to edit or delete them in Firestore.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'experience', id));
      await invalidateAiCacheSafe();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `experience/${id}`);
      } catch {
        setError('Unable to delete entry.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Experience &amp; Education</h2>
        <button
          type="button"
          onClick={() => setEditing({ type: 'work', role: '', organization: '', period: '', location: '', summary: '', order: experience.length + 1 })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </button>
      </div>

      {error && <ErrorBanner text={error} />}

      {editing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Type</label>
              <select
                value={editing.type || 'work'}
                onChange={(e) => setEditing({ ...editing, type: e.target.value as 'work' | 'education' })}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
                style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="work">Work Experience</option>
                <option value="education">Education</option>
              </select>
            </div>
            <Input label="Role / Degree *" value={editing.role || ''} onChange={(v) => setEditing({ ...editing, role: v })} required />
            <Input label="Organization / Department *" value={editing.organization || ''} onChange={(v) => setEditing({ ...editing, organization: v })} required />
            <Input label="Period *" value={editing.period || ''} onChange={(v) => setEditing({ ...editing, period: v })} placeholder="In Progress / Completed" required />
            <Input label="Location" value={editing.location || ''} onChange={(v) => setEditing({ ...editing, location: v })} />
            <Input label="Order" type="number" value={String(editing.order ?? 1)} onChange={(v) => setEditing({ ...editing, order: Number(v) })} />
          </div>
          <Area label="Summary" value={editing.summary || ''} onChange={(v) => setEditing({ ...editing, summary: v })} rows={3} />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>Save Entry</button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {experience.map((ex) => (
          <div key={ex.id} className="p-4 rounded-xl border flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="text-xs font-mono-tabular" style={{ color: 'var(--text-muted)' }}>{ex.type.toUpperCase()} · {ex.period}</div>
              <div className="font-display font-semibold">{ex.role} — {ex.organization}</div>
            </div>
            <div className="flex gap-3 text-xs">
              <button type="button" onClick={() => setEditing(ex)} className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>Edit</button>
              <button type="button" onClick={() => void handleDelete(ex.id)} className="cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminServicesEditor() {
  const { services, isFirestoreSeeded, theme } = useApp();
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openEdit = (svc?: ServiceItem) => {
    setError(null);
    if (svc) {
      setEditing(svc);
      setFeaturesText((svc.features || []).join('\n'));
    } else {
      setEditing({ title: '', category: 'Digital Marketing', summary: '', features: [], startingPrice: '', imageUrl: '', order: services.length + 1 });
      setFeaturesText('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title?.trim() || !editing?.summary?.trim()) return;
    setError(null);
    try {
      const now = serverTimestamp();
      const features = featuresText.split('\n').map((f) => f.trim()).filter(Boolean).slice(0, 10);
      const payload = {
        title: editing.title.trim(),
        category: (editing.category || '').trim(),
        summary: editing.summary.trim(),
        features,
        startingPrice: (editing.startingPrice || '').trim(),
        imageUrl: (editing.imageUrl || '').trim(),
        order: Number(editing.order || 1),
        updatedAt: now,
      };
      if (editing.id && !isStarterId(editing.id)) {
        await updateDoc(doc(db, 'services', editing.id), payload);
      } else {
        await addDoc(collection(db, 'services'), { ...payload, createdAt: now });
      }
      await invalidateAiCacheSafe();
      setEditing(null);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'services');
      } catch {
        setError('Unable to save service.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (!isFirestoreSeeded && isStarterId(id)) {
      setError('Starter services are loaded from template defaults. Initialize Defaults from Overview first.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'services', id));
      await invalidateAiCacheSafe();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      } catch {
        setError('Unable to delete service.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Services Catalog</h2>
        <button
          type="button"
          onClick={() => openEdit()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {error && <ErrorBanner text={error} />}

      {editing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Service Title *" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} required />
            <Input label="Category" value={editing.category || ''} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="Digital Marketing" />
            <Input label="Pricing Note (Optional)" value={editing.startingPrice || ''} onChange={(v) => setEditing({ ...editing, startingPrice: v })} placeholder="Custom quote based on requirements" />
          </div>
          <Area label="Summary *" value={editing.summary || ''} onChange={(v) => setEditing({ ...editing, summary: v })} rows={3} required />
          <Area label="Deliverables Checklist (one per line, max 10)" value={featuresText} onChange={setFeaturesText} rows={4} />
          <MediaUploadField label="Service Image (Optional)" value={editing.imageUrl || ''} onChange={(v) => setEditing({ ...editing, imageUrl: v })} folder="services" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>Save Service</button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="p-4 rounded-xl border flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="text-xs font-mono-tabular" style={{ color: 'var(--accent-secondary)' }}>
                {s.category || 'Service'}
              </div>
              <div className="font-display font-semibold">{s.title}</div>
            </div>
            <div className="flex gap-3 text-xs">
              <button type="button" onClick={() => openEdit(s)} className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>Edit</button>
              <button type="button" onClick={() => void handleDelete(s.id)} className="cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminFaqEditor() {
  const { faqs, isFirestoreSeeded, theme } = useApp();
  const [editing, setEditing] = useState<Partial<FaqItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (item?: FaqItem) => {
    setError(null);
    if (item) {
      setEditing(item);
    } else {
      setEditing({
        question: '',
        answer: '',
        category: 'General',
        order: faqs.length + 1,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.question?.trim() || !editing?.answer?.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const now = serverTimestamp();
      const payload = {
        question: editing.question.trim().slice(0, 300),
        answer: editing.answer.trim().slice(0, 2000),
        category: (editing.category || 'General').trim().slice(0, 80),
        order: Number(editing.order || faqs.length + 1),
        updatedAt: now,
      };
      if (editing.id && !isStarterId(editing.id)) {
        await updateDoc(doc(db, 'faqs', editing.id), payload);
      } else {
        await addDoc(collection(db, 'faqs'), { ...payload, createdAt: now });
      }
      await invalidateAiCacheSafe();
      setEditing(null);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'faqs');
      } catch {
        setError('Unable to save FAQ entry.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (!isFirestoreSeeded && isStarterId(id)) {
      setError('Starter FAQs are loaded from template defaults. Initialize Defaults from Overview first.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'faqs', id));
      await invalidateAiCacheSafe();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`);
      } catch {
        setError('Unable to delete FAQ.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Frequently Asked Questions</h2>
        <button
          type="button"
          onClick={() => openEdit()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {error && <ErrorBanner text={error} />}

      {editing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input label="Question *" value={editing.question || ''} onChange={(v) => setEditing({ ...editing, question: v })} required />
            </div>
            <Input label="Category *" value={editing.category || ''} onChange={(v) => setEditing({ ...editing, category: v })} required />
          </div>
          <Area label="Answer *" value={editing.answer || ''} onChange={(v) => setEditing({ ...editing, answer: v })} rows={4} required />
          <div className="max-w-[160px]">
            <Input label="Display Order" type="number" value={String(editing.order ?? 1)} onChange={(v) => setEditing({ ...editing, order: Number(v) })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
              {saving ? 'Saving...' : 'Save FAQ'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {faqs.map((item) => (
          <div key={item.id} className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-mono-tabular" style={{ color: 'var(--accent-secondary)' }}>{item.category}</div>
              <div className="font-display font-semibold">{item.question}</div>
              <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.answer}</p>
            </div>
            <div className="flex gap-3 text-xs shrink-0">
              <button type="button" onClick={() => openEdit(item)} className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>Edit</button>
              <button type="button" onClick={() => void handleDelete(item.id)} className="cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAchievementsCvEditor() {
  const { achievements, settings, isFirestoreSeeded, theme } = useApp();
  const [editing, setEditing] = useState<Partial<AchievementItem> | null>(null);
  const [cvUrl, setCvUrl] = useState(settings.cvUrl);
  const [cvFileName, setCvFileName] = useState(settings.cvFileName);
  const [cvSaved, setCvSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCvUrl(settings.cvUrl);
    setCvFileName(settings.cvFileName);
  }, [settings]);

  const handleSaveCv = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await setDoc(doc(db, 'site_settings', 'main'), {
        ...settings,
        cvUrl: cvUrl.trim(),
        cvFileName: cvFileName.trim() || 'ARPHANIX-Profile.pdf',
        updatedAt: serverTimestamp(),
      });
      setCvSaved(true);
      setTimeout(() => setCvSaved(false), 3000);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
      } catch {
        setError('Unable to save CV settings.');
      }
    }
  };

  const handleSaveAch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title?.trim() || !editing?.issuer?.trim()) return;
    setError(null);
    try {
      const now = serverTimestamp();
      const payload = {
        title: editing.title.trim(),
        issuer: editing.issuer.trim(),
        year: (editing.year || String(new Date().getFullYear())).trim(),
        description: (editing.description || '').trim(),
        certificateUrl: (editing.certificateUrl || '').trim(),
        imageUrl: (editing.imageUrl || '').trim(),
        order: Number(editing.order || achievements.length + 1),
        updatedAt: now,
      };
      if (editing.id && !isStarterId(editing.id)) {
        await updateDoc(doc(db, 'achievements', editing.id), payload);
      } else {
        await addDoc(collection(db, 'achievements'), { ...payload, createdAt: now });
      }
      await invalidateAiCacheSafe();
      setEditing(null);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'achievements');
      } catch {
        setError('Unable to save achievement.');
      }
    }
  };

  const handleDeleteAch = async (id: string) => {
    setError(null);
    if (!isFirestoreSeeded && isStarterId(id)) {
      setError('Starter items are not yet saved in Firestore. Initialize Defaults first.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'achievements', id));
      await invalidateAiCacheSafe();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `achievements/${id}`);
      } catch {
        setError('Unable to delete achievement.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {error && <ErrorBanner text={error} />}

      <form onSubmit={handleSaveCv} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-xl font-semibold">Public CV / Dossier PDF</h2>
        <MediaUploadField
          label="CV PDF Upload (Cloudinary / Firebase Storage)"
          value={cvUrl}
          onChange={setCvUrl}
          accept="application/pdf"
          folder="documents"
        />
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input label="Display File Name" value={cvFileName} onChange={setCvFileName} />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer shrink-0" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
            {cvSaved ? 'Saved CV!' : 'Save CV Link'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Achievements &amp; Certifications</h2>
          <button
            type="button"
            onClick={() => setEditing({ title: '', issuer: '', year: String(new Date().getFullYear()), description: '', certificateUrl: '', imageUrl: '', order: achievements.length + 1 })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential</span>
          </button>
        </div>

        {editing && (
          <form onSubmit={handleSaveAch} className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Title *" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} required />
              <Input label="Issuer *" value={editing.issuer || ''} onChange={(v) => setEditing({ ...editing, issuer: v })} required />
              <Input label="Year *" value={editing.year || ''} onChange={(v) => setEditing({ ...editing, year: v })} required />
            </div>
            <Area label="Description" value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} rows={2} />
            <MediaUploadField label="Certificate Image (Optional)" value={editing.imageUrl || ''} onChange={(v) => setEditing({ ...editing, imageUrl: v })} folder="certificates" />
            <Input label="Verification URL (Optional)" value={editing.certificateUrl || ''} onChange={(v) => setEditing({ ...editing, certificateUrl: v })} />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>Save Credential</button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
            </div>
          </form>
        )}

        {achievements.length === 0 ? (
          <div className="p-6 rounded-xl border text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            No awards or external accolades currently listed.
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div key={ach.id} className="p-4 rounded-xl border flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="text-xs font-mono-tabular" style={{ color: 'var(--text-muted)' }}>{ach.issuer} · {ach.year}</div>
                  <div className="font-display font-semibold">{ach.title}</div>
                </div>
                <div className="flex gap-3 text-xs">
                  <button type="button" onClick={() => setEditing(ach)} className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>Edit</button>
                  <button type="button" onClick={() => void handleDeleteAch(ach.id)} className="cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminMessagesInbox() {
  const { messages, theme } = useApp();
  const [filter, setFilter] = useState<'all' | MessageStatus>('all');
  const [error, setError] = useState<string | null>(null);

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);

  const setStatus = async (id: string, status: MessageStatus) => {
    setError(null);
    try {
      await updateDoc(doc(db, 'messages', id), { status, updatedAt: serverTimestamp() });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
      } catch {
        setError('Unable to update inquiry status.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
      } catch {
        setError('Unable to delete inquiry.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Contact Inquiries</h2>
        <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          {(['all', 'unread', 'read', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize cursor-pointer"
              style={{
                backgroundColor: filter === tab ? 'var(--accent-primary)' : 'transparent',
                color: filter === tab ? (theme === 'dark' ? '#0A120F' : '#FAF8F3') : 'var(--text-muted)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner text={error} />}

      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl border text-center text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          No inquiries in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <div key={msg.id} className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg font-semibold">{msg.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {msg.email}{msg.whatsapp ? ` · WhatsApp: ${msg.whatsapp}` : ''} · {msg.projectType} {msg.budgetRange ? `(${msg.budgetRange})` : ''}
                  </div>
                </div>
                <span className="font-mono-tabular text-xs uppercase" style={{ color: msg.status === 'unread' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {msg.status}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.description}</p>
              <div className="flex flex-wrap gap-3 pt-2 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
                {msg.status !== 'read' && (
                  <button type="button" onClick={() => void setStatus(msg.id, 'read')} className="hover:underline cursor-pointer" style={{ color: 'var(--accent-primary)' }}>
                    Mark Read
                  </button>
                )}
                {msg.status !== 'archived' && (
                  <button type="button" onClick={() => void setStatus(msg.id, 'archived')} className="hover:underline cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    Archive
                  </button>
                )}
                <button type="button" onClick={() => void handleDelete(msg.id)} className="hover:underline cursor-pointer" style={{ color: 'var(--accent-highlight)' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminSeoSettingsEditor() {
  const { settings, isFirestoreSeeded, ensureStarterSeeded, theme } = useApp();
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle);
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription);
  const [seoOgImage, setSeoOgImage] = useState(settings.seoOgImage);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSeoTitle(settings.seoTitle);
    setSeoDescription(settings.seoDescription);
    setSeoOgImage(settings.seoOgImage);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!isFirestoreSeeded) {
        await ensureStarterSeeded();
      }
      await setDoc(doc(db, 'site_settings', 'main'), {
        brandName: (settings.brandName || 'ARPHANIX').trim().slice(0, 100),
        logoUrl: (settings.logoUrl || '').trim().slice(0, 1000),
        coverImageUrl: (settings.coverImageUrl || '').trim().slice(0, 1000),
        contactEmail: (settings.contactEmail || '').trim().slice(0, 160),
        whatsappNumber: (settings.whatsappNumber || '').trim().slice(0, 40),
        cvUrl: (settings.cvUrl || '').trim().slice(0, 1000),
        cvFileName: (settings.cvFileName || '').trim().slice(0, 160),
        cloudinaryCloudName: (settings.cloudinaryCloudName || '').trim().slice(0, 120),
        cloudinaryUploadPreset: (settings.cloudinaryUploadPreset || '').trim().slice(0, 120),
        seoTitle: seoTitle.trim().slice(0, 160),
        seoDescription: seoDescription.trim().slice(0, 320),
        seoOgImage: seoOgImage.trim().slice(0, 1000),
        socialLinks: settings.socialLinks || {},
        ...(settings.themeColors ? { themeColors: settings.themeColors } : {}),
        ...(settings.navLabels ? { navLabels: settings.navLabels } : {}),
        ...(settings.footerInfo ? { footerInfo: settings.footerInfo } : {}),
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
      } catch {
        setError('Unable to save SEO metadata.');
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">SEO &amp; Social Share Metadata</h2>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
          {saved ? 'Saved!' : 'Save SEO'}
        </button>
      </div>
      {error && <ErrorBanner text={error} />}
      <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Input label="Default Meta Title" value={seoTitle} onChange={setSeoTitle} />
        <Area label="Meta Description" value={seoDescription} onChange={setSeoDescription} rows={3} />
        <MediaUploadField label="OpenGraph Social Preview Image" value={seoOgImage} onChange={setSeoOgImage} folder="seo" />
      </div>
    </form>
  );
}

export function AdminWebsiteCloudinaryEditor() {
  const {
    profile,
    about,
    settings,
    aiKnowledge,
    gallery,
    projects,
    skills,
    experience,
    achievements,
    services,
    faqs,
    isFirestoreSeeded,
    ensureStarterSeeded,
    theme,
  } = useApp();

  const [cloudName, setCloudName] = useState(settings.cloudinaryCloudName);
  const [uploadPreset, setUploadPreset] = useState(settings.cloudinaryUploadPreset);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCloudName(settings.cloudinaryCloudName);
    setUploadPreset(settings.cloudinaryUploadPreset);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!isFirestoreSeeded) {
        await ensureStarterSeeded();
      }
      await setDoc(doc(db, 'site_settings', 'main'), {
        brandName: (settings.brandName || 'ARPHANIX').trim().slice(0, 100),
        logoUrl: (settings.logoUrl || '').trim().slice(0, 1000),
        coverImageUrl: (settings.coverImageUrl || '').trim().slice(0, 1000),
        contactEmail: (settings.contactEmail || '').trim().slice(0, 160),
        whatsappNumber: (settings.whatsappNumber || '').trim().slice(0, 40),
        cvUrl: (settings.cvUrl || '').trim().slice(0, 1000),
        cvFileName: (settings.cvFileName || '').trim().slice(0, 160),
        cloudinaryCloudName: cloudName.trim().slice(0, 120),
        cloudinaryUploadPreset: uploadPreset.trim().slice(0, 120),
        seoTitle: (settings.seoTitle || '').trim().slice(0, 160),
        seoDescription: (settings.seoDescription || '').trim().slice(0, 320),
        seoOgImage: (settings.seoOgImage || '').trim().slice(0, 1000),
        socialLinks: settings.socialLinks || {},
        ...(settings.themeColors ? { themeColors: settings.themeColors } : {}),
        ...(settings.navLabels ? { navLabels: settings.navLabels } : {}),
        ...(settings.footerInfo ? { footerInfo: settings.footerInfo } : {}),
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
      } catch {
        setError('Unable to save Cloudinary configuration.');
      }
    }
  };

  const handleTestCloudinary = async () => {
    setTesting(true);
    const res = await testCloudinaryConnection(cloudName, uploadPreset);
    setTestResult(res);
    setTesting(false);
  };

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      profile,
      about,
      settings,
      aiKnowledge,
      gallery,
      projects,
      skills,
      experience,
      achievements,
      services,
      faqs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <h2 className="font-display text-2xl font-semibold">Cloudinary &amp; Backup Settings</h2>
        {error && <ErrorBanner text={error} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Cloudinary Cloud Name" value={cloudName} onChange={setCloudName} placeholder="your-cloud-name" />
          <Input label="Unsigned Upload Preset" value={uploadPreset} onChange={setUploadPreset} placeholder="your_unsigned_preset" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)', color: theme === 'dark' ? '#0A120F' : '#FAF8F3' }}>
            {saved ? 'Saved!' : 'Save Cloudinary Config'}
          </button>
          <button type="button" disabled={testing} onClick={() => void handleTestCloudinary()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer" style={{ borderColor: 'var(--border-strong)' }}>
            <Wifi className="w-4 h-4" />
            <span>{testing ? 'Testing...' : 'Test Cloudinary Connection'}</span>
          </button>
        </div>
        {testResult && (
          <div
            className="p-3 rounded-lg border text-xs"
            style={{
              borderColor: testResult.ok ? 'var(--accent-primary)' : 'var(--accent-highlight)',
              color: testResult.ok ? 'var(--accent-primary)' : 'var(--accent-highlight)',
            }}
          >
            {testResult.message}
          </div>
        )}
      </form>

      <div className="p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h3 className="font-display text-lg font-semibold">One-Click JSON Backup</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Download a portable JSON snapshot of all portfolio content, FAQs, settings, and AI knowledge base.
          </p>
        </div>
        <button type="button" onClick={handleExportJson} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer shrink-0" style={{ borderColor: 'var(--border-strong)' }}>
          <Download className="w-4 h-4" />
          <span>Export Backup JSON</span>
        </button>
      </div>
    </div>
  );
}

function SuccessBanner({ text }: { text: string }) {
  return (
    <div className="p-3 rounded-xl border flex items-center gap-2 text-sm" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}>
      <Check className="w-4 h-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <div className="p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)', backgroundColor: 'var(--bg-surface)' }}>
      {text}
    </div>
  );
}

function Input({
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
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}

function Area({
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
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <textarea
        rows={rows}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}
