import { useEffect, useState } from 'react';
import { ConsoleLayout } from '../components/ConsoleLayout';
import { ConsolePageHeader } from '../components/ConsolePageHeader';
import { PasswordDialog } from '../components/PasswordDialog';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api, type KeycloakStatus } from '../api/client';

export function SettingsPage() {
  const { mode, setMode } = useTheme();
  const { user } = useAuth();
  const [adminUrl, setAdminUrl] = useState('');
  const [keycloakUrl, setKeycloakUrl] = useState('');
  const [adminUser, setAdminUser] = useState('admin');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<KeycloakStatus | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [pwMode, setPwMode] = useState<'console' | 'keycloak' | null>(null);

  useEffect(() => {
    api.keycloakConfig().then((c) => {
      setKeycloakUrl(c.keycloakUrl);
      setAdminUser(c.adminUser || 'admin');
      if (c.keycloakUrl) setAdminUrl(`${c.keycloakUrl}/admin`);
    });
    api.keycloakStatus().then(setStatus).catch(() => {});
  }, []);

  const connect = async () => {
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const st = await api.connectKeycloak({
        keycloakUrl,
        adminUser,
        password,
      });
      setStatus(st);
      setAdminUrl(`${keycloakUrl}/admin`);
      setPassword('');
      setMsg(`Connected — Keycloak ${st.version ?? ''} · ${st.realmCount} realm(s)`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Connection failed');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsoleLayout>
        <div className="console-content">
          <div className="console-content-inner">
            <ConsolePageHeader
              eyebrow="Configuration"
              title="Settings"
              subtitle="Connect Haven to your Keycloak instance and manage appearance."
            />

          <section className="card settings-card">
            <h2>Appearance</h2>
            <p className="settings-desc">Choose light, dark, or match your system preference.</p>
            <div className="theme-segmented" role="group" aria-label="Theme">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`theme-segment ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="card settings-card">
            <h2>Passwords</h2>
            <p className="settings-desc">
              Change Haven console sign-in or the Keycloak master admin password.
              Realm users: open Realm Studio → Users → Set password.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPwMode('console')}
                disabled={user?.auth === 'lab'}
                title={user?.auth === 'lab' ? 'Lab demo account cannot change password' : undefined}
              >
                Change console password
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPwMode('keycloak')}
                disabled={!status?.connected}
              >
                Change Keycloak admin password
              </button>
            </div>
            {user?.auth === 'lab' && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--zy-muted)' }}>
                Signed in as lab demo — sign in as Keycloak admin to change console password, or use
                Keycloak admin password below.
              </p>
            )}
          </section>

          <section className="card settings-card">
            <h2>Keycloak connection</h2>
            <p className="settings-desc">
              Credentials stay on the Haven server — the browser never stores your admin password.
              Enter your Keycloak URL, admin username, and password to connect.
            </p>

            {status?.connected && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'var(--zy-ok-tint)',
                  color: 'var(--zy-ok)',
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                Connected to {status.keycloakUrl} · v{status.version} · {status.realmCount} realms
              </div>
            )}

            <div className="wizard-field">
              <label htmlFor="kc-url">Keycloak URL (IP:port or hostname)</label>
              <input
                id="kc-url"
                value={keycloakUrl}
                onChange={(e) => setKeycloakUrl(e.target.value)}
                placeholder="http://175.110.122.71:30180"
              />
            </div>
            <div className="wizard-field">
              <label htmlFor="kc-user">Admin username</label>
              <input
                id="kc-user"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label htmlFor="kc-pass">Admin password</label>
              <input
                id="kc-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={status?.connected ? '••••••••' : ''}
              />
            </div>

            {err && <p style={{ color: 'var(--zy-danger)', fontSize: 14 }}>{err}</p>}
            {msg && <p style={{ color: 'var(--zy-ok)', fontSize: 14 }}>{msg}</p>}

            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !keycloakUrl || !password}
              onClick={connect}
              style={{ marginTop: 8 }}
            >
              {busy ? 'Connecting…' : 'Test & connect'}
            </button>
          </section>

          <section className="card settings-card">
            <h2>Advanced</h2>
            <p className="settings-desc">
              Use the Keycloak SPI console only for low-level provider configuration and debugging.
            </p>
            {adminUrl ? (
              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ fontSize: 13 }}
              >
                Open Keycloak SPI console ↗
              </a>
            ) : (
              <span style={{ color: 'var(--zy-muted)', fontSize: 13 }}>
                Connect Keycloak above to enable
              </span>
            )}
          </section>
          </div>
        </div>

      <PasswordDialog
        open={pwMode === 'console'}
        title="Change console password"
        subtitle={`Updates Haven sign-in for ${user?.name ?? 'this account'} (until pod restart unless persisted in secret).`}
        requireCurrent
        confirmLabel="Update console password"
        onCancel={() => setPwMode(null)}
        onSubmit={async ({ currentPassword, newPassword }) => {
          const res = await api.changeConsolePassword(currentPassword!, newPassword);
          setPwMode(null);
          setMsg(res.note ?? 'Console password updated.');
        }}
      />

      <PasswordDialog
        open={pwMode === 'keycloak'}
        title="Change Keycloak admin password"
        subtitle={`Resets master-realm password for ${adminUser} and reconnects Haven.`}
        requireCurrent
        confirmLabel="Update Keycloak admin"
        onCancel={() => setPwMode(null)}
        onSubmit={async ({ currentPassword, newPassword }) => {
          const res = await api.changeKeycloakAdminPassword(currentPassword!, newPassword);
          setPwMode(null);
          setMsg(res.note ?? 'Keycloak admin password updated.');
        }}
      />
    </ConsoleLayout>
  );
}
