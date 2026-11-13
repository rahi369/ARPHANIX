import { AppProvider, useApp } from './context/AppContext';
import { clientConfig } from './config/clientConfig';
import { BrandLoadingScreen } from './components/BrandLoadingScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiDrawer } from './components/AiDrawer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { ServicesPage } from './pages/ServicesPage';
import { FaqPage } from './pages/FaqPage';
import { AssistantPage } from './pages/AssistantPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppShell() {
  const { loadingContent, currentPath, isAdmin, authReady } = useApp();

  if (loadingContent) {
    return <BrandLoadingScreen />;
  }

  const cleanPath = currentPath.length > 1 && currentPath.endsWith('/')
    ? currentPath.slice(0, -1)
    : currentPath;

  const isSecretAdminEntry = cleanPath === clientConfig.adminEntryPath;
  const isAdminRoute = cleanPath === '/admin' || cleanPath.startsWith('/admin/');

  const renderPage = () => {
    if (isSecretAdminEntry) return <AdminLoginPage />;
    if (isAdminRoute) {
      if (!authReady) return <BrandLoadingScreen />;
      return isAdmin ? <AdminDashboardPage /> : <NotFoundPage />;
    }

    switch (cleanPath) {
      case '/':
        return <HomePage />;
      case '/about':
        return <AboutPage />;
      case '/gallery':
        return <GalleryPage />;
      case '/projects':
        return <ProjectsPage />;
      case '/skills':
        return <SkillsPage />;
      case '/experience':
        return <ExperiencePage />;
      case '/services':
        return <ServicesPage />;
      case '/faq':
        return <FaqPage />;
      case '/assistant':
        return <AssistantPage />;
      case '/contact':
        return <ContactPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <AiDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
