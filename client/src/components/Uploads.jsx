import { useRef, useState } from 'react';
import { FileText, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

function useUploader() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const upload = async (file, kind) => {
    setBusy(true);
    try {
      const { asset } = await api.upload(file, kind);
      toast.success(kind === 'resume' ? 'Resume uploaded.' : 'Image uploaded.');
      return asset;
    } catch (error) {
      toast.error(error.message || 'Upload failed.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { busy, upload };
}

export function ImageUpload({ value, onChange, label = 'Thumbnail', hint }) {
  const inputRef = useRef(null);
  const { busy, upload } = useUploader();

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const asset = await upload(file, 'image');
    if (asset) onChange({ url: asset.url, publicId: asset.publicId, alt: '' });
    event.target.value = '';
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-line bg-paper-2">
          {value?.url ? (
            <img src={value.url} alt={value.alt || label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
              <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary btn-xs"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload className="h-3.5 w-3.5" />
              {value?.url ? 'Replace' : 'Upload'}
            </button>
            {value?.url && (
              <button
                type="button"
                className="btn-ghost btn-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={() => onChange(null)}
                disabled={busy}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          {value?.url && (
            <input
              className="input py-1.5 text-[12px]"
              value={value.alt || ''}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              placeholder="Alt text for screen readers"
              aria-label="Image alt text"
            />
          )}
          <p className="text-[11px] text-ink-muted">{hint || 'JPG, PNG, WebP or GIF, up to 5 MB.'}</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export function GalleryUpload({ images = [], onChange, max = 8 }) {
  const inputRef = useRef(null);
  const { busy, upload } = useUploader();

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    const remaining = Math.max(0, max - images.length);
    const accepted = files.slice(0, remaining);
    const uploaded = [];
    for (const file of accepted) {
      const asset = await upload(file, 'image');
      if (asset) uploaded.push({ url: asset.url, publicId: asset.publicId, alt: '' });
    }
    if (uploaded.length) onChange([...images, ...uploaded]);
    event.target.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label mb-0">Screenshots</span>
        <span className="text-[11px] text-ink-muted">
          {images.length} / {max}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-paper-2"
          >
            <img
              src={image.url}
              alt={image.alt || `Screenshot ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}
              className="absolute right-2 top-2 rounded-lg border border-line bg-paper/90 p-1.5 text-red-600 shadow-sm backdrop-blur transition hover:bg-paper-2 dark:text-red-400"
              aria-label={`Remove screenshot ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-paper-2/40 text-[12px] text-ink-muted transition hover:border-clay/40 hover:bg-surface hover:text-ink"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Add image
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-ink-muted">
        Shown on the project page in a gallery. Up to {max} images, 5 MB each.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}

export function ResumeUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const { busy, upload } = useUploader();

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const asset = await upload(file, 'resume');
    if (asset) onChange({ url: asset.url, publicId: asset.publicId, fileName: asset.fileName });
    event.target.value = '';
  };

  return (
    <div>
      <span className="label">Resume (PDF)</span>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-2 text-ink-muted">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          {value?.url ? (
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-ink link-underline"
            >
              {value.fileName || 'Resume.pdf'}
            </a>
          ) : (
            <p className="text-sm text-ink-muted">No resume uploaded yet.</p>
          )}
          <p className="text-[11px] text-ink-muted">PDF only, up to 10 MB.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary btn-xs"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {value?.url ? 'Replace' : 'Upload'}
          </button>
          {value?.url && (
            <button
              type="button"
              className="btn-ghost btn-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              onClick={() => onChange(null)}
              disabled={busy}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
