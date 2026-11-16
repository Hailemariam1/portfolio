import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { AvailabilityBadge } from './ui.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const NAV_ITEMS = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/writing', label: 'Writing' },
  { to: '/contact', label: 'Contact' }
];

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'text-ink' : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
  }`;
}

export default function PublicLayout() {
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/70 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label={`${settings.name} — home`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-sm text-paper">
              {settings.name?.[0] || 'H'}
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[17px] tracking-tight">{settings.name}</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                Full-Stack Developer
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            <ThemeToggle className="ml-2" />
            <Link to="/contact" className="btn-primary btn-xs ml-3">
              Let&rsquo;s talk
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg border border-line p-2 text-ink-soft transition hover:bg-paper-2 md:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-surface px-5 py-4 md:hidden">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm ${
                      isActive ? 'bg-paper-2 text-ink' : 'text-ink-soft'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 border-t border-line pt-3">
              <AvailabilityBadge className="w-full justify-center text-center" />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-line bg-paper-2/50">
        <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl">{settings.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{settings.role}</p>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-ink-muted">
              {settings.footerText ||
                'A working portfolio with a content management system behind it, built with React, Node.js and MongoDB.'}
            </p>
            <div className="mt-5">
              <AvailabilityBadge />
            </div>
          </div>

          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
              {settings.resume?.url && (
                <li>
                  <a
                    href={settings.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-ink"
                  >
                    Resume (PDF)
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-2 transition hover:text-ink"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.githubUrl && (
                <li>
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-ink"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </li>
              )}
              {settings.linkedinUrl && (
                <li>
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-ink"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                </li>
              )}
              <li>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-2 text-ink-muted transition hover:text-ink"
                >
                  Admin sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="container-page flex flex-col gap-2 border-t border-line/70 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <p>{settings.location}</p>
        </div>
      </footer>
    </div>
  );
}
