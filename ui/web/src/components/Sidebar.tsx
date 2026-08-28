import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { sidebarNav } from '../data/mock';
import { api, type KeycloakStatus } from '../api/client';

export function Sidebar() {
  const { pathname } = useLocation();
  const [kc, setKc] = useState<KeycloakStatus | null>(null);

  useEffect(() => {
    api.keycloakStatus().then(setKc).catch(() => setKc(null));
  }, [pathname]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <a href="https://zyvor.dev" target="_blank" rel="noreferrer">
            <img src="/zyvor-logo.png" alt="Zyvor" className="sidebar-logo" />
          </a>
        </div>
        <div className="sidebar-product">Haven</div>
        <div className="sidebar-sub">Identity console</div>
      </div>
      <nav className="sidebar-nav">
        {sidebarNav.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-status">
        <span
          className="sidebar-status-dot"
          style={{ background: kc?.connected ? 'var(--zy-ok)' : 'var(--zy-warn)' }}
        />
        <span
          className="sidebar-status-label"
          style={{ color: kc?.connected ? 'var(--zy-ok)' : 'var(--zy-warn)' }}
        >
          {kc?.connected
            ? `Connected · v${kc.version ?? '—'}`
            : 'Keycloak offline'}
        </span>
        {kc?.connected && (
          <div className="sidebar-uptime">
            {kc.realmCount} realm{kc.realmCount === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </aside>
  );
}
