import { useEffect, useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { clientConfig } from '../config/clientConfig';

export function AdminLoginPage() {
  const { isAdmin, signInWithGoogle, signInWithEmail, navigate, settings, theme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/overview');
    }
  }, [isAdmin, navigate]);

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate('/admin/overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      navigate('/admin/overview');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Email authentication failed.';
      if (raw.includes('auth/operation-not-allowed')) {
        setError(
          'Email/Password sign-in is not enabled in Firebase Console yet. Enable Email/Password under Authentication > Sign-in method, or use "Continue with Google".'
        );
      } else if (raw.includes('auth/invalid-credential') || raw.includes('auth/user-not-found') || raw.includes('auth/wrong-password')) {
        setError(
          'Invalid email or password, or user not created yet in Firebase Console Authentication > Users. You can also sign in immediately with "Continue with Google".'
        );
      } else {
        setError(raw);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 animate-editorial-enter">
      <div
        className="p-6 sm:p-8 rounded-2xl border space-y-6"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono-tabular" style={{ color: 'var(--accent-secondary)' }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Protected Studio CMS</span>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {settings.brandName} Admin Portal
          </h1>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Sign in with your verified administrator account ({clientConfig.adminEmails.join(' or ')}) to manage portfolio content and the AI knowledge base.
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={handleGoogle}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
          }}
        >
          <LogIn className="w-4 h-4" />
          <span>{busy ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border-color)' }} />
          <span className="px-3 text-xs" style={{ color: 'var(--text-muted)' }}>or email &amp; password</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border-color)' }} />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Verified Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={clientConfig.clientAdminEmail}
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
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            Sign in with Email
          </button>
        </form>
      </div>
    </div>
  );
}
