import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  FolderGit2,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  Settings as SettingsIcon,
  Wrench,
  X
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/admin/skills', label: 'Skills', icon: Wrench },
  { to: '/admin/experience', label: 'Experience', icon: GraduationCap },
  { to: '/admin/blog', label: 'Writing', icon: NotebookPen },
  { to: '/admin/messages', label: 'Messages', icon: Inbox, badge: true },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon }
];

export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-[1.75rem] leading-tight tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function AdminCard({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface ${className}`}>
      {title && (
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            {title}
          </h2>
          {description && <p className="mt-1 text-[12px] text-ink-muted">{description}</p>}
        </div>
      )}
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function SidebarLinks({ unread, onNavigate }) {
  return (
    <nav className="space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition ${
                isActive
                  ? 'bg-paper-2 font-medium text-ink'
                  : 'text-ink-soft hover:bg-paper-2/60 hover:text-ink'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0 opacity-70" />
            <span className="flex-1">{item.label}</span>
            {item.badge && unread > 0 && (
              <span className="rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                {unread}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    api
      .get('/admin/stats')
      .then((data) => active && setUnread(data.stats?.unreadMessages || 0))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper-2/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-sm text-paper">
            {admin?.name?.[0] || 'H'}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] leading-tight">Content studio</p>
            <p className="truncate text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">
              {admin?.name || 'Administrator'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <SidebarLinks unread={unread} />
        </div>

        <div className="space-y-1 border-t border-line p-3">
          <div className="mb-1 flex items-center justify-between rounded-lg px-3 py-1.5">
            <span className="text-[13px] text-ink-soft">Theme</span>
            <ThemeToggle className="h-8 w-8" />
          </div>
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-ink-soft transition hover:bg-paper-2 hover:text-ink"
          >
            <ArrowUpRight className="h-4 w-4 opacity-70" />
            View public site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] text-ink-soft transition hover:bg-paper-2 hover:text-ink"
          >
            <LogOut className="h-4 w-4 opacity-70" />
            Sign out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/55" onClick={() => setMenuOpen(false)} />
          <div className="relative flex h-full w-64 flex-col border-r border-line bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <p className="font-display text-[15px]">Content studio</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-paper-2"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarLinks unread={unread} onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="space-y-1 border-t border-line p-3">
              <Link
                to="/"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-ink-soft"
              >
                <ArrowUpRight className="h-4 w-4 opacity-70" />
                View public site
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] text-ink-soft"
              >
                <LogOut className="h-4 w-4 opacity-70" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg border border-line p-2 text-ink-soft"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <p className="font-display text-[15px]">Content studio</p>
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-8 w-8" />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-paper">
              {admin?.name?.[0] || 'H'}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
