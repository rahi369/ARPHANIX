import { useState } from 'react';
import {
  Award,
  BookOpen,
  Bot,
  Briefcase,
  Database,
  FolderKanban,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  Settings,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminClientCustomization } from '../components/admin/AdminClientCustomization';
import { AdminAiKnowledgeBase } from '../components/admin/AdminAiKnowledgeBase';
import {
  AdminAchievementsCvEditor,
  AdminExperienceEditor,
  AdminFaqEditor,
  AdminGalleryEditor,
  AdminMessagesInbox,
  AdminProfileAboutEditor,
  AdminProjectsEditor,
  AdminSeoSettingsEditor,
  AdminServicesEditor,
  AdminSkillsEditor,
  AdminWebsiteCloudinaryEditor,
} from '../components/admin/AdminCollectionEditors';

export function AdminDashboardPage() {
  const {
    currentPath,
    navigate,
    user,
    signOutUser,
    settings,
    gallery,
    projects,
    skills,
    experience,
    achievements,
    services,
    faqs,
    unreadCount,
    isFirestoreSeeded,
    seedDefaultsToFirestore,
    theme,
  } = useApp();

  const routeSegment = currentPath.replace(/^\/admin\/?/, '').split('/')[0] || 'overview';
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'customization', label: 'Client Customization', icon: Palette },
    { id: 'ai-knowledge', label: 'AI Knowledge Base', icon: Bot },
    { id: 'profile', label: 'Profile & About', icon: UserCheck },
    { id: 'gallery', label: 'Portfolio Gallery', icon: ImageIcon },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'experience', label: 'Experience & Edu', icon: Briefcase },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'messages', label: `Inquiries${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: Mail },
    { id: 'achievements', label: 'Awards & CV', icon: Award },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'settings', label: 'Cloudinary & Backup', icon: Settings },
  ];

  const selectTab = (tabId: string) => {
    navigate(`/admin/${tabId}`);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      await seedDefaultsToFirestore();
      setSeedMessage('Default template content initialized in Cloud Firestore.');
    } catch (err) {
      setSeedMessage(err instanceof Error ? err.message : 'Failed to initialize Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-editorial-enter">
      {/* Top Admin Header */}
      <div
        className="p-4 sm:p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="min-w-0">
          <div className="text-xs font-mono-tabular" style={{ color: 'var(--accent-secondary)' }}>
            Admin CMS · {settings.brandName}
          </div>
          <div className="text-sm font-medium truncate">
            Signed in as {user?.email}
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-3.5 py-2 rounded-lg border text-xs font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-color)' }}
          >
            View Live Site
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--accent-highlight)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile-First Horizontal Scrollable Tab Bar (Android-friendly) */}
      <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex items-center gap-2 w-max">
          {navItems.map((item) => {
            const active = routeSegment === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs font-medium whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: active ? (theme === 'dark' ? '#0A120F' : '#FAF8F3') : 'var(--text-primary)',
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:block lg:col-span-3 rounded-2xl border p-3 space-y-1 sticky top-28"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          {navItems.map((item) => {
            const active = routeSegment === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                  color: active ? (theme === 'dark' ? '#0A120F' : '#FAF8F3') : 'var(--text-primary)',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Active CMS Panel */}
        <main className="lg:col-span-9 min-w-0">
          {routeSegment === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Gallery Items" value={String(gallery.length)} />
                <StatCard label="Projects" value={String(projects.length)} />
                <StatCard label="Skills & Services" value={`${skills.length} / ${services.length}`} />
                <StatCard label="Unread Inquiries" value={String(unreadCount)} />
              </div>

              <div
                className="p-6 rounded-2xl border space-y-4"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                  <Database className="w-4 h-4" />
                  <span>Firestore Database Status: {isFirestoreSeeded ? 'Seeded & Live' : 'Using Template Defaults'}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Initialize or re-sync baseline template records into Cloud Firestore for this client deployment, or jump directly to Client Customization and the AI Knowledge Base.
                </p>
                {seedMessage && (
                  <div className="p-3 rounded-lg border text-xs" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                    {seedMessage}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={() => void handleSeed()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
                    }}
                  >
                    <Database className="w-4 h-4" />
                    <span>{seeding ? 'Syncing...' : 'Initialize / Re-Sync Defaults to Firestore'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab('customization')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <Palette className="w-4 h-4" />
                    <span>Open Client Customization</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab('ai-knowledge')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Edit AI Knowledge Base</span>
                  </button>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              >
                <div>
                  <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Experience &amp; Edu</div>
                  <div className="font-mono-tabular text-lg" style={{ color: 'var(--text-primary)' }}>{experience.length}</div>
                </div>
                <div>
                  <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Published FAQs</div>
                  <div className="font-mono-tabular text-lg" style={{ color: 'var(--text-primary)' }}>{faqs.length}</div>
                </div>
                <div>
                  <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Published Awards</div>
                  <div className="font-mono-tabular text-lg" style={{ color: 'var(--text-primary)' }}>{achievements.length}</div>
                </div>
                <div>
                  <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>CV PDF Status</div>
                  <div className="font-mono-tabular text-sm" style={{ color: 'var(--text-primary)' }}>{settings.cvUrl ? 'Uploaded' : 'Not set'}</div>
                </div>
              </div>
            </div>
          )}

          {routeSegment === 'customization' && <AdminClientCustomization onNavigateTab={selectTab} />}
          {routeSegment === 'ai-knowledge' && <AdminAiKnowledgeBase />}
          {routeSegment === 'profile' && <AdminProfileAboutEditor />}
          {routeSegment === 'gallery' && <AdminGalleryEditor />}
          {routeSegment === 'projects' && <AdminProjectsEditor />}
          {routeSegment === 'skills' && <AdminSkillsEditor />}
          {routeSegment === 'experience' && <AdminExperienceEditor />}
          {routeSegment === 'services' && <AdminServicesEditor />}
          {routeSegment === 'faqs' && <AdminFaqEditor />}
          {routeSegment === 'messages' && <AdminMessagesInbox />}
          {routeSegment === 'achievements' && <AdminAchievementsCvEditor />}
          {routeSegment === 'seo' && <AdminSeoSettingsEditor />}
          {routeSegment === 'settings' && <AdminWebsiteCloudinaryEditor />}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="font-display text-2xl font-semibold font-mono-tabular">{value}</div>
    </div>
  );
}
