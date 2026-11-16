import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDateTime } from '../lib/format.js';
import { AdminPageHeader } from './AdminLayout.jsx';
import { ConfirmDialog, ErrorBlock, LoadingBlock, Spinner } from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/messages/${id}`);
      setMessage(data.message);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async () => {
    if (!message) return;
    setBusy(true);
    try {
      const nextStatus = message.status === 'read' ? 'unread' : 'read';
      const data = await api.patch(`/admin/messages/${id}`, { status: nextStatus });
      setMessage(data.message);
      toast.success(nextStatus === 'read' ? 'Marked as read.' : 'Marked as unread.');
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.del(`/admin/messages/${id}`);
      toast.success('Message deleted.');
      navigate('/admin/messages');
    } catch (requestError) {
      toast.error(requestError.message);
      setBusy(false);
    }
  };

  if (loading) return <LoadingBlock label="Opening message…" />;

  if (error || !message) {
    return (
      <ErrorBlock
        title="Message not available"
        message={error}
        action={
          <Link to="/admin/messages" className="btn-secondary btn-xs">
            Back to inbox
          </Link>
        }
      />
    );
  }

  const mailtoSubject = message.subject ? `Re: ${message.subject}` : 'Re: your message';
  const mailto = `mailto:${message.email}?subject=${encodeURIComponent(mailtoSubject)}`;

  return (
    <>
      <AdminPageHeader
        title={message.subject || 'Message'}
        description={`From ${message.name} · ${message.email}`}
        action={
          <Link to="/admin/messages" className="btn-secondary btn-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Inbox
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <article className="rounded-2xl border border-line bg-surface">
            <header className="border-b border-line px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-[1.15rem]">{message.name}</p>
                <p className="text-[11.5px] text-ink-muted">{formatDateTime(message.createdAt)}</p>
              </div>
              <a href={`mailto:${message.email}`} className="text-[12.5px] text-clay-deep link-underline">
                {message.email}
              </a>
              <p className="mt-1.5 text-[12px] text-ink-muted">
                Subject: {message.subject || '(none)'}
              </p>
            </header>
            <div className="whitespace-pre-wrap px-5 py-5 text-[14px] leading-relaxed text-ink-soft">
              {message.message}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-[11.5px] text-ink-muted">
              <span>
                Status: <span className="font-medium text-ink">{message.status}</span>
                {message.emailSent ? ' · notification email sent' : ' · stored in MongoDB'}
              </span>
              <span>{message.meta?.ip ? `IP ${message.meta.ip}` : ''}</span>
            </footer>
          </article>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <a href={mailto} className="btn-primary w-full">
              <Reply className="h-4 w-4" />
              Reply by email
            </a>
            <button
              type="button"
              onClick={toggleStatus}
              className="btn-secondary w-full"
              disabled={busy}
            >
              {busy ? (
                <Spinner className="h-4 w-4" />
              ) : message.status === 'read' ? (
                <Mail className="h-4 w-4" />
              ) : (
                <MailOpen className="h-4 w-4" />
              )}
              Mark as {message.status === 'read' ? 'unread' : 'read'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="btn-ghost w-full text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete message
            </button>
            <p className="pt-1 text-[11px] leading-relaxed text-ink-muted">
              Replying opens your default email application with the sender&rsquo;s address and subject
              filled in.
            </p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this message?"
        description={`The message from ${message.name} will be removed permanently.`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        busy={busy}
        confirmLabel="Delete message"
      />
    </>
  );
}
