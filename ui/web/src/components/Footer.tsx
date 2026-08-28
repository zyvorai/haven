import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <div className="gnav-mark" aria-hidden />
          <div>
            <div className="footer-meta">Haven</div>
            <div className="footer-meta">Apache-2.0</div>
          </div>
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/zyvorai/haven"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link to="/deck">Console</Link>
          <Link to="/realms">Realm Studio</Link>
        </div>
      </div>
    </footer>
  );
}
