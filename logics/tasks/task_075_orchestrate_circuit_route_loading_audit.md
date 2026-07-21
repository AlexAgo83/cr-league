## task_075_orchestrate_circuit_route_loading_audit - Orchestrate circuit route loading audit
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

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Measurement shows route data is meaningful but below the agreed lazy-loading threshold, so the safe closeout is a documented deferral with a future trigger.

# Plan
- [x] 1. Measure the current route module size contribution using the smallest available tooling.
- [x] 2. Decide whether the measured cost crosses the threshold for lazy loading.
- [x] 3. Record that dynamic circuit route imports are not triggered by the current measurement.
- [x] 4. If no, close the work as a documented deferral with evidence.
- [x] 5. Run typecheck, lint, tests, build, and private-league e2e.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_172_measure_and_decide_on_circuit_route_lazy_loading`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready.

# AC Traceability
- request-AC1 -> This task. Proof: `docs/audits/circuit-route-loading-audit-2026-07-21.md` records repeatable route source, esbuild metafile, gzip, and Vite sourcemap measurements.
- request-AC2 -> This task. Proof: route lazy loading is deferred until route geometry exceeds 75 KB gzip, 30% of production main chunk source share, or 40 detailed route modules.
- request-AC3 -> This task. Proof: lazy loading was not implemented because the measured cost is below threshold, preserving existing synchronous CircuitMap, replay, chrono, and GP behavior.
- request-AC4 -> This task. Proof: the closeout report documents why the current estimated 51,084-byte gzip route chunk does not justify async loading/error states yet.
- request-AC5 -> This task. Proof: typecheck, lint, full unit tests, build, e2e, and Logics gates passed.

# Validation
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed: 25 passed, 1 skipped; 227 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run test:e2e` passed: 4 Playwright tests.
- `npm run build -w @cr-league/web -- --sourcemap` passed for route measurement.
- `npm run logics:validate` passed after workflow closeout.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Added `docs/audits/circuit-route-loading-audit-2026-07-21.md` with repeatable measurement commands and results.
- Measured 25 route modules at 272,877 source bytes; esbuild attributed 269,329 JS output bytes to route modules and a 51,084-byte gzip route chunk.
- Vite sourcemap source share was 272,877 of 1,257,948 source bytes, or 21.69% of the production index chunk source content.
- Decision: defer dynamic route loading until route geometry exceeds 75 KB gzip, 30% production main chunk source share, or 40 detailed route modules.
- No web runtime code changed for this audit slice.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_172_measure_and_decide_on_circuit_route_lazy_loading`
- Related request(s): `req_074_audit_circuit_data_impact_before_optimizing_route_loading`

# AI Context
- Summary: Orchestrate circuit route loading audit
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_074_audit_circuit_data_impact_before_optimizing_route_loading`
- Product brief(s): `prod_038_circuit_route_loading_audit_product_brief`
- Architecture decision(s): (none yet)
