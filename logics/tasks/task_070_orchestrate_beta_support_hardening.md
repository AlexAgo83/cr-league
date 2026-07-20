## task_070_orchestrate_beta_support_hardening - Orchestrate beta support hardening
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Inspect current admin API, admin UI, data model, and existing runtime/release docs.
- [x] 2. Implement admin filters and 100-by-100 pagination with API and UI tests.
- [x] 3. Implement narrow confirmation-gated admin test-data cleanup with safety tests.
- [x] 4. Add backup/restore/support runbooks and known-limits documentation.
- [x] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_165_add_admin_filters_and_pagination`
- `item_166_add_safe_admin_test_data_cleanup`
- `item_167_write_beta_support_runbooks_and_known_limits`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `/admin/users` and `/admin/leagues` accept `q`, `page`, and `limit`; `apps/web/src/features/AdminConsoleView.tsx` renders filters and previous/next controls capped through API responses.
- request-AC2 -> This task. Proof: `/admin/test-data-cleanup` in `apps/api/src/features/admin/routes.ts` calls guarded cleanup with exact confirmation and returns deleted counts; web row actions require confirmation before posting selected profile/league IDs.
- request-AC3 -> This task. Proof: `apps/api/src/app.admin.test.ts` covers admin authorization, filter/pagination behavior, confirmation failures, unsafe non-test data rejection, and successful cleanup counts.
- request-AC4 -> This task. Proof: `apps/web/src/app/App.profile.test.tsx` covers admin filter controls and confirmation-gated cleanup POST from the admin console.
- request-AC5 -> This task. Proof: `docs/beta-support-runbook.md`, `docs/beta-known-limits.md`, and `docs/runtime-configuration.md` document backup, restore, support triage, test-data cleanup, and beta limits.
- request-AC6 -> This task. Proof: cleanup is admin-only, selected-ID only, rejects missing confirmation, and rejects data not clearly marked test/demo/qa/staging; no public delete or broad wipe endpoint was added.
- request-AC7 -> This task. Proof: typecheck, unit tests, build, lint, e2e, and Logics validation were run during closeout.

# Validation
- `rtk npm run typecheck`: OK.
- `rtk npm test -- apps/api/src/app.admin.test.ts apps/web/src/app/App.profile.test.tsx`: 36 passed.
- `rtk npm test`: 23 passed, 1 skipped; 207 passed, 4 skipped.
- `rtk npm run build`: OK.
- `rtk npm run lint`: OK.
- `rtk npm run test:e2e`: 4 passed.
- `rtk npm run logics:validate`: OK.
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_165_add_admin_filters_and_pagination`, `item_166_add_safe_admin_test_data_cleanup`, `item_167_write_beta_support_runbooks_and_known_limits`
- Related request(s): `req_069_beta_support_hardening`

# AI Context
- Summary: Orchestrate beta support hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_069_beta_support_hardening`
- Product brief(s): `prod_033_beta_support_hardening_product_brief`
- Architecture decision(s): (none yet)
