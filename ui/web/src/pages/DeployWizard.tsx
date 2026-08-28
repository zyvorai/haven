import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';

type Audience = 'platform' | 'application' | 'both';
type Durability = 'dev' | 'staging' | 'production';

export function DeployWizard() {
  const nav = useNavigate();
  const [audience, setAudience] = useState<Audience>('platform');
  const [durability, setDurability] = useState<Durability>('production');
  const [hostname, setHostname] = useState('auth.cloud.internal');
  const [routing, setRouting] = useState('gateway');
  const [adminEmail, setAdminEmail] = useState('admin@cloud.internal');
  const [realm, setRealm] = useState('platform');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const kcInstances = durability === 'dev' ? 1 : durability === 'staging' ? 2 : 3;
  const pgInstances = kcInstances;

  const summary =
    durability === 'production'
      ? 'Highly available identity plane with pod anti-affinity and PostgreSQL HA via CloudNativePG.'
      : durability === 'staging'
        ? 'Staging profile: 2 Keycloak instances, daily backups, NetworkPolicy on.'
        : 'Dev profile: single Postgres and Keycloak, disposable credentials.';

  const handleDeploy = async () => {
    setBusy(true);
    setToast('');
    try {
      await api.createRealm({
        realm,
        displayName: realm,
        enabled: true,
      });
      await api.createClient(realm, {
        clientId: 'haven-console',
        name: 'Haven Console',
        enabled: true,
        publicClient: true,
        protocol: 'openid-connect',
        standardFlowEnabled: true,
        redirectUris: [`https://${hostname}/*`, `http://${hostname}/*`],
        webOrigins: ['+'],
      });
      if (adminEmail) {
        const username = adminEmail.split('@')[0] || 'admin';
        await api.createUser(realm, {
          username,
          email: adminEmail,
          enabled: true,
          emailVerified: true,
        });
      }
      setToast(`Realm "${realm}" created with haven-console client`);
      setTimeout(() => nav(`/realms/${encodeURIComponent(realm)}`), 1500);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Deploy failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="console-layout">
      <Sidebar />
      <div className="console-main">
        <header className="console-topbar">
          <div>
            <span style={{ fontSize: 13, color: 'var(--zy-muted)' }}>
              Product Wizards
            </span>
            <div
              style={{
                fontFamily: 'var(--zy-display)',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Deploy identity plane
            </div>
          </div>
        </header>

        <div className="wizard-layout">
          <div className="wizard-steps">
            <div className="wizard-step active done">
              <div className="wizard-step-num">1</div>
              <div>
                <div className="wizard-step-title">Who is this for?</div>
                <div className="wizard-options">
                  {(
                    [
                      ['platform', 'Platform SSO', 'Kubernetes, Grafana, Argo, Zeus OS'],
                      ['application', 'Application tenants', 'B2B realms for workloads'],
                      ['both', 'Both', 'Platform SSO plus tenant realms'],
                    ] as const
                  ).map(([id, title, desc]) => (
                    <div
                      key={id}
                      className={`wizard-option ${audience === id ? 'selected' : ''}`}
                      onClick={() => setAudience(id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setAudience(id)}
                    >
                      <div className="wizard-option-title">{title}</div>
                      <div className="wizard-option-desc">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="wizard-step active done">
              <div className="wizard-step-num">2</div>
              <div>
                <div className="wizard-step-title">How durable?</div>
                <div className="wizard-options">
                  {(
                    [
                      ['dev', 'Dev 1+1', '1 Postgres, 1 Keycloak, disposable'],
                      ['staging', 'Staging 2+2', '2 instances, daily backup'],
                      ['production', 'Production 3+3', '3 pods across 3 nodes, PITR'],
                    ] as const
                  ).map(([id, title, desc]) => (
                    <div
                      key={id}
                      className={`wizard-option ${durability === id ? 'selected' : ''}`}
                      onClick={() => setDurability(id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setDurability(id)}
                    >
                      <div className="wizard-option-title">{title}</div>
                      <div className="wizard-option-desc">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="wizard-step active done">
              <div className="wizard-step-num">3</div>
              <div>
                <div className="wizard-step-title">How do people reach it?</div>
                <div className="wizard-field">
                  <label htmlFor="hostname">Hostname</label>
                  <input
                    id="hostname"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                  />
                </div>
                <div className="wizard-field">
                  <label htmlFor="routing">Routing type</label>
                  <select
                    id="routing"
                    value={routing}
                    onChange={(e) => setRouting(e.target.value)}
                  >
                    <option value="gateway">Gateway API</option>
                    <option value="ingress">Ingress</option>
                    <option value="none">None (cluster-internal)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="wizard-step active">
              <div className="wizard-step-num">4</div>
              <div>
                <div className="wizard-step-title">Who signs in first?</div>
                <div className="wizard-field">
                  <label htmlFor="email">Admin email</label>
                  <input
                    id="email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="wizard-field">
                  <label htmlFor="realm">First realm</label>
                  <input
                    id="realm"
                    value={realm}
                    onChange={(e) => setRealm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="wizard-preview">
            <div className="wizard-preview-title">Live preview</div>
            <div className="preview-stack">
              <div className="preview-node">
                <div className="preview-node-title">
                  Gateway ({routing === 'gateway' ? 'Gateway API' : routing === 'ingress' ? 'Ingress' : 'internal'})
                </div>
              </div>
              <div className="preview-arrow">↓</div>
              <div className="preview-node">
                <div className="preview-node-title">
                  Keycloak ({kcInstances} pod{kcInstances > 1 ? 's' : ''})
                </div>
                <div className="preview-pods">
                  {Array.from({ length: kcInstances }).map((_, i) => (
                    <div key={i} className="preview-pod">
                      pod
                    </div>
                  ))}
                </div>
              </div>
              <div className="preview-arrow">↓</div>
              <div className="preview-node">
                <div className="preview-node-title">
                  CloudNativePG ({pgInstances} instance
                  {pgInstances > 1 ? 's' : ''})
                </div>
                <div className="preview-pods">
                  {Array.from({ length: pgInstances }).map((_, i) => (
                    <div key={i} className="preview-pod">
                      db
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="preview-summary">{summary}</div>
            <div
              style={{
                marginTop: 16,
                fontSize: 12,
                color: 'var(--zy-muted)',
                fontFamily: 'var(--zy-mono)',
              }}
            >
              {hostname} · realm/{realm} · {audience}
            </div>
          </aside>
        </div>

        <footer className="wizard-footer">
          <button type="button" className="btn btn-ghost" style={{ padding: '8px 20px' }}>
            Back
          </button>
          <div className="wizard-progress">
            <div className="wizard-progress-fill" style={{ width: '100%' }} />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '8px 24px' }}
            onClick={handleDeploy}
            disabled={busy || !realm}
          >
            {busy ? 'Deploying…' : 'Review & Deploy →'}
          </button>
        </footer>
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
