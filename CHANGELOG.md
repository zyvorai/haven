# Changelog

All notable changes to Haven are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Haven Guard: deterministic OIDC/Keycloak security posture scoring and drift detection, a live `/api/v1/security/posture` + SARIF API, an offline `haven-audit` CI CLI, and a console Guard page
- Time Machine: immutable per-realm recovery points with drift diff (clients, users, roles, groups, IdPs, access bindings) and safe restore into a new realm
- Credential Center: confidential-client secret inventory, rotation with overlap detection, and explicit retirement, never exposing the previous secret
- Federation Hub: guided onboarding templates for Microsoft Entra ID, Google Workspace, GitHub, generic OIDC, and SAML 2.0, with secret/certificate redaction on every response
- Optional persistent console volume (`console.persistence`) for durable Time Machine history, restricted to `console.replicas=1`

## [0.1.0] — 2026-09-04

### Added

- Initial Haven identity plane: compose overlays, console, controller scaffolding, Helm chart, and documentation
- Full Apache License 2.0 `LICENSE` and `NOTICE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, DCO
- GitHub Actions CI and Dependabot
- Published multi-arch images and Helm chart to GHCR:
  - `ghcr.io/zyvorai/haven-console:0.1.0`
  - `ghcr.io/zyvorai/haven-controller:0.1.0`
  - `oci://ghcr.io/zyvorai/charts/haven:0.1.0`

[Unreleased]: https://github.com/zyvorai/haven/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/zyvorai/haven/releases/tag/v0.1.0
