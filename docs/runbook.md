# Haven runbook

## Install operators (once)

```bash
./deploy/operators/install.sh
make crds
```

Creates/uses namespace `keycloak` for the Keycloak Operator. Planes live in `identity`.

## Path A — product CR (controller later)

```bash
kubectl apply -f config/samples/identityplane-dev.yaml
./cli/haven doctor -n identity
```

Until the controller image exists, Path A only stores intent. Use Path B to actually run Keycloak + Postgres.

## Path B — compose today (supported in v0)

```bash
make dev
make wait
make admin
```

Admin credentials come from the **Keycloak Operator**, secret `platform-initial-admin` — not `platform-bootstrap`.

```bash
./cli/haven admin -n identity
```

Keycloak Admin Console: `http://auth.127.0.0.1.nip.io/admin`  
Import a starter realm: `make realm-import`

`kubectl apply -k deploy/overlays/dev` no longer includes a Haven `RealmBundle`, so the compose path does not require Haven CRDs. `make dev` still applies them so samples work later.

## Path C — production shape

Follow `deploy/overlays/prod/README.md`. Short version:

```bash
./hack/gen-prod-secrets.sh
make prod
kubectl -n identity wait cluster/platform-db --for=condition=Ready --timeout=600s
./hack/sync-cnpg-ca.sh
# then issue platform-tls and configure backups
```

Do not apply a ScheduledBackup until an ObjectStore plugin or volume snapshot class exists.

## Path D — Haven console on a remote lab host

```bash
./scripts/deploy-remote.sh <host> [user]
# Example: ./scripts/deploy-remote.sh 175.110.122.71 sus
```

- UI: `http://<host>:30742` (login at `/login`)
- Keycloak: `http://<host>:30180` (existing NodePort)
- Secret: `haven-keycloak-admin` in `haven-ui`

See [console.md](console.md) for auth, password UI, and env vars.

## Day-2

| Action | How |
|---|---|
| Sign in to console | `/login` — admin credentials or lab `demo`/`demo` |
| Change console password | Settings → Passwords (persist via secret for restarts) |
| Change Keycloak admin password | Settings → Passwords → Keycloak admin |
| Set realm user password | Realm Studio → Users → Set password |
| Scale Keycloak | `kubectl -n identity patch keycloak platform --type merge -p '{"spec":{"instances":5}}'` |
| Scale Postgres | patch CNPG `spec.instances` |
| Backup now | `./cli/haven backup platform -n identity --now` (volumeSnapshot) |
| Upgrade Keycloak | bump `KEYCLOAK_OPERATOR_REF` in `versions.env`, re-run `install.sh` |
| Suspend auth | scale Keycloak instances to 0; leave DB |
| Restore | CNPG recover into a *new* Cluster, point a new plane at it |

## Failure cheatsheet

| Symptom | Look at |
|---|---|
| Keycloak CrashLoop `Unable to migrate database` | CNPG not ready, password mismatch between the two Secrets, TLS verify without `platform-db-ca` |
| Ingress 404 | Service is `<cr-name>-service` → `platform-service` |
| Issuer discovery fails | hostname / `proxy.headers` / TLS SAN |
| Slow logins | pool size vs `max_connections`, lag on primary |
| After node death, auth 5xx | Keycloak instances < 2, no PDB |
| `ScheduledBackup` rejected | Cluster has no object store / plugin |

`./cli/haven doctor` is the first page of any incident.
