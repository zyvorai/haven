import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { StatusCard } from '../components/StatusCard';
import { ReconcileTimeline } from '../components/ReconcileTimeline';
import {
  CommandPalette,
  useCommandPalette,
} from '../components/CommandPalette';
import { planeStatus } from '../data/mock';
import { api, type KeycloakStatus } from '../api/client';

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
          ? `${kc.realmCount} realm${kc.realmCount === 1 ? '' : 's'}`
          : kcErr || 'unreachable',
        ok: kc.connected,
      }
    : { label: 'Keycloak', value: '…', meta: 'checking', ok: true };

  const cards = [
    kcCard,
    ...Object.values(planeStatus).filter((c) => c.label !== 'Keycloak'),
  ];

  return (
    <div className="console-layout">
      <Sidebar />
      <div className="console-main">
        <header className="console-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--zy-500)' }}>◆</span>
            <span
              style={{
                fontFamily: 'var(--zy-mono)',
                fontSize: 14,
                color: 'var(--zy-slate)',
              }}
            >
              platform
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 'var(--zy-r-sm)',
              border: '1px solid var(--zy-hairline)',
              background: 'var(--zy-surface-2)',
              color: 'var(--zy-muted)',
              fontSize: 13,
            }}
          >
            Command Palette
            <kbd
              style={{
                fontFamily: 'var(--zy-mono)',
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'var(--zy-surface)',
                border: '1px solid var(--zy-hairline)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </header>

        <div className="console-content">
          <div style={{ marginBottom: 'var(--zy-s6)' }}>
            <h1
              style={{
                fontFamily: 'var(--zy-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                margin: '0 0 4px',
              }}
            >
              Command Deck
            </h1>
            <p style={{ color: 'var(--zy-muted)', margin: 0, fontSize: 14 }}>
              Overview of platform plane · Live system state
            </p>
          </div>

          {kc?.connected && (
            <div
              className="card"
              style={{
                marginBottom: 'var(--zy-s6)',
                padding: 'var(--zy-s4) var(--zy-s5)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--zy-muted)', marginBottom: 4 }}>
                  Connected Keycloak
                </div>
                <code style={{ fontFamily: 'var(--zy-mono)', fontSize: 13, color: 'var(--zy-ok)' }}>
                  {kc.keycloakUrl}
                </code>
                <div style={{ fontSize: 12, color: 'var(--zy-muted)', marginTop: 6 }}>
                  {kc.realmCount} realm{kc.realmCount === 1 ? '' : 's'} · v{kc.version}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/realms" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                  Open Realm Studio
                </Link>
                <Link to="/clients" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
                  View clients
                </Link>
              </div>
            </div>
          )}

          <div className="status-grid">
            {cards.map((c) => (
              <StatusCard
                key={c.label}
                label={c.label}
                value={c.value}
                meta={c.meta}
                ok={c.ok}
              />
            ))}
          </div>

          <ReconcileTimeline />
        </div>
      </div>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
