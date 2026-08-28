import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ConsoleMobileNav } from '../components/ConsoleMobileNav';
import { ConsoleTopbar } from '../components/ConsoleTopbar';
import { StatusCard } from '../components/StatusCard';
import { ReconcileTimeline } from '../components/ReconcileTimeline';
import {
  CommandPalette,
  useCommandPalette,
} from '../components/CommandPalette';
import { planeStatus } from '../data/mock';
import { api, type KeycloakStatus } from '../api/client';

const quickActions = [
  { path: '/realms', icon: '◎', label: 'Realm Studio', desc: 'Manage tenants & realms' },
  { path: '/clients', icon: '◉', label: 'Clients', desc: 'OIDC apps across realms' },
  { path: '/deploy', icon: '✦', label: 'Deploy wizard', desc: 'Spin up identity plane' },
  { path: '/settings', icon: '⚙', label: 'Settings', desc: 'Keycloak connection' },
];

const cardIcons: Record<string, string> = {
  Keycloak: '🔐',
  Phase: '◆',
  'Postgres primary': '🗄',
  'Last Backup': '↑',
  Certificate: '✓',
  'Login RPS': '📊',
};

export function CommandDeck() {
  const { open, setOpen } = useCommandPalette();
  const [kc, setKc] = useState<KeycloakStatus | null>(null);
  const [kcErr, setKcErr] = useState('');

  useEffect(() => {
    api
      .keycloakStatus()
      .then(setKc)
      .catch((e) => setKcErr(e.message));
  }, []);

  const kcCard = kc
    ? {
        label: 'Keycloak',
        value: kc.connected ? kc.version ?? 'connected' : 'offline',
        meta: kc.connected
          ? `${kc.realmCount} realm${kc.realmCount === 1 ? '' : 's'} · live`
          : kcErr || 'unreachable',
        ok: kc.connected,
        variant: 'live' as const,
      }
    : {
        label: 'Keycloak',
        value: '…',
        meta: 'checking',
        ok: true,
        variant: 'live' as const,
      };

  const mockCards = Object.values(planeStatus)
    .filter((c) => c.label !== 'Keycloak')
    .map((c) => ({ ...c, variant: 'mock' as const, icon: cardIcons[c.label] }));

  const cards = [kcCard, ...mockCards];

  return (
    <div className="console-layout">
      <ConsoleMobileNav />
      <Sidebar />
      <div className="console-main">
        <ConsoleTopbar onOpenPalette={() => setOpen(true)} />

        <div className="console-content">
          <div className="console-content-inner">
            <div className="deck-hero">
              <p className="deck-eyebrow">Command Deck</p>
              <h1 className="deck-title">Platform at a glance</h1>
              <p className="deck-subtitle">
                Live identity plane health, Keycloak status, and reconcile progress —
                operate entirely from Haven.
              </p>
            </div>

            {kc?.connected ? (
              <div className="keycloak-featured">
                <div>
                  <div className="keycloak-featured-label">
                    <span className="keycloak-live-dot" aria-hidden />
                    Connected Keycloak
                  </div>
                  <code className="keycloak-url-chip">{kc.keycloakUrl}</code>
                  <div className="keycloak-meta">
                    {kc.realmCount} realm{kc.realmCount === 1 ? '' : 's'} · v{kc.version}
                  </div>
                </div>
                <div className="keycloak-featured-actions">
                  <Link to="/realms" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                    Open Realm Studio
                  </Link>
                  <Link to="/clients" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: 14 }}>
                    View clients
                  </Link>
                </div>
              </div>
            ) : (
              <div className="keycloak-featured keycloak-featured--offline">
                <div>
                  <div className="keycloak-featured-label">Keycloak offline</div>
                  <p className="keycloak-meta" style={{ marginTop: 0 }}>
                    {kcErr || 'Not connected — configure in Settings'}
                  </p>
                </div>
                <Link to="/settings" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  Connect Keycloak
                </Link>
              </div>
            )}

            <div className="deck-quick-actions">
              {quickActions.map((a) => (
                <Link key={a.path} to={a.path} className="deck-action-card">
                  <span className="deck-action-icon" aria-hidden>{a.icon}</span>
                  <span className="deck-action-label">{a.label}</span>
                  <span className="deck-action-desc">{a.desc}</span>
                </Link>
              ))}
            </div>

            <div className="deck-bento">
              {cards.map((c) => (
                <StatusCard
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  meta={c.meta}
                  ok={c.ok}
                  icon={cardIcons[c.label]}
                  variant={c.variant}
                />
              ))}
            </div>

            <ReconcileTimeline />
          </div>
        </div>
      </div>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
