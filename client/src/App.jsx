import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import PublicLayout from './components/Layout.jsx';
import AmbientBackground from './components/AmbientBackground.jsx';
import ScrollReveal from './components/ScrollReveal.jsx';
import { Spinner } from './components/ui.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import AdminLayout from './admin/AdminLayout.jsx';
const Home = lazy(() => import('./pages/Home.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Writing = lazy(() => import('./pages/Writing.jsx'));
const PostDetail = lazy(() => import('./pages/PostDetail.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Login = lazy(() => import('./admin/Login.jsx'));
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'));
const AdminProjects = lazy(() => import('./admin/Projects.jsx'));
const ProjectForm = lazy(() => import('./admin/ProjectForm.jsx'));
const Skills = lazy(() => import('./admin/Skills.jsx'));
const Experience = lazy(() => import('./admin/Experience.jsx'));
const Blog = lazy(() => import('./admin/Blog.jsx'));
const BlogForm = lazy(() => import('./admin/BlogForm.jsx'));
const Messages = lazy(() => import('./admin/Messages.jsx'));
const MessageDetail = lazy(() => import('./admin/MessageDetail.jsx'));
const SettingsPage = lazy(() => import('./admin/Settings.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function DocumentMeta() {
  const { pathname } = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    const section =
      pathname === '/'
        ? 'Home'
        : pathname.startsWith('/projects')
          ? 'Projects'
          : pathname.startsWith('/writing')
            ? 'Writing'
            : pathname.startsWith('/about')
              ? 'About'
              : pathname.startsWith('/contact')
                ? 'Contact'
                : pathname.startsWith('/admin')
                  ? 'Admin'
                  : 'Page';
    document.title = `${section} — ${settings.name || 'Portfolio'}`;
  }, [pathname, settings.name]);

  return null;
}

function RouteLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-ink-muted">
      <Spinner className="h-4 w-4" />
      Loading page…
    </div>
  );
}

function RequireAuth({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-transparent text-sm text-ink-muted">
        <Spinner className="h-4 w-4" />
        Checking your session…
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SettingsProvider>
        <AuthProvider>
          <AmbientBackground />
          <div className="relative z-10">
          <ScrollToTop />
          <DocumentMeta />
          <ScrollReveal />
          <ErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:slug" element={<ProjectDetail />} />
              <Route path="about" element={<About />} />
              <Route path="writing" element={<Writing />} />
              <Route path="writing/:slug" element={<PostDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="projects/:id/edit" element={<ProjectForm />} />
              <Route path="skills" element={<Skills />} />
              <Route path="experience" element={<Experience />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/new" element={<BlogForm />} />
              <Route path="blog/:id/edit" element={<BlogForm />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:id" element={<MessageDetail />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
          </Suspense>
          </ErrorBoundary>
          </div>
        </AuthProvider>
        </SettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
