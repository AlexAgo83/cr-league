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
- Grands Prix do not auto-resolve. The league creator resolves them from `Direction de course`.
- Pending players can receive one manual plan reminder per season when SMTP is configured; there is no scheduled reminder loop.
- Absent-player defaults are neutral and commissioner-controlled. The next pass still needs to make default-plan use more visible in the confirmation/report UI.
- Starting the next season is explicit and creator-controlled after the season-end state.

## Operational limits

- Render owns production secrets and deploy hooks. Local `.env` files must not be shared.
- Database backups are manual before broad beta maintenance.
- There is no self-service account deletion flow for public users.
- There is no undo button for admin cleanup; restore requires a database backup.
