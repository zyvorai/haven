# Roadmap

What ships in this repo today vs what the v1 controller and console will add. Operations for v0: [Getting started](getting-started.md).

## v0 — this repository
- CRDs for IdentityPlane, RealmBundle, OidcClient (`reclaimPolicy`, `suspend`)
- Compose overlays that deploy CNPG + official Keycloak Operator today
- CLI that reads the real operator admin secret and CRD presence
- Official `KeycloakRealmImport` sample (works without the Haven controller)
- Helm chart that installs RBAC only (controller/console images unpublished)
- UX and architecture specs
- Honest prod overlay: secrets, TLS, CA sync, backups called out as prerequisites

## v1 — controller + console (in progress)
- Controller with external-plane mode when operator CRDs are absent
- Live `GET /api/v1/plane/status` for Command Deck cards
- Console: login gate, Command Deck, Planes, Atlas, Realm Studio, Clients, Settings
- Password UI: console sign-in, Keycloak master admin, realm users
- Remote lab deploy script (`scripts/deploy-remote.sh`)
- Remaining: full Kubebuilder reconcile of CNPG + Keycloak Operator + cert-manager
- Remaining: bootstrap realm + console OIDC (replace local/lab login)
- Remaining: finalizer honoring `reclaimPolicy` (default Orphan)

## v1.1 — console depth
- Approvals in production profile
- Plane inspector (scale / backup / rotate)
- Backups + Time Machine screens (today: stubs in nav)

## v2 — private-cloud depth
- Multi-site status (Keycloak HA v2)
- Realm Time Machine
- Catalog of platform clients with one-click kube-apiserver recipe
- Backup restore wizard that creates a *new* plane
- Zeus OS Identity Center embed (iframe + shared OIDC session)
- OIDC console login (retire lab demo for production)

## Non-goals until someone pays for them
- Managing LDAP/AD servers
- Being a generic Postgres platform
- Replacing Keycloak Admin Console entirely
