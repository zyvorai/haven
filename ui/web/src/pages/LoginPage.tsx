import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ZyvorLogo } from '../components/ZyvorLogo';

const STATS = [
  { label: 'Realms', sub: 'tenant boundaries' },
  { label: 'OIDC', sub: 'platform clients' },
  { label: 'Planes', sub: 'live health' },
];

export function LoginPage() {
  const { user, ready, signIn, defaultUsername, labHint } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/deck';

  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setUsername((u) => u || defaultUsername);
  }, [defaultUsername]);

  if (ready && user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending || !username || !password) return;
    setPending(true);
    setErr('');
    const ok = await signIn(username, password);
    setPending(false);
    if (ok) navigate(from, { replace: true });
    else setErr('Sign in failed — check username and password.');
  };

  return (
    <div className="login-page">
      <div className="login-backdrop" aria-hidden>
        <div className="login-grid" />
        <div className="login-aurora login-aurora-a" />
        <div className="login-aurora login-aurora-b" />
      </div>

      <div className="login-shell">
        <div className="login-brand-panel">
          <div className="login-brand-row">
            <ZyvorLogo className="login-logo" />
          </div>
          <h1 className="login-headline">
            Haven.
            <br />
            <span className="login-headline-accent">Identity for the private cloud.</span>
          </h1>
          <p className="login-lede">
            Operate Keycloak, realms, and OIDC clients from one console — plane health,
            Atlas topology, and day-2 identity in one place.
          </p>
          <div className="login-stats">
            {STATS.map((s) => (
              <div key={s.label} className="login-stat">
                <div className="login-stat-label">{s.label}</div>
                <div className="login-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-mobile-brand">
            <ZyvorLogo className="login-logo-sm" />
            <span>zyvor · Haven</span>
          </div>
          <p className="login-eyebrow">Haven Console</p>
          <h2 className="login-card-title">Sign in to continue</h2>
          <p className="login-card-sub">
            Use your console credentials or Keycloak admin account.
          </p>

          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-field">
              <span>Username</span>
              <input
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </label>
            <label className="login-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            {err && <p className="login-error">{err}</p>}
            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={pending || !username || !password}
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
            {labHint && (
              <button
                type="button"
                className="login-demo"
                onClick={() => {
                  setUsername('demo');
                  setPassword('demo');
                }}
              >
                Lab mode — fill {labHint}
              </button>
            )}
          </form>

          <div className="login-secure">
            Sessions are scoped to this browser and expire automatically.
          </div>
        </div>
      </div>

      <div className="login-footer">
        Haven by Zyvor · <Link to="/">Overview</Link>
      </div>
    </div>
  );
}
