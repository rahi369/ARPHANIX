import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  aspectClass?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  aspectClass = '',
}: ResilientImageProps) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setErrored(false);
    setLoaded(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const hasValidSrc = Boolean(src && src.trim().length > 0 && !errored);

  if (!hasValidSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 text-center select-none ${aspectClass} ${className}`}
        style={{
          background:
            'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-page) 60%, var(--border-color) 100%)',
          color: 'var(--text-muted)',
        }}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-6 h-6 mb-2 opacity-60" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-tight max-w-[180px] truncate">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectClass}`}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: 'var(--bg-surface)' }}
          aria-hidden="true"
        />
      )}
      <img
        key={src}
        ref={imgRef}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  );
}
