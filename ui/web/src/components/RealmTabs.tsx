import { Link, useParams } from 'react-router-dom';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'clients', label: 'Clients' },
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
  { id: 'idps', label: 'IdPs' },
  { id: 'events', label: 'Events' },
] as const;

export type RealmTab = (typeof tabs)[number]['id'];

interface RealmTabsProps {
  active: RealmTab;
}

export function RealmTabs({ active }: RealmTabsProps) {
  const { realm = '' } = useParams();
  return (
    <nav
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--zy-hairline)',
        marginBottom: 'var(--zy-s5)',
      }}
    >
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={`/realms/${encodeURIComponent(realm)}?tab=${t.id}`}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            color: active === t.id ? 'var(--zy-500)' : 'var(--zy-muted)',
            borderBottom: active === t.id ? '2px solid var(--zy-500)' : '2px solid transparent',
            textDecoration: 'none',
            marginBottom: -1,
          }}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
