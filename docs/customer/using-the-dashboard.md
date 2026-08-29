# Using the Dashboard

Haven’s console is the day-2 identity operator surface over Keycloak (and optional CloudNativePG).

## Shell chrome

| Element | Job |
|---------|-----|
| Sidebar | Command Deck · Deploy · Planes · Realm Studio · Clients · Atlas · Settings |
| Status chip | Keycloak connected / version / realm count · plane phase |
| Command palette | `⌘K` / `Ctrl+K` |
| Top bar / mobile nav | Same destinations on small viewports |

Backups / Approvals may appear as placeholders (`#`) until shipped — ignore for production recipes.

## Operate tips

1. Always confirm **Connected** on Deck or Settings before realm work.
2. Create realms in **Realm Studio**; mint OIDC clients under **Clients** or realm detail.
3. Persist password changes in secrets before pod restart — see [Passwords](passwords.md).
4. Never paste lab IPs into runbooks — use `<host>`.

## Related

- [Getting Started](getting-started.md)
- [Page index](PAGE_INDEX.md)
- [Command Deck](pages/console/deck.md)
