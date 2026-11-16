import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { api, toQuery } from '../lib/api.js';
import { formatDate, readingTime } from '../lib/format.js';
import { AdminPageHeader } from './AdminLayout.jsx';
import {
  ConfirmDialog,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Spinner,
  StatusBadge
} from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' }
];

export default function Blog() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(
        `/admin/blog${toQuery({
          status: status === 'all' ? undefined : status,
          q: query || undefined,
          limit: 50
        })}`
      );
      setItems(data.items || []);
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

  const toggleStatus = async (post) => {
    setPendingId(post.id);
    try {
      const nextStatus = post.status === 'published' ? 'draft' : 'published';
      await api.put(`/admin/blog/${post.id}`, { status: nextStatus });
      toast.success(nextStatus === 'published' ? 'Article published.' : 'Article moved to drafts.');
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setPendingId(null);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await api.del(`/admin/blog/${confirm.id}`);
      toast.success('Article deleted.');
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
        title="Writing"
        description="Articles for the public writing section. Drafts stay private until published."
        action={
          <Link to="/admin/blog/new" className="btn-primary btn-xs">
            <Plus className="h-3.5 w-3.5" />
            New article
          </Link>
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
            placeholder="Search articles…"
            aria-label="Search articles"
            className="input py-2 pl-9 text-[13px]"
          />
        </div>
      </div>

      {error ? (
        <ErrorBlock message={error} action={<button className="btn-secondary btn-xs" onClick={load}>Try again</button>} />
      ) : loading ? (
        <LoadingBlock label="Loading articles…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No articles yet"
          description="Write about a problem you solved. The editor supports headings, links, lists and code blocks."
          action={
            <Link to="/admin/blog/new" className="btn-primary btn-xs">
              <Plus className="h-3.5 w-3.5" />
              New article
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-2/40">
                  <th className="table-head px-5 py-3">Article</th>
                  <th className="table-head px-3 py-3">Status</th>
                  <th className="table-head px-3 py-3">Published</th>
                  <th className="table-head px-3 py-3">Length</th>
                  <th className="table-head px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((post) => (
                  <tr key={post.id} className="transition hover:bg-paper-2/25">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/blog/${post.id}/edit`}
                        className="font-medium text-ink hover:text-clay-deep"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-ink-muted">{post.category}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-3 py-3.5 text-[12px] text-ink-muted">
                      {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-[12px] text-ink-muted">
                      {readingTime(post.readingMinutes)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === 'published' && (
                          <a
                            href={`/writing/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                            title="View on public site"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleStatus(post)}
                          disabled={pendingId === post.id}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {pendingId === post.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : post.status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirm(post)}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete “${confirm?.title || 'this article'}”?`}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        busy={deleting}
        confirmLabel="Delete article"
      />
    </>
  );
}
