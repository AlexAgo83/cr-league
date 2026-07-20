# Beta Known Limits

Share these limits with testers before a hosted beta session.

## Accounts and recovery

- Profiles are recovered by email plus recovery code.
- Recovery codes are sensitive; support can reset them from the admin console.
- Gmail SMTP is the current mailer. Delivery can be delayed or rate-limited by Gmail.

## Admin support

- Admin access is not a full authentication system. It depends on a profile email allowlist plus the server `ADMIN_TOKEN`.
- Admin list screens show 100 rows per page and support simple server-backed filters.
- Test-data cleanup is intentionally narrow. It only accepts explicitly selected IDs and clearly marked test/demo/qa/staging data.

## Gameplay beta scope

- Race outcomes are deterministic from the stored league state and submitted plans.
- Plan risk summaries are advisory only. They do not change simulation, card consumption, or API payloads.
- A player should run chronos before locking a plan if they want the grid context to be meaningful.

## Operational limits

- Render owns production secrets and deploy hooks. Local `.env` files must not be shared.
- Database backups are manual before broad beta maintenance.
- There is no self-service account deletion flow for public users.
- There is no undo button for admin cleanup; restore requires a database backup.

