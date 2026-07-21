## task_071_orchestrate_web_view_code_splitting - Orchestrate web view code splitting
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex
> Non-semantic edit: 2026-07-21 added closeout traceability proof.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Run a production build and record the current chunk sizes.
- [ ] 2. Identify the App.tsx switch points that mount garage, championship, report, and replay surfaces.
- [ ] 3. Wrap the selected views in React.lazy/Suspense with one existing-style fallback.
- [ ] 4. Run build and compare chunk output against the baseline.
- [ ] 5. Run typecheck, lint, unit tests, and private-league e2e; record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_168_lazy_load_secondary_web_views`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `GameViews`, `ResultView`, `PlanView`, and `DriveView` now use `React.lazy`/dynamic imports for Garage, Championship, Result, Report, and Replay surfaces.
- request-AC2 -> This task. Proof: each lazy boundary renders an existing-style `pending-feedback` status fallback via `status_loading_view`.
- request-AC3 -> This task. Proof: state and navigation still flow through `GameViews`/`AppShell`; unit tests and private-league e2e pass after async lazy assertions.
- request-AC4 -> This task. Proof: production build now emits `ResultView`, `ReportView`, `ReplayView`, `ChampionshipView`, and `GarageView` chunks; main JS fell from ~718.97 kB to ~676.84 kB.
- request-AC5 -> This task. Proof: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` passed on 2026-07-21.

# Validation
- Baseline build before split: main JS `index-BEXY2zb5.js` 718.97 kB / 200.89 kB gzip.
- Post-split build: main JS `index-BPqTUZ_j.js` 676.84 kB / 191.96 kB gzip, plus secondary view chunks.
- `npm run typecheck` passed on 2026-07-21.
- `npm run build` passed on 2026-07-21.
- `npm run lint` passed on 2026-07-21.
- `npm test` passed on 2026-07-21 (215 passed, 4 skipped).
- `npm run test:e2e` passed on 2026-07-21 (4 passed).
- `npm run logics:validate` re-run after closeout proof.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_168_lazy_load_secondary_web_views`
- Related request(s): `req_070_split_large_web_views_from_the_initial_bundle`

# AI Context
- Summary: Orchestrate web view code splitting
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_070_split_large_web_views_from_the_initial_bundle`
- Product brief(s): `prod_034_web_view_code_splitting_product_brief`
- Architecture decision(s): (none yet)
