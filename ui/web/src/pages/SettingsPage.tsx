import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';

export function SettingsPage() {
  const [adminUrl, setAdminUrl] = useState('');

  useEffect(() => {
    fetch('/api/v1/keycloak/status')
      .then((r) => r.json())
      .then((s) => {
        if (s.keycloakUrl) setAdminUrl(`${s.keycloakUrl}/admin`);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="console-layout">
      <Sidebar />
      <div className="console-main">
        <header className="console-topbar">
          <div style={{ fontFamily: 'var(--zy-display)', fontWeight: 600 }}>Settings</div>
        </header>
        <div className="console-content">
          <section className="card" style={{ padding: 24, maxWidth: 560 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Advanced</h2>
            <p style={{ color: 'var(--zy-muted)', fontSize: 14, margin: '0 0 16px' }}>
              Haven manages identity through its API. Use the Keycloak SPI console only for
              low-level provider configuration, themes, and debugging.
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
              <span style={{ color: 'var(--zy-muted)', fontSize: 13 }}>Keycloak URL unavailable</span>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
