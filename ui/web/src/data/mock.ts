export const planeStatus = {
  phase: { label: 'Phase', value: 'Ready', meta: 'All systems nominal', ok: true },
  keycloak: { label: 'Keycloak', value: '3/3', meta: 'All instances ready', ok: true },
  postgres: { label: 'Postgres primary', value: 'healthy', meta: '2 replicas streaming', ok: true },
  backup: { label: 'Last Backup', value: '2h ago', meta: 'snapshot-20260827-0200', ok: true },
  cert: { label: 'Certificate', value: '84 days', meta: 'expires 2026-11-20', ok: true },
  rps: { label: 'Login RPS', value: '12.4', meta: '1m avg', ok: true },
};

export const reconcileSteps = [
  { id: 'observatory', label: 'Observatory', sub: 'watchers synced' },
  { id: 'ingress', label: 'Ingress', sub: 'rules reconciled' },
  { id: 'certs', label: 'Certificates', sub: 'secrets valid' },
  { id: 'keycloak', label: 'Keycloak', sub: 'realms synced' },
  { id: 'postgres', label: 'Postgres', sub: 'clusters healthy' },
  { id: 'vault', label: 'Vault', sub: 'leases rotated' },
  { id: 'gateway', label: 'API Gateway', sub: 'routes active' },
];

export const sidebarNav = [
  { path: '/deck', label: 'Command Deck', icon: '◆' },
  { path: '/deploy', label: 'Deploy wizard', icon: '✦' },
  { path: '#', label: 'Planes', icon: '▣' },
  { path: '#', label: 'Realm Studio', icon: '◎' },
  { path: '#', label: 'Clients', icon: '◉' },
  { path: '#', label: 'Backups', icon: '↑' },
  { path: '#', label: 'Approvals', icon: '✓' },
  { path: '#', label: 'Atlas', icon: '◇' },
  { path: '#', label: 'Settings', icon: '⚙' },
];

export const commandPaletteItems = [
  'Deploy a new identity plane',
  'Open plane "platform"',
  'Show database lag',
  'Restore realm platform to yesterday 02:00',
  'Mint OIDC client for Grafana',
  'Rotate bootstrap admin',
  'Invite tenant admin',
];

export const problems = [
  {
    title: 'Database is bring-your-own',
    desc: 'The Keycloak Operator runs Keycloak — but not Postgres. Teams wire Bitnami charts, random StatefulSets, or forgotten RDS URLs.',
  },
  {
    title: 'Secrets are tribal knowledge',
    desc: 'Bootstrap admin passwords live in Slack threads. JDBC credentials are kubectl one-offs nobody rotates.',
  },
  {
    title: 'Day-2 is two UIs',
    desc: 'kubectl plus Keycloak admin console, no backup story, no realm GitOps. Haven is one plane you operate.',
  },
];
