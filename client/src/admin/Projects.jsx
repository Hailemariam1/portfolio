import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  FolderGit2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2
} from 'lucide-react';
import { api, toQuery } from '../lib/api.js';
import { CATEGORY_LABELS, formatDate } from '../lib/format.js';
import { AdminPageHeader } from './AdminLayout.jsx';
import {
  CategoryBadge,
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

export default function AdminProjects() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(
        `/admin/projects${toQuery({
          status: status === 'all' ? undefined : status,
          q: query || undefined,
          limit: 50
        })}`
      );
      setItems(data.items || []);
      setPagination(data.pagination);
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

  const toggleStatus = async (project) => {
    setPendingId(project.id);
    try {
      const nextStatus = project.status === 'published' ? 'draft' : 'published';
      await api.patch(`/admin/projects/${project.id}`, { status: nextStatus });
      toast.success(nextStatus === 'published' ? 'Project published.' : 'Project moved to drafts.');
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setPendingId(null);
    }
  };

  const toggleFeatured = async (project) => {
    setPendingId(project.id);
    try {
      await api.patch(`/admin/projects/${project.id}`, { featured: !project.featured });
      toast.success(project.featured ? 'Removed from featured.' : 'Marked as featured.');
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
      await api.del(`/admin/projects/${confirm.id}`);
      toast.success('Project deleted.');
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
        title="Projects"
        description="Case studies shown on the public portfolio. Drafts stay private until you publish them."
        action={
          <Link to="/admin/projects/new" className="btn-primary btn-xs">
            <Plus className="h-3.5 w-3.5" />
            New project
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
            placeholder="Search projects…"
            aria-label="Search projects"
            className="input py-2 pl-9 text-[13px]"
          />
        </div>
      </div>

      {error ? (
        <ErrorBlock message={error} action={<button className="btn-secondary btn-xs" onClick={load}>Try again</button>} />
      ) : loading ? (
        <LoadingBlock label="Loading projects…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create your first case study. Add the problem, what you built and the challenges you hit."
          action={
            <Link to="/admin/projects/new" className="btn-primary btn-xs">
              <Plus className="h-3.5 w-3.5" />
              New project
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-2/40">
                  <th className="table-head px-5 py-3">Project</th>
                  <th className="table-head px-3 py-3">Status</th>
                  <th className="table-head px-3 py-3">Featured</th>
                  <th className="table-head px-3 py-3">Updated</th>
                  <th className="table-head px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((project) => (
                  <tr key={project.id} className="transition hover:bg-paper-2/25">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="font-medium text-ink hover:text-clay-deep"
                      >
                        {project.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <CategoryBadge category={project.category} />
                        <span className="text-[11px] text-ink-muted">
                          {CATEGORY_LABELS[project.category]}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(project)}
                        disabled={pendingId === project.id}
                        className={`rounded-lg p-1.5 transition ${
                          project.featured
                            ? 'text-ochre hover:bg-ochre-soft'
                            : 'text-ink-muted/40 hover:bg-paper-2 hover:text-ink-muted'
                        }`}
                        aria-label={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        title={project.featured ? 'Featured' : 'Not featured'}
                      >
                        <Star className={`h-4 w-4 ${project.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-[12px] text-ink-muted">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {project.status === 'published' && (
                          <a
                            href={`/projects/${project.slug}`}
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
                          onClick={() => toggleStatus(project)}
                          disabled={pendingId === project.id}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                          title={project.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {pendingId === project.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : project.status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirm(project)}
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
          {pagination && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12px] text-ink-muted">
              <span>
                {pagination.total} {pagination.total === 1 ? 'project' : 'projects'}
              </span>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete “${confirm?.title || 'this project'}”?`}
        description="The project and its case study will be removed from the public site."
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        busy={deleting}
        confirmLabel="Delete project"
      />
    </>
  );
}
