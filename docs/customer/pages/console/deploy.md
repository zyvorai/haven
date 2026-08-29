# Deploy wizard

## Purpose

Spin up an identity plane — Postgres + Keycloak via Haven compose path.

## When to use it

- Operate **Deploy wizard** when your job matches this screen
- Prefer **Command Deck** after login if you are unsure where to start
- Confirm Keycloak connected in the sidebar status chip

## How to get there

- Route: `/deploy`
- Nav: **Sidebar → Deploy wizard**

## Operate from the console (UX)

1. Open `/deploy`.
2. Walk profile / capacity steps in the wizard.
3. **Review & Deploy →** when ready; watch toast and Deck reconcile timeline.
4. Return to Planes / Deck to confirm Phase Ready.
5. **Empty / fail:** Deploy failed toast → operators/RBAC/storage; use external Keycloak via Settings instead.
6. **Success:** Plane appears Ready; Keycloak reachable from Settings.

Console: `http://<host>:30742/` · Keycloak admin often `http://<host>:30180/admin` · Health: `GET /api/v1/health`. Never publish lab IPs — use `<host>`.

## Related pages

- [Planes](planes.md)
- [Command Deck](deck.md)
- [Getting Started](../../getting-started.md)
- [Page index](../../PAGE_INDEX.md)
