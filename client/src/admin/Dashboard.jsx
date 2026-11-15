import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  FileText,
  FolderGit2,
  Inbox,
  Mail,
  NotebookPen,
  Plus,
  Settings as SettingsIcon
} from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDate, formatDateTime } from '../lib/format.js';
import { AdminPageHeader } from './AdminLayout.jsx';
import { ErrorBlock, LoadingBlock, StatusBadge } from '../components/ui.jsx';

function StatCard({ label, value, hint, icon: Icon, to, tone = 'default' }) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <Icon className="h-4 w-4 text-ink-muted/70" />
      </div>
      <p className="mt-3 font-display text-[2rem] leading-none text-ink">{value}</p>
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-muted">{hint}</p>}
      {tone === 'alert' && value > 0 && (
        <span className="mt-3 inline-flex rounded-full bg-clay-soft px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-clay-deep">
          Needs attention
        </span>
      )}
    </>
  );

  const className =
    'rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong sm:p-5';

  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/admin/stats')
      .then((payload) => active && setData(payload))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingBlock label="Loading dashboard…" />;
  if (error) return <ErrorBlock message={error} />;

  const { stats, recentMessages = [], recentProjects = [] } = data || {};

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="A quick read on what is published, what is still a draft and who has been in touch."
        action={
          <>
            <Link to="/admin/projects/new" className="btn-primary btn-xs">
              <Plus className="h-3.5 w-3.5" />
              New project
            </Link>
            <Link to="/admin/blog/new" className="btn-secondary btn-xs">
              <NotebookPen className="h-3.5 w-3.5" />
              New article
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label="Total projects"
          value={stats.totalProjects}
          icon={FolderGit2}
          to="/admin/projects"
          hint={`${stats.publishedProjects} published · ${stats.draftProjects} drafts`}
        />
        <StatCard
          label="Published projects"
          value={stats.publishedProjects}
          icon={FolderGit2}
          to="/admin/projects"
          hint="Visible on the public site"
        />
        <StatCard
          label="Draft projects"
          value={stats.draftProjects}
          icon={FileText}
          to="/admin/projects"
          hint="Only visible here"
        />
        <StatCard
          label="Contact messages"
          value={stats.totalMessages}
          icon={Mail}
          to="/admin/messages"
          hint="All messages received"
        />
        <StatCard
          label="Unread messages"
          value={stats.unreadMessages}
          icon={Inbox}
          to="/admin/messages"
          hint="Waiting for a reply"
          tone="alert"
        />
        <StatCard
          label="Blog posts"
          value={stats.totalPosts}
          icon={NotebookPen}
          to="/admin/blog"
          hint={`${stats.publishedPosts} published`}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Recent messages
            </h2>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
            >
              View inbox
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-ink-muted">
              No messages yet. Submissions from the contact form appear here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recentMessages.map((message) => (
                <li key={message.id}>
                  <Link
                    to={`/admin/messages/${message.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-paper-2/40"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        message.status === 'unread' ? 'bg-clay' : 'bg-transparent'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ink">
                        {message.name}
                        <span className="ml-2 font-normal text-ink-muted">{message.email}</span>
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">
                        {message.subject || 'No subject'}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-ink-muted">
                      {formatDate(message.createdAt, { day: 'numeric', month: 'short' })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Recently edited projects
            </h2>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
            >
              Manage
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-ink-muted">No projects yet.</p>
              <Link to="/admin/projects/new" className="btn-primary btn-xs mt-3">
                Create the first project
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recentProjects.map((project) => (
                <li key={project.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/projects/${project.id}/edit`}
                      className="block truncate text-[13.5px] font-medium text-ink hover:text-clay-deep"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      Updated {formatDateTime(project.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/projects/new" className="btn-secondary btn-xs">
            <Plus className="h-3.5 w-3.5" />
            Add project
          </Link>
          <Link to="/admin/skills" className="btn-secondary btn-xs">
            Manage skills
          </Link>
          <Link to="/admin/experience" className="btn-secondary btn-xs">
            Manage experience
          </Link>
          <Link to="/admin/blog/new" className="btn-secondary btn-xs">
            Write an article
          </Link>
          <Link to="/admin/settings" className="btn-secondary btn-xs">
            <SettingsIcon className="h-3.5 w-3.5" />
            Site settings
          </Link>
          <Link to="/" className="btn-ghost btn-xs">
            View public site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
