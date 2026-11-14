import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { applySeoMetadata } from '../lib/seo';
import {
  clientConfig,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_AI_KNOWLEDGE_BASE,
  DEFAULT_EXPERIENCE,
  DEFAULT_FAQS,
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_ABOUT,
  DEFAULT_SITE_PROFILE,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SKILLS,
  isAuthorizedAdminEmail,
} from '../config/clientConfig';
import type {
  AchievementItem,
  AiKnowledgeBaseData,
  ContactMessage,
  ExperienceItem,
  FaqItem,
  GalleryItem,
  ProjectItem,
  ServiceItem,
  SiteAbout,
  SiteProfile,
  SiteSettings,
  SkillItem,
} from '../types/portfolio';

type ThemeMode = 'light' | 'dark';

interface AppContextValue {
  currentPath: string;
  navigate: (path: string) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  loadingContent: boolean;
  isFirestoreSeeded: boolean;
  authReady: boolean;
  user: User | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  profile: SiteProfile;
  about: SiteAbout;
  settings: SiteSettings;
  aiKnowledge: AiKnowledgeBaseData;
  gallery: GalleryItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  experience: ExperienceItem[];
  achievements: AchievementItem[];
  services: ServiceItem[];
  faqs: FaqItem[];
  messages: ContactMessage[];
  unreadCount: number;
  isAiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  seedDefaultsToFirestore: () => Promise<void>;
  ensureStarterSeeded: (skipId?: string) => Promise<void>;
  loadDemoPortfolioItems: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const CORE_STREAM_KEYS = [
  'profile',
  'about',
  'settings',
  'aiKnowledge',
  'gallery',
  'projects',
  'skills',
  'experience',
  'achievements',
  'services',
  'faqs',
] as const;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [loadedStreams, setLoadedStreams] = useState<Set<string>>(() => new Set());
  const [safetyTimedOut, setSafetyTimedOut] = useState(false);

  const [profileDoc, setProfileDoc] = useState<SiteProfile | null>(null);
  const [aboutDoc, setAboutDoc] = useState<SiteAbout | null>(null);
  const [settingsDoc, setSettingsDoc] = useState<SiteSettings | null>(null);
  const [aiKnowledgeDoc, setAiKnowledgeDoc] = useState<AiKnowledgeBaseData | null>(null);
  const [galleryDocs, setGalleryDocs] = useState<GalleryItem[]>([]);
  const [projectDocs, setProjectDocs] = useState<ProjectItem[]>([]);
  const [skillDocs, setSkillDocs] = useState<SkillItem[]>([]);
  const [experienceDocs, setExperienceDocs] = useState<ExperienceItem[]>([]);
  const [achievementDocs, setAchievementDocs] = useState<AchievementItem[]>([]);
  const [serviceDocs, setServiceDocs] = useState<ServiceItem[]>([]);
  const [faqDocs, setFaqDocs] = useState<FaqItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isAiDrawerOpen, setAiDrawerOpen] = useState(false);

  const markStreamReady = useCallback((key: string) => {
    setLoadedStreams((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      try {
        localStorage.setItem('studio_theme', next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAdmin = useMemo(() => {
    if (!user || !user.emailVerified || !user.email) return false;
    return isAuthorizedAdminEmail(user.email);
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSafetyTimedOut(true);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'site_profile', 'main'),
        (snap) => {
          setProfileDoc(snap.exists() ? (snap.data() as SiteProfile) : null);
          markStreamReady('profile');
        },
        (error) => {
          markStreamReady('profile');
          console.warn('site_profile stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'site_about', 'main'),
        (snap) => {
          setAboutDoc(snap.exists() ? (snap.data() as SiteAbout) : null);
          markStreamReady('about');
        },
        (error) => {
          markStreamReady('about');
          console.warn('site_about stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'site_settings', 'main'),
        (snap) => {
          setSettingsDoc(snap.exists() ? (snap.data() as SiteSettings) : null);
          markStreamReady('settings');
        },
        (error) => {
          markStreamReady('settings');
          console.warn('site_settings stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'ai_knowledge_base', 'main'),
        (snap) => {
          setAiKnowledgeDoc(snap.exists() ? (snap.data() as AiKnowledgeBaseData) : null);
          markStreamReady('aiKnowledge');
        },
        (error) => {
          markStreamReady('aiKnowledge');
          console.warn('ai_knowledge_base stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'gallery'), orderBy('order', 'asc')),
        (snap) => {
          setGalleryDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) })));
          markStreamReady('gallery');
        },
        (error) => {
          markStreamReady('gallery');
          console.warn('gallery stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'projects'), orderBy('order', 'asc')),
        (snap) => {
          setProjectDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectItem, 'id'>) })));
          markStreamReady('projects');
        },
        (error) => {
          markStreamReady('projects');
          console.warn('projects stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'skills'), orderBy('order', 'asc')),
        (snap) => {
          setSkillDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SkillItem, 'id'>) })));
          markStreamReady('skills');
        },
        (error) => {
          markStreamReady('skills');
          console.warn('skills stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'experience'), orderBy('order', 'asc')),
        (snap) => {
          setExperienceDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ExperienceItem, 'id'>) })));
          markStreamReady('experience');
        },
        (error) => {
          markStreamReady('experience');
          console.warn('experience stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'achievements'), orderBy('order', 'asc')),
        (snap) => {
          setAchievementDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AchievementItem, 'id'>) })));
          markStreamReady('achievements');
        },
        (error) => {
          markStreamReady('achievements');
          console.warn('achievements stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'services'), orderBy('order', 'asc')),
        (snap) => {
          setServiceDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) })));
          markStreamReady('services');
        },
        (error) => {
          markStreamReady('services');
          console.warn('services stream warning:', error.message);
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'faqs'), orderBy('order', 'asc')),
        (snap) => {
          setFaqDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FaqItem, 'id'>) })));
          markStreamReady('faqs');
        },
        (error) => {
          markStreamReady('faqs');
          console.warn('faqs stream warning:', error.message);
        }
      )
    );

    return () => unsubs.forEach((u) => u());
  }, [markStreamReady]);

  useEffect(() => {
    if (!authReady || !isAdmin) {
      setMessages([]);
      return;
    }

    const unsub = onSnapshot(
      query(collection(db, 'messages'), orderBy('createdAt', 'desc')),
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    return () => unsub();
  }, [authReady, isAdmin]);

  const loadingContent = useMemo(() => {
    if (safetyTimedOut) return false;
    return !CORE_STREAM_KEYS.every((key) => loadedStreams.has(key));
  }, [loadedStreams, safetyTimedOut]);

  const isFirestoreSeeded = Boolean(profileDoc || settingsDoc);

  const profile = profileDoc ?? DEFAULT_SITE_PROFILE;
  const about = aboutDoc ?? DEFAULT_SITE_ABOUT;
  const settings = useMemo<SiteSettings>(() => {
    if (!settingsDoc) return DEFAULT_SITE_SETTINGS;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...settingsDoc,
      socialLinks: {
        ...DEFAULT_SITE_SETTINGS.socialLinks,
        ...(settingsDoc.socialLinks || {}),
      },
      themeColors: {
        ...DEFAULT_SITE_SETTINGS.themeColors!,
        ...(settingsDoc.themeColors || {}),
      },
      navLabels: {
        ...DEFAULT_SITE_SETTINGS.navLabels!,
        ...(settingsDoc.navLabels || {}),
      },
      footerInfo: {
        ...DEFAULT_SITE_SETTINGS.footerInfo!,
        ...(settingsDoc.footerInfo || {}),
      },
    };
  }, [settingsDoc]);

  const aiKnowledge = useMemo<AiKnowledgeBaseData>(() => {
    if (!aiKnowledgeDoc) return DEFAULT_AI_KNOWLEDGE_BASE;
    return {
      ...DEFAULT_AI_KNOWLEDGE_BASE,
      ...aiKnowledgeDoc,
    };
  }, [aiKnowledgeDoc]);

  // Apply dynamic client theme colors from Firestore settings immediately
  useEffect(() => {
    if (typeof document === 'undefined' || !settings.themeColors) return;
    const root = document.documentElement;
    const c = settings.themeColors;
    if (theme === 'dark') {
      root.style.setProperty('--accent-primary', c.darkPrimary || '#52A58C');
      root.style.setProperty('--accent-secondary', c.darkSecondary || '#6EC4A7');
      root.style.setProperty('--bg-page', c.darkBg || '#0A120F');
      root.style.setProperty('--bg-surface', c.darkSurface || '#111C17');
    } else {
      root.style.setProperty('--accent-primary', c.lightPrimary || '#1B4332');
      root.style.setProperty('--accent-secondary', c.lightSecondary || '#2D6A6A');
      root.style.setProperty('--bg-page', c.lightBg || '#FAF8F3');
      root.style.setProperty('--bg-surface', c.lightSurface || '#F2EFE7');
    }
  }, [theme, settings.themeColors]);

  // Always show user-saved Firestore docs immediately even if profile/settings aren't seeded yet.
  const gallery = useMemo(() => {
    if (isFirestoreSeeded) return galleryDocs;
    if (galleryDocs.length > 0) {
      const existingIds = new Set(galleryDocs.map((g) => g.id));
      return [...galleryDocs, ...DEFAULT_GALLERY_ITEMS.filter((d) => !existingIds.has(d.id))];
    }
    return DEFAULT_GALLERY_ITEMS;
  }, [isFirestoreSeeded, galleryDocs]);

  const projects = useMemo(() => {
    if (isFirestoreSeeded) return projectDocs;
    if (projectDocs.length > 0) {
      const existingIds = new Set(projectDocs.map((p) => p.id));
      return [...projectDocs, ...DEFAULT_PROJECTS.filter((d) => !existingIds.has(d.id))];
    }
    return DEFAULT_PROJECTS;
  }, [isFirestoreSeeded, projectDocs]);

  const skills = skillDocs.length > 0 ? skillDocs : isFirestoreSeeded ? [] : DEFAULT_SKILLS;
  const experience = experienceDocs.length > 0 ? experienceDocs : isFirestoreSeeded ? [] : DEFAULT_EXPERIENCE;
  const achievements = achievementDocs.length > 0 ? achievementDocs : isFirestoreSeeded ? [] : DEFAULT_ACHIEVEMENTS;
  const services = serviceDocs.length > 0 ? serviceDocs : isFirestoreSeeded ? [] : DEFAULT_SERVICES;
  const faqs = faqDocs.length > 0 ? faqDocs : DEFAULT_FAQS;

  const unreadCount = useMemo(() => messages.filter((m) => m.status === 'unread').length, [messages]);

  useEffect(() => {
    if (loadingContent) return;
    const baseTitle = settings.seoTitle || `${settings.brandName} — ${profile.ownerName}`;
    const routeTitles: Record<string, string> = {
      '/': baseTitle,
      '/about': `About — ${settings.brandName}`,
      '/gallery': `Portfolio — ${settings.brandName}`,
      '/projects': `Case Studies — ${settings.brandName}`,
      '/skills': `Skills — ${settings.brandName}`,
      '/experience': `Education & Experience — ${settings.brandName}`,
      '/services': `Services — ${settings.brandName}`,
      '/faq': `FAQ — ${settings.brandName}`,
      '/assistant': `${aiKnowledge.assistantName} — ${settings.brandName}`,
      '/contact': `Contact — ${settings.brandName}`,
    };
    applySeoMetadata({
      title: routeTitles[currentPath] || baseTitle,
      description: settings.seoDescription || profile.shortIntro,
      siteName: settings.brandName,
      ogImage: settings.seoOgImage || settings.coverImageUrl || profile.heroImageUrl,
      pathname: currentPath,
      ownerName: profile.ownerName,
      jobTitle: profile.professionalTitle,
    });
  }, [loadingContent, currentPath, settings, profile, aiKnowledge.assistantName]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    if (!cred.user.emailVerified || !isAuthorizedAdminEmail(cred.user.email)) {
      await signOut(auth);
      throw new Error('This Google account is not authorized for the Admin CMS.');
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!isAuthorizedAdminEmail(cred.user.email)) {
      await signOut(auth);
      throw new Error('This email is not authorized for the Admin CMS.');
    }
    if (!cred.user.emailVerified) {
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // ignore rate-limit if already sent recently
      }
      await signOut(auth);
      throw new Error(
        'Email is not verified yet. A verification link was sent to your inbox—please verify it first, or use "Continue with Google" for instant access.'
      );
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const ensureStarterSeeded = useCallback(
    async (skipId?: string) => {
      if (!isAdmin || isFirestoreSeeded) return;
      const now = serverTimestamp();
      const batch = writeBatch(db);

      if (!profileDoc) {
        batch.set(doc(db, 'site_profile', 'main'), {
          ...DEFAULT_SITE_PROFILE,
          updatedAt: now,
        });
      }
      if (!aboutDoc) {
        batch.set(doc(db, 'site_about', 'main'), {
          ...DEFAULT_SITE_ABOUT,
          updatedAt: now,
        });
      }
      if (!settingsDoc) {
        batch.set(doc(db, 'site_settings', 'main'), {
          ...DEFAULT_SITE_SETTINGS,
          updatedAt: now,
        });
      }
      if (!aiKnowledgeDoc) {
        batch.set(doc(db, 'ai_knowledge_base', 'main'), {
          ...DEFAULT_AI_KNOWLEDGE_BASE,
          updatedAt: now,
        });
      }

      const existingGalleryIds = new Set(galleryDocs.map((g) => g.id));
      for (const item of DEFAULT_GALLERY_ITEMS) {
        if (item.id === skipId || existingGalleryIds.has(item.id)) continue;
        const { id, ...rest } = item;
        batch.set(doc(db, 'gallery', id), { ...rest, createdAt: now, updatedAt: now });
      }

      const existingProjectIds = new Set(projectDocs.map((p) => p.id));
      for (const item of DEFAULT_PROJECTS) {
        if (item.id === skipId || existingProjectIds.has(item.id)) continue;
        const { id, ...rest } = item;
        batch.set(doc(db, 'projects', id), { ...rest, createdAt: now, updatedAt: now });
      }

      if (skillDocs.length === 0) {
        for (const item of DEFAULT_SKILLS) {
          if (item.id === skipId) continue;
          const { id, ...rest } = item;
          batch.set(doc(db, 'skills', id), { ...rest, createdAt: now, updatedAt: now });
        }
      }
      if (experienceDocs.length === 0) {
        for (const item of DEFAULT_EXPERIENCE) {
          if (item.id === skipId) continue;
          const { id, ...rest } = item;
          batch.set(doc(db, 'experience', id), { ...rest, createdAt: now, updatedAt: now });
        }
      }
      if (achievementDocs.length === 0) {
        for (const item of DEFAULT_ACHIEVEMENTS) {
          if (item.id === skipId) continue;
          const { id, ...rest } = item;
          batch.set(doc(db, 'achievements', id), { ...rest, createdAt: now, updatedAt: now });
        }
      }
      if (serviceDocs.length === 0) {
        for (const item of DEFAULT_SERVICES) {
          if (item.id === skipId) continue;
          const { id, ...rest } = item;
          batch.set(doc(db, 'services', id), { ...rest, createdAt: now, updatedAt: now });
        }
      }
      if (faqDocs.length === 0) {
        for (const item of DEFAULT_FAQS) {
          if (item.id === skipId) continue;
          const { id, ...rest } = item;
          batch.set(doc(db, 'faqs', id), { ...rest, createdAt: now, updatedAt: now });
        }
      }

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'ensure_starter_seeded');
      }
    },
    [
      isAdmin,
      isFirestoreSeeded,
      profileDoc,
      aboutDoc,
      settingsDoc,
      aiKnowledgeDoc,
      galleryDocs,
      projectDocs,
      skillDocs,
      experienceDocs,
      achievementDocs,
      serviceDocs,
      faqDocs,
    ]
  );

  const loadDemoPortfolioItems = useCallback(async () => {
    if (!isAdmin) {
      throw new Error('Verified Admin authentication required.');
    }
    const now = serverTimestamp();
    const batch = writeBatch(db);
    for (const item of DEFAULT_GALLERY_ITEMS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'gallery', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_PROJECTS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'projects', id), { ...rest, createdAt: now, updatedAt: now });
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'demo_portfolio_items');
    }
  }, [isAdmin]);

  const seedDefaultsToFirestore = useCallback(async () => {
    if (!isAdmin) {
      throw new Error('Verified Admin authentication required.');
    }
    const now = serverTimestamp();
    const batch = writeBatch(db);

    batch.set(doc(db, 'site_profile', 'main'), {
      ...DEFAULT_SITE_PROFILE,
      updatedAt: now,
    });
    batch.set(doc(db, 'site_about', 'main'), {
      ...DEFAULT_SITE_ABOUT,
      updatedAt: now,
    });
    batch.set(doc(db, 'site_settings', 'main'), {
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: now,
    });
    batch.set(doc(db, 'ai_knowledge_base', 'main'), {
      ...DEFAULT_AI_KNOWLEDGE_BASE,
      updatedAt: now,
    });

    for (const item of DEFAULT_GALLERY_ITEMS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'gallery', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_PROJECTS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'projects', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_SKILLS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'skills', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_EXPERIENCE) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'experience', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_ACHIEVEMENTS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'achievements', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_SERVICES) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'services', id), { ...rest, createdAt: now, updatedAt: now });
    }
    for (const item of DEFAULT_FAQS) {
      const { id, ...rest } = item;
      batch.set(doc(db, 'faqs', id), { ...rest, createdAt: now, updatedAt: now });
    }

    if (auth.currentUser?.uid && auth.currentUser?.email) {
      try {
        await setDoc(doc(db, 'admins', auth.currentUser.uid), {
          email: auth.currentUser.email,
          role: 'admin',
          createdAt: now,
        });
      } catch {
        // non-fatal if already verified via email allowlist
      }
    }

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seed_defaults');
    }
  }, [isAdmin]);

  const value: AppContextValue = {
    currentPath,
    navigate,
    theme,
    toggleTheme,
    loadingContent,
    isFirestoreSeeded,
    authReady,
    user,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    signOutUser,
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
    messages,
    unreadCount,
    isAiDrawerOpen,
    setAiDrawerOpen,
    seedDefaultsToFirestore,
    ensureStarterSeeded,
    loadDemoPortfolioItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
