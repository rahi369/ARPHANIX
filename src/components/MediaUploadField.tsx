import { useRef, useState } from 'react';
import { RefreshCw, Upload, X } from 'lucide-react';
import { uploadResilientMedia } from '../lib/upload';
import { useApp } from '../context/AppContext';

interface MediaUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUploaded?: (url: string) => void;
  accept?: string;
  folder?: string;
  placeholder?: string;
  helperText?: string;
}

export function MediaUploadField({
  label,
  value,
  onChange,
  onUploaded,
  accept = 'image/png,image/jpeg,image/webp,image/gif',
  folder = 'arphanix',
  placeholder = 'https://...',
  helperText,
}: MediaUploadFieldProps) {
  const { settings } = useApp();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const runUpload = async (file: File) => {
    setLastFile(file);
    setError(null);
    setUploading(true);
    setProgress(2);
    setStage('Validating file...');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await uploadResilientMedia({
        file,
        cloudinaryCloudName: settings.cloudinaryCloudName,
        cloudinaryUploadPreset: settings.cloudinaryUploadPreset,
        folder,
        signal: controller.signal,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStage(msg);
        },
      });
      onChange(res.url);
      onUploaded?.(res.url);
      setStage(`Uploaded via ${res.provider}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void runUpload(file);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleRetry = () => {
    if (lastFile) void runUpload(lastFile);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
        {helperText && (
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {helperText}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus-visible:ring-2"
          style={{
            backgroundColor: 'var(--bg-page)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        >
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
        </button>
      </div>

      {uploading && (
        <div
          className="p-3 rounded-lg border space-y-2"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--text-primary)' }}>{stage}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono-tabular">{progress}%</span>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 text-xs font-medium cursor-pointer hover:underline"
                style={{ color: 'var(--accent-highlight)' }}
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
            <div
              className="h-full transition-all duration-150"
              style={{ width: `${progress}%`, backgroundColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          className="p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--accent-highlight)',
            color: 'var(--accent-highlight)',
          }}
        >
          <span>{error}</span>
          {lastFile && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 font-medium underline cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
