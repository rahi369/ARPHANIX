import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function NotFoundPage() {
  const { navigate, theme } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center space-y-6 animate-editorial-enter">
      <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
        404 · Page Not Found
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
        This page could not be located.
      </h1>
      <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
        The requested route does not exist or requires verified studio authorization.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
}
