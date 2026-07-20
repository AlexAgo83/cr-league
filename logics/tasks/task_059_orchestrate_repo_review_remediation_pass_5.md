## task_059_orchestrate_repo_review_remediation_pass_5 - Orchestrate repo review remediation pass 5
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 15%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read req_045 and its orchestration task first; this pass extends the same store patterns (runWrite, guarded updateMany, memory-db compatibility) and must not regress pass-4 behavior.
- [ ] 2. Land the API items first: recovery hardening (new code format, scrypt, rate limiter, legacy upgrade), then trust-boundary and restartLeague atomicity fixes, keeping the in-memory suite green.
- [ ] 3. Add the eslint react-hooks and jsx-a11y plugins before touching the web code so the decomposition is policed by the new rules from the start.
- [ ] 4. Decompose App.tsx into domain hooks and view containers, fix the rejoin effect, dedupe rejoin, collapse command-clicked state, swap window.confirm for the Modal; then split ReplayView with useReplayClock.
- [ ] 5. Build the Postgres integration suite and its CI job (services: postgres, migrate deploy, concurrency scenarios including the restart rollback), and clean the unit lane's DATABASE_URL.
- [ ] 6. Finish the infra sweep: Dependabot, npm audit gate, vitest coverage in CI, release health-check hard-fail, engines field, reports/ gitignore policy.
- [ ] 7. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and update the roadmap patch statuses.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_135_brute_force_resistant_account_recovery`
- `item_136_api_trust_boundary_and_atomicity_fixes`
- `item_137_decompose_app_tsx_into_domain_hooks_and_views`
- `item_138_split_replayview_and_extract_the_replay_clock`
- `item_139_postgres_integration_test_ci_lane_for_concurrent_store_paths`
- `item_140_ci_lint_and_release_gate_hardening`

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
- Implementation complete.
- 2026-07-20 wave 1: implemented item_135 recovery hardening baseline: 16-byte recovery codes, salted scrypt hash format with legacy SHA-256 upgrade, in-process email/IP limiter on /profiles/recover, admin reset using the shared generator, and API tests for length, legacy upgrade, and 429 lockout. Targeted verification: rtk npm test -- apps/api/src/app.admin.test.ts; rtk npm run typecheck; rtk npm run lint.

# AI Context
- Summary: Orchestrate repo review remediation pass 5
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
