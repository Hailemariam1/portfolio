import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Field, Spinner } from '../components/ui.jsx';

export default function Login() {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && admin) navigate('/admin', { replace: true });
  }, [admin, loading, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-sm text-paper">
            H
          </span>
          <span className="font-display text-[16px]">Hailemariam</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-[0_24px_60px_-48px_rgba(22,19,15,0.5)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper-2 text-ink-soft">
              <Lock className="h-4 w-4" />
            </span>
            <h1 className="mt-5 font-display text-[1.7rem] leading-tight">Sign in to the studio</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              Private area for managing the portfolio. There is no public registration.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Email address" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </Field>
              <Field label="Password" htmlFor="password">
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-red-700"
                >
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? <Spinner className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-muted">
            Access is limited to the site administrator. Repeated failed attempts are rate limited.
          </p>
        </div>
      </div>
    </div>
  );
}
