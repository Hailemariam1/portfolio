import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Search, Trash2 } from 'lucide-react';
import { api, toQuery } from '../lib/api.js';
import { formatDateTime } from '../lib/format.js';
import { AdminPageHeader } from './AdminLayout.jsx';
import {
  ConfirmDialog,
  EmptyState,
  ErrorBlock,
  LoadingBlock
} from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FILTERS = [
  { value: 'all', label: 'All messages' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' }
];

export default function Messages() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(
        `/admin/messages${toQuery({
          status: status === 'all' ? undefined : status,
          q: query || undefined,
          limit: 50
        })}`
      );
      setItems(data.items || []);
      setUnread(data.unread || 0);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    const timer = window.setTimeout(load, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  const remove = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await api.del(`/admin/messages/${confirm.id}`);
      toast.success('Message deleted.');
      setConfirm(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Inbox"
        description="Messages sent through the contact form. Opening a message marks it as read; replies open in your email client."
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] text-ink-soft">
            <span className={`h-1.5 w-1.5 rounded-full ${unread ? 'bg-clay' : 'bg-moss'}`} />
            {unread ? `${unread} unread` : 'All caught up'}
          </span>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                status === filter.value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-surface text-ink-soft hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages…"
            aria-label="Search messages"
            className="input py-2 pl-9 text-[13px]"
          />
        </div>
      </div>

      {error ? (
        <ErrorBlock message={error} action={<button className="btn-secondary btn-xs" onClick={load}>Try again</button>} />
      ) : loading ? (
        <LoadingBlock label="Loading messages…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={status === 'unread' ? 'No unread messages' : 'The inbox is empty'}
          description="Messages submitted through the public contact form are saved here and, when email is configured, forwarded to your inbox."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <ul className="divide-y divide-line">
            {items.map((message) => (
              <li key={message.id} className="flex items-start gap-3 px-4 py-4 transition hover:bg-paper-2/30 sm:px-5">
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                    message.status === 'unread' ? 'bg-clay' : 'bg-transparent'
                  }`}
                  aria-hidden="true"
                />
                <Link to={`/admin/messages/${message.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p
                      className={`text-[13.5px] ${
                        message.status === 'unread' ? 'font-semibold text-ink' : 'text-ink'
                      }`}
                    >
                      {message.name}
                    </p>
                    <p className="text-[12px] text-ink-muted">{message.email}</p>
                    <span className="ml-auto shrink-0 text-[11px] text-ink-muted">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-[13px] ${
                      message.status === 'unread' ? 'text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {message.subject || 'No subject'}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">{message.message}</p>
                </Link>
                <div className="flex shrink-0 items-center gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setConfirm(message)}
                    className="rounded-md p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                    aria-label={`Delete message from ${message.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this message?"
        description={`From ${confirm?.name || 'a visitor'} — this removes it from the inbox permanently.`}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        busy={deleting}
        confirmLabel="Delete message"
      />
    </>
  );
}
