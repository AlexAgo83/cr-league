## task_051_orchestrate_secured_admin_operations_console - Orchestrate secured admin operations console
> From version: 0.3.8
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read `apps/api/src/config.ts`, `apps/api/src/app.ts`, league routes/store, Prisma schema, profile-menu code in `App.tsx`, i18n catalogs, and existing API/web tests.
- [ ] 2. Implement the admin API slice first: config token, admin route registration, auth guard, profile list/reset/delete, league list, and read-only league inspection.
- [ ] 3. Verify the recovery-code reset model: do not expose `recoveryCodeHash`, and prove the new code works through existing recovery flow.
- [ ] 4. Implement the web admin slice: profile-menu entry, session-token capture, Users and Leagues tabs, reset/delete confirmations, and admin league inspection state.
- [ ] 5. Localize all new copy in EN and FR.
- [ ] 6. Run focused API tests, focused App tests, `npm run lint`, `npm run typecheck`, and `npm test`; record closeout evidence.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_126_add_secured_admin_api_operations`
- `item_127_add_profile_menu_admin_console_ui`

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

# AI Context
- Summary: Orchestrate secured admin operations console
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_050_add_a_secured_admin_operations_console`
- Product brief(s): `prod_021_admin_operations_console_product_brief`
- Architecture decision(s): (none yet)
