## item_146_minimal_smtp_mailer_module_and_configuration - Minimal SMTP mailer module and configuration
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Ship rails
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- No mailer, transport, or mail dependency exists in the repo; the transport and env vars are documented but unimplemented.
- Without a safe no-op mode, local development and tests would need SMTP credentials or would fail.

# Scope
- In:
  - Add nodemailer and a small mailer module exposing sendRecoveryCode(email, code, locale?) as plain text.
  - Read SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM in config.ts with the existing plain env pattern; the mailer is active only when the required vars are all present.
  - No-op implementation logs the intent (never the code itself) when SMTP is unconfigured.
  - Inject the mailer into the store/app the same way db is injected; tests use a recording fake.
- Out:
  - HTML templates, i18n-rendered email bodies beyond a simple locale switch, queues, retries beyond nodemailer defaults.
  - Provider abstractions for future ESPs.

# Acceptance criteria
- AC1: Mailer activates from env, no-ops safely without it, and never logs secret material.
- AC2: Tests exercise both modes through the injected fake with no network.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Mailer activates from env, no-ops safely without it, and never logs secret material.
- request-AC7 -> This backlog slice. Proof: AC2: Tests exercise both modes through the injected fake with no network.
- request-AC3 -> This backlog slice. Evidence needed: A re-issue endpoint accepts an email, rotates the recovery code and hash using the item_135 generator and hashing, emails the new code, and returns an identical neutral response whether or not the profile exists.
- request-AC4 -> This backlog slice. Evidence needed: The re-issue path is rate-limited per email and per IP via the item_135 limiter and enforces a per-profile cooldown stored in a new nullable Profile timestamp, without leaking account existence through status codes, bodies, or the cooldown.
- request-AC5 -> This backlog slice. Evidence needed: The web recover flow offers the email re-issue path with neutral EN and FR copy, and creation copy mentions the email when one was sent.
- request-AC6 -> This backlog slice. Evidence needed: API tests cover mail-sent-on-create, no-op mode, re-issue rotation, neutral response for unknown emails, rate limit, and cooldown; the runtime-configuration runbook documents the shipped endpoints.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_025_email_backed_profile_recovery_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`
- Primary task(s): `task_062_orchestrate_email_backed_profile_recovery`

# Implementation Notes
- Wave 1: `apps/api/src/mailer.ts` exposes `sendRecoveryCode`, activates from `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`MAIL_FROM`, and no-ops without logging the recovery code when SMTP is absent.
- Wave 1: `buildApp` accepts an injected recovery mailer; tests use a recording fake, so no test opens SMTP.
- Validation wave 1: `rtk npm run typecheck` passed; `rtk npm test -- apps/api/src/app.admin.test.ts` passed.
- Wave 2: runtime docs now document Gmail ports; the mailer enables secure mode automatically when `SMTP_PORT=465`.

# AI Context
- Summary: Minimal SMTP mailer module and configuration
- Keywords: scaffolded-backlog, minimal smtp mailer module and configuration, implementation-ready
- Use when: Implementing the scaffolded slice for Minimal SMTP mailer module and configuration.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_062_orchestrate_email_backed_profile_recovery`

# Notes
- Task `task_062_orchestrate_email_backed_profile_recovery` was finished via `logics-manager flow finish task` on 2026-07-20.
