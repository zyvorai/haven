// Copyright 2026 Zyvor AI Labs
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConsoleLayout } from '../components/ConsoleLayout';
import { ConsolePageHeader } from '../components/ConsolePageHeader';
import { DataTable } from '../components/DataTable';
import { api, type Client } from '../api/client';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .listAllClients()
      .then(setClients)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConsoleLayout>
        <div className="console-content">
          <div className="console-content-inner">
            <ConsolePageHeader
              eyebrow="Identity"
              title="Clients"
              subtitle="OIDC clients across all realms — mint, rotate secrets, manage redirect URIs."
            />
          {err && <p style={{ color: 'var(--zy-danger)' }}>{err}</p>}
          {loading ? (
            <p style={{ color: 'var(--zy-muted)' }}>Loading clients…</p>
          ) : (
            <DataTable
              rows={clients.filter((c) => !c.clientId.startsWith('account') && c.clientId !== 'broker' && c.clientId !== 'realm-management')}
              keyField={(c) => `${c.realm}-${c.id ?? c.clientId}`}
              columns={[
                {
                  key: 'clientId',
                  label: 'Client ID',
                  render: (c) =>
                    c.realm ? (
                      <Link
                        to={`/realms/${encodeURIComponent(c.realm)}?tab=clients`}
                        style={{ color: 'var(--zy-500)' }}
                      >
                        {c.clientId}
                      </Link>
                    ) : (
                      c.clientId
                    ),
                },
                { key: 'realm', label: 'Realm' },
                { key: 'name', label: 'Name' },
                {
                  key: 'type',
                  label: 'Type',
                  render: (c) => (c.publicClient ? 'Public' : 'Confidential'),
                },
                {
                  key: 'enabled',
                  label: 'Status',
                  render: (c) => (
                    <span style={{ color: c.enabled ? 'var(--zy-ok)' : 'var(--zy-muted)' }}>
                      {c.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  ),
                },
              ]}
            />
          )}
          </div>
        </div>
    </ConsoleLayout>
  );
}
