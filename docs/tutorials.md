# Haven tutorials

Operator recipes for the console. The published customer manuals live on zyvor.dev:

- [Haven manual](https://zyvor.dev/docs/haven-manual)
- [Common workflows](https://zyvor.dev/docs/haven-manual/workflows)
- [Page-by-page guides](https://zyvor.dev/docs/haven-manual/pages)

## Quick recipes (lab)

### Verify deploy

```bash
cd /Users/ssahani/tt/tt/haven
./scripts/deploy-remote.sh 175.110.122.71 sus
open http://175.110.122.71:30742/login
```

Lab URLs: [lab-host.md](lab-host.md).

Sign in → **Command Deck** (connected + Ready) → **Planes** → **Atlas**.

### Create realm + user

1. `/realms` → Create realm  
2. Open realm → **Users** → Invite user (optional temp password)  
3. **Set password** if you need a permanent credential  

### Mint client secret

1. Realm → **Clients** → Mint client (confidential)  
2. **Secret** or **Rotate** → copy once  

### Passwords

| What | Where |
|------|--------|
| Console sign-in | Settings → Passwords → Change console password |
| Keycloak master admin | Settings → Passwords → Change Keycloak admin |
| Realm user | Realm → Users → Set password |

Persist console / Keycloak admin changes in `haven-keycloak-admin` (or `HAVEN_CONSOLE_*`) before pod restart.

See also [console.md](console.md) and [runbook.md](runbook.md).
