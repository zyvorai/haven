// Copyright 2026 Zyvor AI Labs
// SPDX-License-Identifier: Apache-2.0

const BASE = '/api/v1';
const TOKEN_KEY = 'haven-session-token';

export class APIError extends Error {
  status: number;
  keycloak?: unknown;
  constructor(message: string, status: number, keycloak?: unknown) {
    super(message);
    this.status = status;
    this.keycloak = keycloak;
  }
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!res.ok) {
    let body: { error?: string; keycloak?: unknown } = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      /* ignore */
    }
    throw new APIError(body.error ?? text ?? res.statusText, res.status, body.keycloak);
  }
  return text ? JSON.parse(text) : (undefined as T);
}

export interface KeycloakStatus {
  connected: boolean;
  version?: string;
  realmCount: number;
  keycloakUrl: string;
}

export interface Realm {
  id?: string;
  realm: string;
  displayName?: string;
  enabled: boolean;
}

export interface Client {
  id?: string;
  clientId: string;
  name?: string;
  description?: string;
  enabled: boolean;
  publicClient: boolean;
  protocol?: string;
  redirectUris?: string[];
  webOrigins?: string[];
  standardFlowEnabled?: boolean;
  directAccessGrantsEnabled?: boolean;
  secret?: string;
  realm?: string;
}

export interface ClientSecret {
  type: string;
  value: string;
}

export interface User {
  id?: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified?: boolean;
}

export interface Role {
  id?: string;
  name: string;
  description?: string;
}

export interface Group {
  id?: string;
  name: string;
  path?: string;
}

export interface IdentityProvider {
  alias: string;
  displayName?: string;
  providerId: string;
  enabled: boolean;
}

export interface AdminEvent {
  time: number;
  operationType?: string;
  resourceType?: string;
  resourcePath?: string;
  error?: string;
}

export interface PlaneCard {
  label: string;
  value: string;
  meta: string;
  ok: boolean;
  live: boolean;
  configured?: boolean;
}

export interface PlaneCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
}

export interface PlaneStatus {
  available: boolean;
  plane: string;
  namespace: string;
  phase?: string;
  phaseCard: PlaneCard;
  postgres: PlaneCard;
  backup: PlaneCard;
  certificate: PlaneCard;
  conditions?: PlaneCondition[];
  lastSync?: string;
  message?: string;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  authProviders: () =>
    request<{
      local: { enabled: boolean; default_username?: string };
      lab: { operator_login: boolean; hint?: string };
      hasLocalCreds?: boolean;
    }>('/auth/providers'),
  authLogin: (username: string, password: string) =>
    request<{
      token: string;
      user: string;
      role: string;
      auth: string;
      expiresAt: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  authSession: () =>
    request<{ user: string; role: string; auth: string; mode?: string }>(
      '/auth/session',
    ),
  authLogout: () =>
    request<void>('/auth/logout', { method: 'POST' }),
  changeConsolePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean; user: string; note?: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  changeKeycloakAdminPassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean; user: string; note?: string }>(
      '/keycloak/admin-password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      },
    ),
  planeStatus: () => request<PlaneStatus>('/plane/status'),
  keycloakStatus: () => request<KeycloakStatus>('/keycloak/status'),
  keycloakConfig: () =>
    request<{ keycloakUrl: string; adminUser: string }>('/keycloak/config'),
  connectKeycloak: (body: {
    keycloakUrl: string;
    adminUser: string;
    password: string;
  }) =>
    request<KeycloakStatus>('/keycloak/connect', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listRealms: () => request<Realm[]>('/realms'),
  getRealm: (realm: string) => request<Realm>(`/realms/${encodeURIComponent(realm)}`),
  createRealm: (body: Realm) =>
    request<void>('/realms', { method: 'POST', body: JSON.stringify(body) }),
  updateRealm: (realm: string, body: Realm) =>
    request<void>(`/realms/${encodeURIComponent(realm)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteRealm: (realm: string) =>
    request<void>(`/realms/${encodeURIComponent(realm)}`, { method: 'DELETE' }),
  listAllClients: () => request<Client[]>('/clients'),
  listClients: (realm: string) =>
    request<Client[]>(`/realms/${encodeURIComponent(realm)}/clients`),
  createClient: (realm: string, body: Client) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/clients`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteClient: (realm: string, id: string) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/clients/${id}`, {
      method: 'DELETE',
    }),
  getClientSecret: (realm: string, id: string) =>
    request<ClientSecret>(
      `/realms/${encodeURIComponent(realm)}/clients/${id}/secret`,
    ),
  regenerateClientSecret: (realm: string, id: string) =>
    request<ClientSecret>(
      `/realms/${encodeURIComponent(realm)}/clients/${id}/secret`,
      { method: 'POST' },
    ),
  listUsers: (realm: string, search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<User[]>(`/realms/${encodeURIComponent(realm)}/users${q}`);
  },
  createUser: (realm: string, body: User) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/users`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateUser: (realm: string, id: string, body: User) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteUser: (realm: string, id: string) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/users/${id}`, {
      method: 'DELETE',
    }),
  resetPassword: (
    realm: string,
    id: string,
    value: string,
    temporary = true,
  ) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ type: 'password', value, temporary }),
    }),
  listRoles: (realm: string) =>
    request<Role[]>(`/realms/${encodeURIComponent(realm)}/roles`),
  createRole: (realm: string, body: Role) =>
    request<void>(`/realms/${encodeURIComponent(realm)}/roles`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listGroups: (realm: string) =>
    request<Group[]>(`/realms/${encodeURIComponent(realm)}/groups`),
  listIdentityProviders: (realm: string) =>
    request<IdentityProvider[]>(
      `/realms/${encodeURIComponent(realm)}/identity-providers`,
    ),
  listEvents: (realm: string) =>
    request<AdminEvent[]>(`/realms/${encodeURIComponent(realm)}/events`),
};
