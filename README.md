# Haven

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-MkDocs-525252)](https://zyvorai.github.io/haven/)

**Identity for the private cloud.**

Copyright © 2026 Zyvor AI Labs. Licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE).

Haven turns Keycloak and PostgreSQL into one product. You declare an `IdentityPlane`; a controller (v1) will provision CloudNativePG, the official Keycloak Operator resources, certificates, ingress, and the first realm. **v0 ships the compose path** — the exact manifests that controller will render — so you can run Keycloak + Postgres today without a custom image.

```
  you ──► IdentityPlane CR ──► Haven controller (v1)
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              CloudNativePG   Keycloak CR    Certs + Gateway
              (HA Postgres)   (official op)  (cert-manager)

  v0 compose path: deploy/overlays/{dev,prod}  (no controller required)
```

Inspired by the Zeus OS / Zyvor private-cloud UX. Keycloak stays the IAM engine. Haven is the plane that deploys and operates it.

Pinned versions: `versions.env` (Keycloak Operator **26.7.2**, CloudNativePG **1.27.1**).

---

## Documentation

**Published:** [zyvorai.github.io/haven](https://zyvorai.github.io/haven/) · **[docs/README.md](docs/README.md)** — full index.

| Doc | When to read |
|---|---|
| [Getting started](docs/getting-started.md) | First deploy (local cluster, lab host, or prod) |
| [Runbook](docs/runbook.md) | Install, day-2 ops, troubleshooting |
| [Lab host](docs/lab-host.md) | Console + Keycloak on **<ephemeral-ip>** |
| [Console](docs/console.md) | Auth, routes, remote deploy |
| [Tutorials](docs/tutorials.md) | Realm, client, and password recipes |
| [CLI](docs/cli.md) | `./cli/haven` and Makefile targets |
| [Architecture](docs/architecture.md) | CRDs, reconcile order, profiles |
| [Roadmap](docs/roadmap.md) | v0 / v1 / v2 scope |

Preview locally: `make docs-serve` · Contributing: [CONTRIBUTING.md](CONTRIBUTING.md) · [docs/contributing.md](docs/contributing.md) · Security: [SECURITY.md](SECURITY.md) · Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## Quick start

```bash
# 1. Operators (once per cluster)
./deploy/operators/install.sh

# 2. Postgres + Keycloak
make dev
make wait
make doctor
make admin
```

Keycloak Admin Console: `http://auth.127.0.0.1.nip.io/admin`  
Bootstrap secret: `platform-initial-admin` in namespace `identity`.

Optional first realm: `make realm-import`.

Remote lab console:

```bash
./scripts/deploy-remote.sh <ephemeral-ip> operator
```

→ [http://<ephemeral-ip>:30742/login](http://<ephemeral-ip>:30742/login) · full endpoints in [docs/lab-host.md](docs/lab-host.md)

---

## Why this exists

The official Keycloak Operator is excellent at running Keycloak. It **does not** manage the database. That gap is where production identity dies.

| Pain | What teams actually do | What Haven does |
|---|---|---|
| Database is "bring your own" | Bitnami chart, a random StatefulSet, or a forgotten RDS URL | CloudNativePG cluster owned by the same CR |
| Secrets are tribal knowledge | `kubectl create secret` in Slack | Generated, rotated, referenced automatically |
| First-boot is a scavenger hunt | Find `-initial-admin`, guess hostname, fight TLS | Wizard + ready URL + operator bootstrap secret |
| Day-2 is kubectl + admin console | Two UIs, no backup story, no realm GitOps | One console: plane health, DB, realms, clients, backups |
| Multi-tenant private cloud | One Keycloak, many undocumented realms | Realms as first-class tenants with platform OIDC clients |

---

## Web UI

Product landing + live identity console in `ui/web/` (Apple / Zyvor theme). Served by `haven-console` (Go API + embedded SPA).

```bash
make ui-install   # once
make ui-dev       # http://localhost:5173
```

| Route | What |
|---|---|
| `/deck` | Command Deck — live plane + Keycloak health |
| `/planes` | IdentityPlane fleet |
| `/atlas` | Topology: Console → Ingress → Keycloak → Postgres |
| `/realms` | Realm Studio (users, clients, IdPs, events) |
| `/clients` | Cross-realm OIDC clients |
| `/deploy` | Deploy wizard |
| `/settings` | Keycloak connect, theme, password changes |

Console routes require a session. See [docs/console.md](docs/console.md).

Helm (`charts/haven`) installs RBAC by default. Published images:

```text
ghcr.io/zyvorai/haven-console:0.1.0
ghcr.io/zyvorai/haven-controller:0.1.0
```

```bash
helm install haven oci://ghcr.io/zyvorai/charts/haven --version 0.1.0 \
  --set controller.enabled=true \
  --set console.enabled=true
```

Controller and console default to `enabled: false` until you opt in.

---

## Production overlay

`deploy/overlays/prod` is a shape, not a one-liner. Read [docs/production-overlay.md](docs/production-overlay.md) before apply:

1. `./hack/gen-prod-secrets.sh` — do not use the placeholder password
2. Wait for CNPG, then `./hack/sync-cnpg-ca.sh` (Keycloak verifies DB TLS)
3. Issue `platform-tls` from your ClusterIssuer
4. Configure backups separately ([backups guide](docs/backups.md))

---

## Product surface

| Surface | Who | What |
|---|---|---|
| **Command Deck** | Platform owners | Live plane health, Keycloak status, reconcile |
| **Planes / Atlas** | Platform owners | Fleet list + topology map |
| **Realm Studio** | Tenant admins | Realms, users (set password), clients, IdPs |
| **Settings** | Operators | Keycloak connect, console + admin password changes |
| **CLI** `haven` | SRE / GitOps | `deploy`, `status`, `doctor`, `admin`, `backup` |
| **CRDs** | Controllers | `IdentityPlane`, `RealmBundle`, `OidcClient` |

---

## Design principles

1. **One object, two runtimes.** Database and Keycloak share a lifecycle. Default `reclaimPolicy: Orphan` so deleting a plane does not drop IAM data.
2. **Operators stay official.** Haven composes CloudNativePG and the Keycloak Operator. It does not fork them.
3. **Secrets never leave the cluster.** Operator bootstrap secret is the source of truth in v0.
4. **Git is optional, not mandatory.** The console can write CRs. Flux/Argo can own the same CRs.
5. **Private-cloud defaults.** NetworkPolicies on, TLS on, metrics on in `production`.
6. **Identity is a platform service.** First realm can mint OIDC clients for Kubernetes API, Grafana, Argo CD, Zeus OS.

---

## License

Copyright © 2026 Zyvor AI Labs.

Licensed under the [Apache License, Version 2.0](LICENSE). See [NOTICE](NOTICE) for third-party attribution (Keycloak and CloudNativePG remain under their own licenses).
