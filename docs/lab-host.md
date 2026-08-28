# Lab host — 175.110.122.71

Shared lab machine for Haven console development and OIDC integration testing.

> Run all deploy commands from the **Haven repo root**.

---

## Endpoints

| Service | URL |
|---|---|
| **Haven console** | [http://175.110.122.71:30742](http://175.110.122.71:30742) |
| **Console login** | [http://175.110.122.71:30742/login](http://175.110.122.71:30742/login) |
| **Keycloak admin** | [http://175.110.122.71:30180/admin](http://175.110.122.71:30180/admin) |
| **OIDC issuer** | `http://175.110.122.71:30180/realms/master` |
| **OIDC discovery** | `http://175.110.122.71:30180/realms/master/.well-known/openid-configuration` |

### Kubernetes layout

| Component | Namespace | Exposure |
|---|---|---|
| Keycloak | `argus-enterprise` | NodePort **30180** (`8080:30180`) |
| Haven console | `haven-ui` | NodePort **30742** |

Only the **`master`** realm exists on this host today. Create tenants in Haven console → **Realm Studio** or Keycloak admin.

---

## Deploy / refresh console

```bash
./scripts/deploy-remote.sh 175.110.122.71 sus
./scripts/deploy-remote.sh 175.110.122.71 sus --quick   # skip image rebuild
./scripts/deploy-remote.sh 175.110.122.71 sus --uninstall
```

The script:

- Rsyncs the repo to the host
- Builds and loads the console image (unless `--quick`)
- Applies manifests in `deploy/k8s/ui/`
- Syncs Keycloak admin credentials into secret `haven-keycloak-admin` (`haven-ui`)

Sign in: lab `demo` / `demo`, or Keycloak admin — see [console.md → Authentication](console.md#authentication).

---

## Wire OIDC clients

Use the **issuer URL**, not the admin console root:

```text
http://175.110.122.71:30180/realms/master
```

### Example — Hermes dashboard

```text
HERMES_DASHBOARD_OIDC_ISSUER=http://175.110.122.71:30180/realms/master
HERMES_DASHBOARD_OIDC_CLIENT_ID=hermes-dashboard
HERMES_DASHBOARD_PUBLIC_URL=http://175.110.122.71:9119
```

Register redirect URI in Keycloak: `http://175.110.122.71:9119/auth/callback` (public PKCE client, no secret).

Platform SSO catalog for private-cloud clients: [private-cloud.md](private-cloud.md).

---

## SSH and health checks

```bash
ssh -i ~/.ssh/id_ed25519_hyper2kvm sus@175.110.122.71
```

On the host:

```bash
kubectl get svc -n argus-enterprise keycloak
kubectl get svc -n haven-ui
curl -s http://127.0.0.1:30180/realms/master/.well-known/openid-configuration | head
```

---

## Port notes

| Port | What |
|---|---|
| **30180** | Lab Keycloak (use this) |
| **8080** | Different app (login-gated) — **not** Keycloak |
| **8180** | Separate HTTPS Keycloak instance — not used by this stack |

---

## Related docs

- [Getting started → Lab host](getting-started.md#lab-host-remote-console)
- [Console](console.md) — auth, env vars, local dev
- [Tutorials → Verify deploy](tutorials.md#verify-deploy)
- [CLI → Remote deploy](cli.md#remote-deploy-script)
