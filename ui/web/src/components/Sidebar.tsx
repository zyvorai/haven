import { Link, useLocation } from 'react-router-dom';
import { sidebarNav } from '../data/mock';

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <a href="https://zyvor.dev" target="_blank" rel="noreferrer">
          <img src="/zyvor-logo.png" alt="Zyvor" />
        </a>
        <div className="sidebar-product">Haven</div>
        <div className="sidebar-sub">Private cloud console</div>
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
        <span className="sidebar-status-dot" />
        <span className="sidebar-status-label">All Systems Operational</span>
        <div className="sidebar-uptime">47d 12h 19m</div>
      </div>
    </aside>
  );
}
