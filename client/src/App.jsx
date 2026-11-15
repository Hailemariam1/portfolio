import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import PublicLayout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import About from './pages/About.jsx';
import Writing from './pages/Writing.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import { Spinner } from './components/ui.jsx';

import AdminLayout from './admin/AdminLayout.jsx';
import Login from './admin/Login.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AdminProjects from './admin/Projects.jsx';
import ProjectForm from './admin/ProjectForm.jsx';
import Skills from './admin/Skills.jsx';
import Experience from './admin/Experience.jsx';
import Blog from './admin/Blog.jsx';
import BlogForm from './admin/BlogForm.jsx';
import Messages from './admin/Messages.jsx';
import MessageDetail from './admin/MessageDetail.jsx';
import SettingsPage from './admin/Settings.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-paper text-sm text-ink-muted">
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
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <ScrollToTop />
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
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}
