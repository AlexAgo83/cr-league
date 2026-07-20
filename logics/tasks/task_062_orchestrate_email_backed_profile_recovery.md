## task_062_orchestrate_email_backed_profile_recovery - Orchestrate email-backed profile recovery
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 75%
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
- [ ] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and mark roadmap patch 0.4.1 shipped when released.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_146_minimal_smtp_mailer_module_and_configuration`
- `item_147_send_the_recovery_code_at_profile_creation`
- `item_148_self_service_recovery_code_re_issue_by_email`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Wave 1 gate: req_058 item_135 had landed; `createRecoveryCode`, scrypt hashing, legacy upgrade, and the in-process recovery limiter are present in `apps/api/src/features/leagues/utils.ts` and `routes.ts`.
- Wave 1 implementation: added SMTP config, `createRecoveryMailer`, mailer injection, profile-creation email send flag/failure tolerance, `recoveryEmailSentAt` Prisma migration, and neutral `POST /profiles/recovery-code` re-issue with rate limiting and cooldown.
- Wave 1 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/api/src/app.admin.test.ts`.
- Wave 2 implementation: web profile creation copy now mentions emailed recovery codes when `recoveryEmailSent` is true; the recover form can request a fresh code by email with neutral copy. `docs/runtime-configuration.md` now lists the shipped profile recovery endpoints and Gmail notes.
- Wave 2 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/api/src/app.admin.test.ts`; `rtk npm test -- apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`.

# AI Context
- Summary: Orchestrate email-backed profile recovery
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`
- Product brief(s): `prod_025_email_backed_profile_recovery_product_brief`
- Architecture decision(s): (none yet)
