import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <a href="https://zyvor.dev" target="_blank" rel="noreferrer">
            <img src="/zyvor-logo.png" alt="Zyvor" />
          </a>
          <div>
            <div className="footer-meta">Haven by Zyvor</div>
            <div className="footer-meta">Apache-2.0</div>
          </div>
        </div>
        <div className="footer-links">
          <a href="https://zyvor.dev" target="_blank" rel="noreferrer">
            zyvor.dev
          </a>
          <a
            href="https://github.com/zyvorai/haven"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link to="/deck">Console</Link>
        </div>
      </div>
    </footer>
  );
}
