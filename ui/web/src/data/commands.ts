export type PaletteAction = 'navigate' | 'shell';

export type PaletteCommand = {
  id: string;
  label: string;
  keywords?: string[];
  action: PaletteAction;
  path?: string;
  hint?: string;
};

export const paletteCommands: PaletteCommand[] = [
  {
    id: 'deploy',
    label: 'Deploy a new identity plane',
    keywords: ['wizard', 'create', 'plane'],
    action: 'navigate',
    path: '/deploy',
  },
  {
    id: 'open-plane',
    label: 'Open plane "platform"',
    keywords: ['deck', 'overview', 'health', 'planes'],
    action: 'navigate',
    path: '/planes',
  },
  {
    id: 'atlas',
    label: 'Open Atlas topology',
    keywords: ['topology', 'map', 'postgres', 'keycloak'],
    action: 'navigate',
    path: '/atlas',
  },
  {
    id: 'realms',
    label: 'Open Realm Studio',
    keywords: ['realms', 'tenants'],
    action: 'navigate',
    path: '/realms',
  },
  {
    id: 'clients',
    label: 'Mint OIDC client for Grafana',
    keywords: ['client', 'oidc', 'grafana', 'app'],
    action: 'navigate',
    path: '/clients',
  },
  {
    id: 'invite',
    label: 'Invite tenant admin',
    keywords: ['user', 'admin', 'invite'],
    action: 'navigate',
    path: '/realms/platform?tab=users',
  },
  {
    id: 'settings',
    label: 'Keycloak connection settings',
    keywords: ['keycloak', 'connect', 'credentials'],
    action: 'navigate',
    path: '/settings',
  },
  {
    id: 'db-lag',
    label: 'Show database lag',
    keywords: ['postgres', 'cnpg', 'replication'],
    action: 'shell',
    hint: 'Coming soon',
  },
  {
    id: 'restore',
    label: 'Restore realm platform to yesterday 02:00',
    keywords: ['backup', 'restore', 'pitr'],
    action: 'shell',
    hint: 'Coming soon',
  },
  {
    id: 'rotate-admin',
    label: 'Rotate bootstrap admin',
    keywords: ['password', 'bootstrap', 'admin'],
    action: 'shell',
    hint: 'Coming soon',
  },
];
