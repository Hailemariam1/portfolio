import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { CATEGORY_LABELS, CATEGORY_STYLES } from '../lib/format.js';

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function CategoryBadge({ category, className = '' }) {
  if (!category) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        CATEGORY_STYLES[category] || 'border-line bg-paper-2 text-ink-soft'
      } ${className}`}
    >
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

export function StatusBadge({ status }) {
  const published = status === 'published';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        published ? 'border-moss/25 bg-moss-soft text-moss' : 'border-line bg-paper-2 text-ink-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-moss' : 'bg-ink-muted/50'}`} />
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export function AvailabilityBadge({ className = '' }) {
  const { settings } = useSettings();
  const available = Boolean(settings.availabilityStatus);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-soft ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {available && (
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-moss/50" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            available ? 'bg-moss' : 'bg-ink-muted/50'
          }`}
        />
      </span>
      {available
        ? settings.availabilityNote || 'Available for new work'
        : 'Not currently available for new work'}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, intro, action, className = '' }) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 text-3xl leading-[1.15] sm:text-[2.35rem]">{title}</h2>
        {intro && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, htmlFor, hint, error, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-0.5 text-clay">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center ${className}`}
    >
      {Icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-paper-2 text-ink-muted">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <h3 className="font-display text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-sm text-ink-muted ${className}`}>
      <Spinner className="h-4 w-4" />
      {label}
    </div>
  );
}

export function ErrorBlock({ title = 'Something went wrong', message, action }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 text-sm text-red-800">
      <p className="font-medium">{title}</p>
      {message && <p className="mt-1 text-red-700/90">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full ${widths[size]} max-h-[92vh] overflow-y-auto rounded-t-2xl border border-line bg-surface p-6 shadow-lift sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl leading-snug">{title}</h2>
            {description && <p className="mt-1.5 text-sm text-ink-soft">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  busy = false,
  destructive = true
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary btn-xs" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={destructive ? 'btn-danger btn-xs' : 'btn-primary btn-xs'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <Spinner className="h-3.5 w-3.5" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        This action cannot be undone. Take a moment to make sure you have the right item.
      </p>
    </Modal>
  );
}
