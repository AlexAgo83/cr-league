# Runtime configuration

CR League runtime secrets live in Render, not in the repository.

## Render API service

Required production variables:

- `DATABASE_URL`
- `WEB_ORIGIN`
- `VITE_API_BASE_URL`
- `ADMIN_EMAILS`
- `ADMIN_TOKEN`

## Email recovery setup

CR League has no custom domain for now. Use a dedicated Gmail account for recovery-code emails until a domain-backed transactional provider is worth the overhead.

Operator setup:

1. Create a dedicated Gmail account for CR League mail.
2. Enable two-step verification on that account.
3. Create a Gmail app password for the API service.
4. Store the SMTP values as Render API service environment variables.

Expected Render variables:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587` (or `465`; the API enables TLS mode automatically for `465`)
- `SMTP_USER=<dedicated Gmail address>`
- `SMTP_PASS=<Gmail app password>`
- `MAIL_FROM=CR League <<dedicated Gmail address>>`

Never commit the Gmail password, app password, or any real SMTP secret. Local development may use a disabled/no-op mailer unless the SMTP variables are present.

Shipped recovery endpoints:

- `POST /profiles` returns the recovery code once and sets `recoveryEmailSent: true` when SMTP accepted the creation email.
- `POST /profiles/recover` restores a profile with email plus current recovery code.
- `POST /profiles/recovery-code` accepts `{ "email": "..." }`, always returns the same neutral success body for known, unknown, cooldown, or send-failure cases, and rotates the code only when an active mailer accepts the new email.

Gmail notes:

- App passwords are account-scoped; rotate the Render `SMTP_PASS` value if the mailbox owner changes.
- Gmail has sending limits. If playtests approach those limits, move this mailer to a transactional provider instead of adding queue complexity here.
