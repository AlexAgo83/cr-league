## task_064_orchestrate_lap_scale_coherence_fix - Orchestrate lap-scale coherence fix
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 70
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
- [ ] 5. Coordinate file overlap with req_062 (ReplayView) by rebasing on whichever lands first.
- [ ] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_152_map_simulation_laps_to_circuit_laps_at_the_display_boundary`

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
- Wave 1 diagnosis: GP resolution already passes `currentCircuit.laps` into `/resolve` and the replay trace/clock uses that scale. The raw leak was the canonical event lap scale from `lapForSegment()` (`1/2/5/8/10`) flowing into display surfaces.
- Wave 1 implementation: introduced the shared `lapDisplay.ts` boundary mapper, routed report key moments and recap/verdict lap interpolation through it, and remapped precomputed replay director fact laps from beat progress.
- Chrono check: qualifying remains isolated on the intentional 1..3 attempt scale; no GP mapping depends on chrono laps.
- Wave 1 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/features/ReportView.test.tsx apps/web/src/app/helpers.test.ts apps/web/src/features/ReplayView.test.ts apps/web/src/i18n/index.test.ts`.

# AI Context
- Summary: Orchestrate lap-scale coherence fix
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`
- Product brief(s): `prod_027_lap_scale_coherence_product_brief`
- Architecture decision(s): (none yet)
