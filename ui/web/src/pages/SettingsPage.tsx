import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { api, type KeycloakStatus } from '../api/client';

export function SettingsPage() {
  const [adminUrl, setAdminUrl] = useState('');
  const [keycloakUrl, setKeycloakUrl] = useState('');
  const [adminUser, setAdminUser] = useState('admin');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<KeycloakStatus | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

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
    <div className="console-layout">
      <Sidebar />
      <div className="console-main">
        <header className="console-topbar">
          <div style={{ fontFamily: 'var(--zy-display)', fontWeight: 600 }}>Settings</div>
        </header>
        <div className="console-content">
          <section className="card" style={{ padding: 24, maxWidth: 560, marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Keycloak connection</h2>
            <p style={{ color: 'var(--zy-muted)', fontSize: 14, margin: '0 0 20px' }}>
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

          <section className="card" style={{ padding: 24, maxWidth: 560 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Advanced</h2>
            <p style={{ color: 'var(--zy-muted)', fontSize: 14, margin: '0 0 16px' }}>
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
    </div>
  );
}
