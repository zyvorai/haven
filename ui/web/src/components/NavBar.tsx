import { Link, useLocation } from 'react-router-dom';

export function NavBar() {
  const { pathname } = useLocation();
  const isConsole = pathname.startsWith('/deck') || pathname.startsWith('/deploy');

  return (
    <nav className="gnav">
      <div className="gnav-inner">
        <Link to="/" className="gnav-brand">
          <div className="gnav-mark" aria-hidden />
          <div className="gnav-product">
            <span className="gnav-product-name">Haven</span>
            <span className="gnav-product-sub">Identity plane</span>
          </div>
        </Link>
        <div className="gnav-links">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>
            Overview
          </Link>
          <Link to="/deck" className={isConsole ? 'active' : ''}>
            Console
          </Link>
          <a
            href="https://github.com/zyvorai/haven"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
        <Link to="/deck" className="gnav-cta">
          Open console
        </Link>
      </div>
    </nav>
  );
}
