# Roadmap

## v0 — this repository
- CRDs for IdentityPlane, RealmBundle, OidcClient (`reclaimPolicy`, `suspend`)
- Compose overlays that deploy CNPG + official Keycloak Operator today
- CLI that reads the real operator admin secret and CRD presence
- Official `KeycloakRealmImport` sample (works without the Haven controller)
- Helm chart that installs RBAC only (controller/console images unpublished)
- UX and architecture specs
- Honest prod overlay: secrets, TLS, CA sync, backups called out as prerequisites

## v1 — controller
- Kubebuilder reconcilers
- Profile defaults + pass-through raw Keycloak spec
- cert-manager Certificate
- Bootstrap realm + console OIDC
- Status conditions projected from both operators
- Finalizer honoring `reclaimPolicy` (default Orphan)

## v1.1 — console
- Command Deck, wizard, plane inspector, Realm Studio
- Approvals in production profile
- Command palette
- Dark private-cloud visual language

## v2 — private-cloud depth
- Multi-site status (Keycloak HA v2)
- Realm Time Machine
- Catalog of platform clients with one-click kube-apiserver recipe
- Backup restore wizard that creates a *new* plane
- Zeus OS Identity Center embed (iframe + shared OIDC session)

## Non-goals until someone pays for them
- Managing LDAP/AD servers
- Being a generic Postgres platform
- Replacing Keycloak Admin Console entirely
