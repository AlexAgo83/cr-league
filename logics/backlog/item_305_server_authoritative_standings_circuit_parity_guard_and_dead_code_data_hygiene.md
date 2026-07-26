## item_305_server_authoritative_standings_circuit_parity_guard_and_dead_code_data_hygiene - Server-authoritative standings, circuit parity guard, and dead-code/data hygiene
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 82%
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
