# Haven

**Identity for the private cloud.**

Haven turns Keycloak and PostgreSQL into one product. You declare an `IdentityPlane`. A controller (v1) will provision CloudNativePG, the official Keycloak Operator resources, certificates, ingress, and the first realm. **v0 ships the compose path** — the exact manifests that controller will render — so you can run Keycloak + Postgres today without a custom image.

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

Pinned versions live in `versions.env` (Keycloak Operator **26.7.2**, CloudNativePG **1.27.1**).

**Lab host:** all remote work starts from this repo — `cd /Users/ssahani/tt/tt/haven`. Keycloak + console URLs for **175.110.122.71** are in [docs/lab-host.md](docs/lab-host.md). Full doc index: [docs/README.md](docs/README.md).

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

## Quick start (compose path — this is what works in v0)

```bash
# 1. Operators (once per cluster)
./deploy/operators/install.sh

# 2. Haven CRDs (needed for samples and RealmBundle; optional for compose)
make crds

# 3. Postgres + Keycloak
make dev
make wait
make doctor
make admin
```

Keycloak Admin Console: `http://auth.127.0.0.1.nip.io/admin`  
Bootstrap secret: `<keycloak-cr-name>-initial-admin` (here `platform-initial-admin`).

Optional first realm via the official import CR:

```bash
make realm-import
```

`IdentityPlane` samples (`make samples-dev`) store **intent**. They do nothing until the v1 controller exists. Do not confuse them with `make dev`.

Helm (`charts/haven`) installs RBAC only. Controller and console images are not published; both default to `enabled: false`.

---

## Web UI

Product landing + live identity console in `ui/web/` (Apple / Zyvor theme). The console is served by `haven-console` (Go API + embedded SPA).

```bash
make ui-install   # once
make ui-dev       # http://localhost:5173
make ui-build     # output in ui/web/dist/
```

| Route | What |
|---|---|
| `/` | Landing |
| `/login` | Sign-in (local / Keycloak admin / lab `demo`/`demo`) |
| `/deck` | Command Deck — live plane + Keycloak health |
| `/planes` | IdentityPlane fleet |
| `/atlas` | Topology: Console → Ingress → Keycloak → Postgres |
| `/realms` | Realm Studio (users, clients, IdPs, events) |
| `/clients` | Cross-realm OIDC clients |
| `/deploy` | Deploy wizard |
| `/settings` | Keycloak connect, theme, password changes |

Console routes require a session. See [docs/console.md](docs/console.md) for auth, passwords, and remote deploy.
Day-2 recipes: [docs/tutorials.md](docs/tutorials.md).

```bash
cd /Users/ssahani/tt/tt/haven
./scripts/deploy-remote.sh 175.110.122.71 sus   # UI :30742, Keycloak :30180
```

Full endpoint list: [docs/lab-host.md](docs/lab-host.md).

---

## Production overlay

`deploy/overlays/prod` is a shape, not a one-liner. Read `deploy/overlays/prod/README.md` before apply:

1. `./hack/gen-prod-secrets.sh` — do not use the placeholder password
2. Wait for CNPG, then `./hack/sync-cnpg-ca.sh` (Keycloak verifies DB TLS)
3. Issue `platform-tls` from your ClusterIssuer
4. Configure backups separately (`deploy/overlays/prod/backup/README.md`)

A `ScheduledBackup` with `method: barmanObjectStore` **fails** unless the Cluster has an object store. CNPG 1.26+ wants the Barman Cloud plugin.

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

Apache-2.0. Keycloak and CloudNativePG remain under their own licenses.
