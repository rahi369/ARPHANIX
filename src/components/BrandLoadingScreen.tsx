import { clientConfig } from '../config/clientConfig';

export function BrandLoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 transition-colors"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
      role="status"
      aria-label="Loading studio portfolio"
    >
      <div className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-5 text-center">
        {clientConfig.brandName}
      </div>
      <div
        className="w-44 h-0.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        <div
          className="h-full w-1/2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        />
      </div>
    </div>
  );
}
