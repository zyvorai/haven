# Haven

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-live-525252)](https://zyvorai.github.io/haven/)
[![Keycloak](https://img.shields.io/badge/Keycloak_Operator-26.7.2-4a0863)](versions.env)
[![CloudNativePG](https://img.shields.io/badge/CloudNativePG-1.27.1-326ce5)](versions.env)

**Identity for the private cloud.**

One intent. One console. Keycloak + HA Postgres that actually ship together.

Copyright © 2026 Zyvor AI Labs. Licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE).

---

## Why Haven

The official Keycloak Operator runs Keycloak well. It **does not** manage the database. That gap is where production **identity** dies — not application data pipelines.

| Pain | What teams actually do | What Haven does |
|---|---|---|
| Database is “bring your own” | Bitnami chart, random StatefulSet, forgotten RDS URL | CloudNativePG cluster owned by the same plane |
| Secrets are tribal knowledge | `kubectl create secret` in Slack | Generated, rotated, referenced automatically |
| First-boot is a scavenger hunt | Hunt `-initial-admin`, guess hostname, fight TLS | Wizard + ready URL + operator bootstrap secret |
| Day-2 is two UIs and a prayer | kubectl + Keycloak admin, no backup story | One console: plane health, DB, realms, clients, backups |
| Multi-tenant private cloud | One Keycloak, many undocumented realms | Realms as first-class tenants with platform OIDC clients |

Haven composes **official** CloudNativePG and the **official** Keycloak Operator. No forks. No custom Keycloak image required for v0.

---

## What you get

- **`IdentityPlane`** — one CR for Postgres + Keycloak + certs + ingress (controller path in v1)
- **Compose today** — `deploy/overlays/{dev,prod}` are the exact manifests the controller will render
- **Command Deck** — live plane + Keycloak health in one glass
- **Realm Studio** — realms, users, clients, IdPs without living in the Keycloak admin UI
- **CLI** — `deploy`, `status`, `doctor`, `admin`, `backup`
- **Private-cloud defaults** — NetworkPolicies, TLS, metrics on in `production`

```
  you ──► IdentityPlane CR ──► Haven controller (v1)
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              CloudNativePG   Keycloak CR    Certs + Gateway
              (HA Postgres)   (official op)  (cert-manager)

  v0 compose path: deploy/overlays/{dev,prod}  (no controller required)
```

---

## Scope

**Haven is** the identity plane: deploy and operate Keycloak + PostgreSQL (CloudNativePG) — CRDs, console, and CLI for realms, OIDC clients, and day-2 ops.

**Haven is not** an AI agent, app-data quality tool, conflict resolver, or human-in-the-loop verifier for automation over customer databases. The Postgres cluster it owns is **Keycloak’s store**, not your app OLTP.

Inspired by Zeus OS / Zyvor private-cloud UX. Keycloak stays the IAM engine. Haven is the plane that deploys and operates it.

Pinned versions live in [`versions.env`](versions.env).

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

| | |
|---|---|
| Keycloak Admin | `http://auth.127.0.0.1.nip.io/admin` |
| Bootstrap secret | `platform-initial-admin` in namespace `identity` |
| First realm | `make realm-import` (optional) |

**Remote lab console**

```bash
./scripts/deploy-remote.sh <ephemeral-ip> operator
```

Open `http://<ephemeral-ip>:30742/login` — endpoints in [docs/lab-host.md](docs/lab-host.md).

**UI local**

```bash
make ui-install   # once
make ui-dev       # http://localhost:5173
```

---

## Console

Served by `haven-console` (Go API + embedded SPA in `ui/web/`).

| Route | What |
|---|---|
| `/deck` | Command Deck — live plane + Keycloak health |
| `/planes` | IdentityPlane fleet |
| `/atlas` | Topology: Console → Ingress → Keycloak → Postgres |
| `/realms` | Realm Studio (users, clients, IdPs, events) |
| `/clients` | Cross-realm OIDC clients |
| `/deploy` | Deploy wizard |
| `/settings` | Keycloak connect, theme, password changes |

Session required. Details: [docs/console.md](docs/console.md).

---

## Install with Helm

```bash
helm install haven oci://ghcr.io/zyvorai/charts/haven --version 0.1.0 \
  --set controller.enabled=true \
  --set console.enabled=true
```

Images:

```text
ghcr.io/zyvorai/haven-console:0.1.0
ghcr.io/zyvorai/haven-controller:0.1.0
```

Controller and console default to `enabled: false` until you opt in. Chart installs RBAC by default.

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
| **Realm Studio** | Tenant admins | Realms, users, clients, IdPs |
| **Settings** | Operators | Keycloak connect, console + admin passwords |
| **CLI** `haven` | SRE / GitOps | `deploy`, `status`, `doctor`, `admin`, `backup` |
| **CRDs** | Controllers | `IdentityPlane`, `RealmBundle`, `OidcClient` |

---

## Design principles

1. **One object, two runtimes.** Database and Keycloak share a lifecycle. Default `reclaimPolicy: Orphan` so deleting a plane does not drop IAM data.
2. **Operators stay official.** Haven composes CloudNativePG and the Keycloak Operator — it does not fork them.
3. **Secrets never leave the cluster.** Operator bootstrap secret is the source of truth in v0.
4. **Git is optional, not mandatory.** The console can write CRs; Flux/Argo can own the same CRs.
5. **Private-cloud defaults.** NetworkPolicies on, TLS on, metrics on in `production`.
6. **Identity is a platform service.** First realm can mint OIDC clients for Kubernetes API, Grafana, Argo CD, Zeus OS.

---

## Documentation

**Published:** [zyvorai.github.io/haven](https://zyvorai.github.io/haven/) · full index in [docs/README.md](docs/README.md)

| Doc | When to read |
|---|---|
| [Getting started](docs/getting-started.md) | First deploy (local, lab, or prod) |
| [Runbook](docs/runbook.md) | Install, day-2 ops, troubleshooting |
| [Lab host](docs/lab-host.md) | Console + Keycloak on a remote host |
| [Console](docs/console.md) | Auth, routes, remote deploy |
| [Tutorials](docs/tutorials.md) | Realm, client, and password recipes |
| [CLI](docs/cli.md) | `./cli/haven` and Makefile targets |
| [Architecture](docs/architecture.md) | CRDs, reconcile order, profiles |
| [Roadmap](docs/roadmap.md) | v0 / v1 / v2 scope |

```bash
make docs-serve
```

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md) · [docs/contributing.md](docs/contributing.md) · Security: [SECURITY.md](SECURITY.md) · Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## License

Copyright © 2026 Zyvor AI Labs.

Licensed under the [Apache License, Version 2.0](LICENSE). See [NOTICE](NOTICE) for third-party attribution (Keycloak and CloudNativePG remain under their own licenses).
