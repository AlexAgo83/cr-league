## task_062_orchestrate_email_backed_profile_recovery - Orchestrate email-backed profile recovery
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Gate on req_058 item_135 being Done: this chain consumes its code generator, scrypt hashing, and rate limiter; do not start before it lands on main.
- [x] 2. Build the mailer module and config wiring with the injected fake and both-mode tests.
- [x] 3. Wire send-on-create with the sent flag, web copy updates, and failure tolerance.
- [x] 4. Add the Prisma cooldown migration, the neutral re-issue endpoint with limiter and cooldown, and the web request-by-email path.
- [x] 5. Update docs/runtime-configuration.md with the shipped endpoints and Gmail notes.
- [x] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and mark roadmap patch 0.4.1 shipped when released.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_146_minimal_smtp_mailer_module_and_configuration`
- `item_147_send_the_recovery_code_at_profile_creation`
- `item_148_self_service_recovery_code_re_issue_by_email`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `apps/api/src/mailer.ts`, `apps/api/src/config.ts`, and `apps/api/src/app.ts`. Proof: `sendRecoveryCode` is configured from SMTP env vars, injected like DB, and no-ops without logging codes.
- request-AC2 -> `createProfile` in `apps/api/src/features/leagues/store.ts` and web creation copy. Proof: active mailer sends the code, no-op mode still returns the code once, and failing mailer does not fail creation.
- request-AC3 -> `POST /profiles/recovery-code`. Proof: known email path generates a new item_135 code/hash, emails it, rotates the hash, and old code stops working.
- request-AC4 -> `POST /profiles/recovery-code`. Proof: known, unknown, cooldown, and send-failure paths share the same neutral 200 body; limiter still returns 429 after threshold.
- request-AC5 -> `ProfileSetupView` and EN/FR copy. Proof: recover form offers email re-issue with neutral copy, and creation copy mentions email delivery when `recoveryEmailSent` is true.
- request-AC6 -> API tests and runbook. Proof: `apps/api/src/app.admin.test.ts` covers mail-on-create, no-op/failure, re-issue rotation, neutral unknown response, rate limit, and cooldown; `docs/runtime-configuration.md` documents endpoints and Gmail notes.
- request-AC7 -> validation. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, and `rtk npm run logics:validate` passed.

# Validation
- `rtk npm run typecheck`: passed.
- `rtk npm test`: passed, 23 files passed, 1 skipped; 193 tests passed, 4 skipped.
- `rtk npm run build`: passed.
- `rtk npm run lint`: passed with the existing React Hooks warning in `apps/web/src/app/App.tsx`.
- `rtk npm run test:e2e`: passed, 4 Playwright tests.
- `rtk npm run logics:validate`: passed.
- typecheck, unit tests, build, lint, e2e, and logics validation passed; lint has only the existing React Hooks warning; audit warnings only concern unrelated future requests req_064 and req_065
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Wave 1 gate: req_058 item_135 had landed; `createRecoveryCode`, scrypt hashing, legacy upgrade, and the in-process recovery limiter are present in `apps/api/src/features/leagues/utils.ts` and `routes.ts`.
- Wave 1 implementation: added SMTP config, `createRecoveryMailer`, mailer injection, profile-creation email send flag/failure tolerance, `recoveryEmailSentAt` Prisma migration, and neutral `POST /profiles/recovery-code` re-issue with rate limiting and cooldown.
- Wave 1 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/api/src/app.admin.test.ts`.
- Wave 2 implementation: web profile creation copy now mentions emailed recovery codes when `recoveryEmailSent` is true; the recover form can request a fresh code by email with neutral copy. `docs/runtime-configuration.md` now lists the shipped profile recovery endpoints and Gmail notes.
- Wave 2 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/api/src/app.admin.test.ts`; `rtk npm test -- apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`.
- Closeout validation passed: `rtk npm run typecheck`; `rtk npm test`; `rtk npm run build`; `rtk npm run lint`; `rtk npm run test:e2e`; `rtk npm run logics:validate`.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_146_minimal_smtp_mailer_module_and_configuration`, `item_147_send_the_recovery_code_at_profile_creation`, `item_148_self_service_recovery_code_re_issue_by_email`
- Related request(s): `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`

# AI Context
- Summary: Orchestrate email-backed profile recovery
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`
- Product brief(s): `prod_025_email_backed_profile_recovery_product_brief`
- Architecture decision(s): (none yet)
