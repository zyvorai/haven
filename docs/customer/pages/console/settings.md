# Settings

## Purpose

Connect Haven to Keycloak and manage console appearance / passwords.

## When to use it

- Operate **Settings** when your job matches this screen
- Prefer **Command Deck** after login if you are unsure where to start
- Confirm Keycloak connected in the sidebar status chip

## How to get there

- Route: `/settings`
- Nav: **Sidebar → Settings**

## Operate from the console (UX)

1. Open `/settings`.
2. Enter Keycloak URL → **Test & connect**; expect green Connected banner.
3. Change console password or Keycloak admin password via dialogs (persist secrets before restart).
4. Open Keycloak SPI console link when connected.
5. **Empty / fail:** Connection failed → URL/network/admin creds; lab demo cannot change its password.
6. **Success:** `Connected to … · v… · N realms`; Deck status goes green.

Console: `http://<host>:30742/` · Keycloak admin often `http://<host>:30180/admin` · Health: `GET /api/v1/health`. Never publish lab IPs — use `<host>`.

## Related pages

- [Command Deck](deck.md)
- [Login](../auth/login.md)
- [Getting Started](../../getting-started.md)
- [Page index](../../PAGE_INDEX.md)
