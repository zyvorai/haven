import { Link, useLocation } from 'react-router-dom';

const mobileLinks = [
  { path: '/deck', label: 'Deck' },
  { path: '/realms', label: 'Realms' },
  { path: '/clients', label: 'Clients' },
  { path: '/settings', label: 'Settings' },
];

export function ConsoleMobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="console-mobile-nav" aria-label="Console navigation">
      <div className="console-mobile-brand">
        <a href="https://zyvor.dev" target="_blank" rel="noreferrer">
          <img src="/zyvor-logo.png" alt="Zyvor" />
        </a>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Haven</span>
      </div>
      <div className="console-mobile-pills">
        {mobileLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`console-mobile-pill ${
              pathname === item.path || pathname.startsWith(item.path + '/')
                ? 'active'
                : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
