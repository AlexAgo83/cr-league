## task_013_align_scaffold_with_cr_league_engineering_adrs - Align scaffold with CR League engineering ADRs
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Align scaffold structure with ADRs before Wave 2.
- Keep the change deliberately small: no gameplay, no DB, no full i18n.

# Plan
- [x] 1. Confirm scope, dependencies, and linked acceptance criteria.
- [x] 2. Move API health route into `features/health`.
- [x] 3. Move web app shell into `app/`.
- [x] 4. Split web CSS into `styles/tokens.css`, `styles/base.css`, and `styles/layout.css`.
- [x] 5. Add lightweight organization markers for future feature/ui/lib folders.
- [x] 6. Run validation.
- [x] 7. Close out Logics and leave repository commit-ready.
- [x] 8. Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close a wave or step until the relevant automated tests and quality checks have been run successfully.

# Backlog
- `item_018_align_scaffold_with_cr_league_engineering_adrs`

# Definition of Done (DoD)
- [x] Scaffold alignment code is implemented and reviewed.
- [x] Validation passes.
- [x] Linked docs are synchronized.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: API health route now lives in `apps/api/src/features/health/routes.ts`.
- request-AC2 -> This task. Proof: web app shell now lives under `apps/web/src/app/`.
- request-AC3 -> This task. Proof: web CSS is split into `apps/web/src/styles/tokens.css`, `base.css`, and `layout.css`.
- request-AC4 -> This task. Proof: lightweight organization markers exist for API `db`/`simulation` and web `features`/`ui`/`lib`.
- request-AC5 -> This task. Proof: simulation, full i18n, database model, and gameplay UI are out of scope for this task.
- request-AC6 -> This task. Proof: validation commands passed on 2026-07-13.
- backlog-AC1 -> This task. Proof: code organization now reflects the ADR direction for API features and web app/styles folders.
- backlog-AC2 -> This task. Proof: existing health and app shell behavior still pass tests and build.
- backlog-AC3 -> This task. Proof: later waves remain excluded from this task.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager audit --group-by-doc`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `npm test`.
- Run `npm run lint`.
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_012_align_scaffold_with_cr_league_engineering_adrs` passed with 0 findings.
- npm run typecheck passed; npm run build passed; npm test passed; npm run lint passed; npm run logics:validate passed; logics-manager flow validate req_012_align_scaffold_with_cr_league_engineering_adrs passed with 0 findings.
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Scaffold aligned with engineering ADRs.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_018_align_scaffold_with_cr_league_engineering_adrs`
- Related request(s): `req_012_align_scaffold_with_cr_league_engineering_adrs`

# AI Context
- Summary: Implement align scaffold with cr league engineering adrs.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_012_align_scaffold_with_cr_league_engineering_adrs`
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
