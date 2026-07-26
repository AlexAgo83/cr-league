## item_305_server_authoritative_standings_circuit_parity_guard_and_dead_code_data_hygiene - Server-authoritative standings, circuit parity guard, and dead-code/data hygiene
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Season standings/champion and tie-breaks are computed only client-side (helpers.ts:103) with no server source of truth.
- circuitRouteFor returns [] for an unknown layoutKey (silent blank-track fallback) with no parity guard.
- storeCore.ts is an orphaned near-duplicate barrel; several exports/types are dead; CIRCUIT_SPEED_PROFILES is ~776 lines of data in a logic file.

# Scope
- In:
  - Compute and persist final season standings/champion server-side on season close (client keeps rendering, winner is authoritative).
  - Assert circuit identity↔route parity at module load or in a test so a missing route fails loudly.
  - Delete storeCore.ts and the dead exports/types (applyChronoDeltas, motionParametersForParticipant, BotArchetype, WeatherForecast, ReportBlock, ReplayDirectorBeatFact), and move CIRCUIT_SPEED_PROFILES into a .data.ts/JSON module keeping the functions.
- Out:
  - Changing standings math (only relocate it to an authoritative source).
  - Removing live game data (route/identity tables stay).

# Acceptance criteria
- AC1: Final season standings/champion are persisted server-side.
- AC2: Circuit identity↔route parity fails loudly on a missing route.
- AC3: storeCore.ts, dead exports/types, and the in-logic speed-profile literal are removed/relocated; gates pass.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Final season standings/champion are persisted server-side.
- request-AC2 -> This backlog slice. Evidence needed: The duplicated-and-diverged helpers (lapForSegment, lapForProgress, speed-profile factor, classificationScore, strongestForecast, bestQualifyingRuns, clamps, safeHex) exist once in shared and are consumed everywhere; each formerly-divergent one is reconciled to one documented behavior covered by a test.
- request-AC3 -> This backlog slice. Evidence needed: Replay order/classification/gap derivation has one shared definition (moved beside replayTrace or emitted by the sim), and a golden/determinism test pins a fixed-seed trace's interpolated positions; replayMath is no longer an untested client re-derivation of the trace format.
- request-AC4 -> This backlog slice. Evidence needed: lifecycle.ts is decomposed by responsibility and App.tsx orchestration is extracted into per-domain hooks, with the store's public surface and all API responses unchanged (pure refactor, tests green).
- request-AC5 -> This backlog slice. Evidence needed: vitest enforces a coverage threshold gated in CI, and unit tests exist for season rollover + the (leagueId,season,round) concurrency guard, resolution standings/credit application, and the comeback bonus math + cap.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Primary task(s): `task_123_orchestrate_the_source_of_truth_remediation`

# AI Context
- Summary: Server-authoritative standings, circuit parity guard, and dead-code/data hygiene
- Keywords: scaffolded-backlog, server-authoritative standings, circuit parity guard, and dead-code/data hygiene, implementation-ready
- Use when: Implementing the scaffolded slice for Server-authoritative standings, circuit parity guard, and dead-code/data hygiene.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_123_orchestrate_the_source_of_truth_remediation`

# Notes
- Task `task_123_orchestrate_the_source_of_truth_remediation` was finished via `logics-manager flow finish task` on 2026-07-26.
