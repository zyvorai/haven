# Haven console

The Haven console is a Go API (`haven-console`) with an embedded React UI. It operates Keycloak through the Admin API and shows live IdentityPlane health from `haven-controller`.

## Surfaces

| Route | Purpose |
|---|---|
| `/login` | Axiom-style sign-in (local / Keycloak admin / lab demo) |
| `/deck` | Command Deck — plane health cards + reconcile timeline |
| `/planes` | Fleet list of IdentityPlane instances |
| `/atlas` | Topology: Console → Ingress → Keycloak → Postgres |
| `/realms` | Realm Studio — tenants, users, clients, IdPs, events |
| `/clients` | Cross-realm OIDC clients |
| `/deploy` | Deploy wizard (intent / profile) |
| `/settings` | Keycloak connection, theme, password changes |

Console routes (except `/` and `/login`) require a Bearer session. Unauthenticated API calls return `401`.

## Authentication

| Method | Credentials | Notes |
|---|---|---|
| Lab demo | `demo` / `demo` | Enabled when `HAVEN_LAB_LOGIN` is empty/`1`/`true` |
| Local console | `HAVEN_CONSOLE_USER` / `HAVEN_CONSOLE_PASSWORD`, else Keycloak admin env | Role `admin` |
| Keycloak admin | Connected URL + master admin user/password | Validates via Admin token; reconnects Manager |

Sessions live in memory (~12h). Sign out revokes the token.

### Change passwords (UI)

- **Settings → Passwords → Change console password** — updates in-process local sign-in (persist with secret / env for restarts).
- **Settings → Passwords → Change Keycloak admin password** — resets master-realm admin and reconnects Haven.
- **Realm Studio → Users → Set password** — resets any realm user (optional temporary flag).

Lab `demo` cannot change its own password.

## Lab remote deploy

```bash
./scripts/deploy-remote.sh <host> [user]
./scripts/deploy-remote.sh 175.110.122.71 sus
./scripts/deploy-remote.sh 175.110.122.71 sus --quick   # skip image rebuild
```

Defaults: UI NodePort `30742`, Keycloak NodePort `30180`, image tag `dev`.

Required secret (synced by the script): `haven-keycloak-admin` in namespace `haven-ui` with Keycloak admin username/password.

Environment on the console Deployment:

```text
KEYCLOAK_URL=http://<host>:30180
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=<from secret>
HAVEN_LAB_LOGIN=1
```

## Local UI development

```bash
make ui-install
make ui-dev          # Vite → http://localhost:5173
go run ./cmd/haven-console
```

API is under `/api/v1`. The Vite proxy (when configured) forwards to the local Go server.

## External plane mode

When CNPG / Keycloak Operator CRDs are absent, the controller reports `phase: Ready` with Postgres `external`. The console still talks to a live Keycloak Admin URL from Settings / env.
