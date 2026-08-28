import { Sidebar } from '../components/Sidebar';
import { StatusCard } from '../components/StatusCard';
import { ReconcileTimeline } from '../components/ReconcileTimeline';
import {
  CommandPalette,
  useCommandPalette,
} from '../components/CommandPalette';
import { planeStatus } from '../data/mock';

export function CommandDeck() {
  const { open, setOpen } = useCommandPalette();
  const cards = Object.values(planeStatus);

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
