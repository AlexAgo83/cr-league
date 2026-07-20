## req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue - Email-backed profile recovery: send codes on creation and self-service re-issue
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Ship rails
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Send the recovery code by email when a profile is created, so the code survives even if the player never writes it down.
- Let a player who knows their email request a fresh recovery code by email, without manual admin support.
- Introduce a minimal mailer module configured from the documented SMTP env vars, degrading to a safe no-op when they are absent, so local development and tests never send mail.

# Context
- Hard dependency: req_058 item_135 must land first. It owns createRecoveryCode (at least 16 random bytes), scrypt hashing with legacy upgrade, and the in-process rate limiter on recovery endpoints. This chain emails codes produced by that generator and reuses that limiter; it must not fork either.
- Only the hash is stored, so 're-send my code' is necessarily 're-issue': the endpoint generates a new code, replaces recoveryCodeHash, and emails the new code. The email copy must say the previous code stopped working.
- The re-issue endpoint must not enable account enumeration or takeover: it accepts only an email, always returns the same success response whether or not a profile exists, sends mail only when one does, and is rate-limited per email and per IP with the item_135 limiter. Because a re-issue rotates the hash, unauthenticated spamming would lock a victim out of their current code — the rate limit and a modest per-profile re-issue cooldown are the mitigations, and the cooldown must not leak existence through response differences.
- Transport per docs/runtime-configuration.md: SMTP (a dedicated Gmail account with app password for now), env vars SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM read in config.ts following its existing plain env pattern. When unset, the mailer is a no-op that logs intent; profile creation must keep working without SMTP configured (the code is still shown once in the onboarding panel).
- This introduces the repo's first mailer dependency (nodemailer is the standard choice); keep the mailer module small: one sendRecoveryCode function, injected into the store like db is, so tests assert on a fake mailer without network.
- Web side: profile creation currently shows the code via the onboarding panel and a status message; creation copy should mention the email when SMTP is active (the API can report whether a mail was sent). The recover form (SetupViews, ProfileMode choice/create/recover) gains a third path: request a code by email, with neutral success copy in EN and FR.
- Prisma: Profile has id, email (unique), recoveryCodeHash, timestamps. A re-issue cooldown needs one nullable timestamp field (e.g. recoveryEmailSentAt) — a single additive migration.
- Release contract stays untouched: it explicitly defers runtime secrets to runtime-configuration.md; Render env vars are operator-managed. The runbook in docs/runtime-configuration.md should gain the final endpoint names and any new operational note (e.g. Gmail sending limits) at closeout.

# Acceptance criteria
- AC1: A mailer module exposes sendRecoveryCode, is configured from SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM in config.ts, is injected like the db dependency, and degrades to a logged no-op when SMTP vars are absent; no test ever opens a network connection.
- AC2: Profile creation emails the recovery code when the mailer is active, still returns and displays the code once as today, and succeeds unchanged when the mailer is a no-op.
- AC3: A re-issue endpoint accepts an email, rotates the recovery code and hash using the item_135 generator and hashing, emails the new code, and returns an identical neutral response whether or not the profile exists.
- AC4: The re-issue path is rate-limited per email and per IP via the item_135 limiter and enforces a per-profile cooldown stored in a new nullable Profile timestamp, without leaking account existence through status codes, bodies, or the cooldown.
- AC5: The web recover flow offers the email re-issue path with neutral EN and FR copy, and creation copy mentions the email when one was sent.
- AC6: API tests cover mail-sent-on-create, no-op mode, re-issue rotation, neutral response for unknown emails, rate limit, and cooldown; the runtime-configuration runbook documents the shipped endpoints.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_025_email_backed_profile_recovery_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening.md
- logics/backlog/item_135_brute_force_resistant_account_recovery.md
- docs/runtime-configuration.md
- docs/release-contract.md
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/utils.ts
- apps/api/src/config.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/OnboardingShell.tsx
- apps/web/src/app/SetupViews.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- prisma/schema.prisma
- Roadmap patch 0.4.1. Today the recovery code is generated in createProfile, hashed into Profile.recoveryCodeHash, and the plaintext is returned exactly once in the POST /profiles response, rendered by the onboarding save-your-code panel; a player who loses it needs manual admin support (the admin console reset endpoint). No mailer module, transport, or dependency exists anywhere in the repo; docs/runtime-configuration.md already specifies the planned transport (a dedicated Gmail account over SMTP with app password) and the env vars SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, with local development running a no-op mailer when SMTP variables are absent. Sequencing: req_058 item_135 rewrites code generation (at least 16 bytes), hashing (salted scrypt with legacy upgrade), and adds rate limiting on /profiles/recover; that item explicitly excludes the email delivery path, so this chain builds on its output and must not start before it lands.

# AI Context
- Summary: Email-backed profile recovery: send codes on creation and self-service re-issue
- Keywords: request-chain-scaffold, email-backed profile recovery: send codes on creation and self-service re-issue, development-ready
- Use when: You need to implement or review the scaffolded workflow for Email-backed profile recovery: send codes on creation and self-service re-issue.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_146_minimal_smtp_mailer_module_and_configuration`
- `item_147_send_the_recovery_code_at_profile_creation`
- `item_148_self_service_recovery_code_re_issue_by_email`
