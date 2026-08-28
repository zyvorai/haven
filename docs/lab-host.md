# Lab host — 175.110.122.71

**Always start from the Haven repo root:**

```bash
cd /Users/ssahani/tt/tt/haven
```

All scripts, `make` targets, and `./cli/haven` commands assume this directory.

## Endpoints

| Service | URL |
|---|---|
| **Haven console** | `http://175.110.122.71:30742` |
| **Console login** | `http://175.110.122.71:30742/login` |
| **Keycloak admin** | `http://175.110.122.71:30180/admin` |
| **OIDC issuer** | `http://175.110.122.71:30180/realms/master` |
| **OIDC discovery** | `http://175.110.122.71:30180/realms/master/.well-known/openid-configuration` |

Keycloak runs in namespace **`argus-enterprise`** as Deployment `keycloak`, exposed on NodePort **`30180`** (`8080:30180`).

Haven console runs in namespace **`haven-ui`**, NodePort **`30742`**.

## Deploy / refresh console

```bash
cd /Users/ssahani/tt/tt/haven
./scripts/deploy-remote.sh 175.110.122.71 sus
./scripts/deploy-remote.sh 175.110.122.71 sus --quick   # skip image rebuild
```

The script syncs Keycloak admin credentials into secret `haven-keycloak-admin` (`haven-ui`).

## Wire OIDC clients (Hermes, Grafana, etc.)

Use the issuer URL — not the admin console root:

```text
http://175.110.122.71:30180/realms/master
```

Example — Hermes dashboard:

```text
HERMES_DASHBOARD_OIDC_ISSUER=http://175.110.122.71:30180/realms/master
HERMES_DASHBOARD_OIDC_CLIENT_ID=hermes-dashboard
HERMES_DASHBOARD_PUBLIC_URL=http://175.110.122.71:9119
```

Register redirect URI in Keycloak: `http://175.110.122.71:9119/auth/callback` (public PKCE client, no secret).

## SSH

```bash
ssh -i ~/.ssh/id_ed25519_hyper2kvm sus@175.110.122.71
```

Quick checks on the host:

```bash
kubectl get svc -n argus-enterprise keycloak
kubectl get svc -n haven-ui
curl -s http://127.0.0.1:30180/realms/master/.well-known/openid-configuration | head
```

## Notes

- Port **8080** on this host is a different app (login-gated), not Keycloak.
- Port **8180** is a separate HTTPS Keycloak instance; the lab stack uses **30180**.
- Only the **`master`** realm exists on this host today. Create tenants in Haven console → Realm Studio or Keycloak admin.

See also [console.md](console.md) and [runbook.md](runbook.md).
