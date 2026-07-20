## task_064_orchestrate_lap_scale_coherence_fix - Orchestrate lap-scale coherence fix
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Scope guard: keep chrono attempt laps and Grand Prix laps separate. Chrono uses a deliberate 3-lap scale (`laps: 3` through qualifying), while resolved GP display must use `currentCircuit.laps`; the fix must not make the GP mapper depend on the chrono scale.

# Plan
- [x] 1. Diagnose the lap-scale source: inspect simulateRace's lap loop and what callers pass; confirm whether the fix is a missing parameter wire or a canonical-scale design, and record it.
- [x] 2. Implement the boundary mapping aligned with the replay clock's scaling and route all consumers through it.
- [x] 3. Add the 3-lap fixture invariant test and verify marker/callout/clock agreement on a short circuit manually once.
- [x] 4. Verify chrono replay still uses its intentional 1..3 attempt scale and is not treated as the Grand Prix lap reference.
- [x] 5. Coordinate file overlap with req_062 (ReplayView) by rebasing on whichever lands first.
- [x] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_152_map_simulation_laps_to_circuit_laps_at_the_display_boundary`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `ReportView.test.tsx` short-GP fixture asserts raw laps 5/10 do not render and displayed laps stay within the 3-lap circuit scale.
- request-AC2 -> This task. Proof: `lapDisplay.ts` centralizes GP display mapping and report/recap/replay consumers call it instead of formatting raw `RaceEvent.lap`.
- request-AC3 -> This task. Proof: key moments and replay markers/director facts use the same progress-to-circuit-lap calculation as the replay clock.
- request-AC4 -> This task. Proof: targeted report/replay tests passed; full `rtk npm test` passed with 184 tests and 4 skipped.
- request-AC5 -> This task. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, and `rtk npm run logics:validate` passed.
- request-AC6 -> This task. Proof: qualifying remains on its intentional 1..3 path; GP labels use `currentCircuit.laps` and no chrono value is used as the GP reference.

# Validation
- Passed: `rtk npm run typecheck`.
- Passed: `rtk npm test` (184 passed, 4 skipped).
- Passed: `rtk npm run lint`.
- Passed: `rtk npm run build`.
- Passed: `rtk npm run test:e2e` (4 passed).
- Passed: `rtk npm run logics:validate` (0 blocking issues).
- Passed: `rtk logics-manager lint --require-status`.
- rtk npm run typecheck; rtk npm test; rtk npm run lint; rtk npm run build; rtk npm run test:e2e; rtk npm run logics:validate; rtk logics-manager lint --require-status
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Wave 1 diagnosis: GP resolution already passes `currentCircuit.laps` into `/resolve` and the replay trace/clock uses that scale. The raw leak was the canonical event lap scale from `lapForSegment()` (`1/2/5/8/10`) flowing into display surfaces.
- Wave 1 implementation: introduced the shared `lapDisplay.ts` boundary mapper, routed report key moments and recap/verdict lap interpolation through it, and remapped precomputed replay director fact laps from beat progress.
- Chrono check: qualifying remains isolated on the intentional 1..3 attempt scale; no GP mapping depends on chrono laps.
- Wave 1 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/features/ReportView.test.tsx apps/web/src/app/helpers.test.ts apps/web/src/features/ReplayView.test.ts apps/web/src/i18n/index.test.ts`.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_152_map_simulation_laps_to_circuit_laps_at_the_display_boundary`
- Related request(s): `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`

# AI Context
- Summary: Orchestrate lap-scale coherence fix
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`
- Product brief(s): `prod_027_lap_scale_coherence_product_brief`
- Architecture decision(s): (none yet)
