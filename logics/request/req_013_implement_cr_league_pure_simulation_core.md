## req_013_implement_cr_league_pure_simulation_core - Implement CR League pure simulation core
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Simulation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Implement the CR League Wave 2 pure simulation core in `packages/shared`.
- Provide deterministic seeded race simulation with typed inputs and outputs.
- Generate segment events, classification, rewards, consumed cards, and report blocks without API, DB, or UI dependencies.
- Cover the first six cards from the V1 card set.

# Context
- `spec_011_simulation_algorithm_v0` defines the intended algorithm.
- `spec_001_grand_prix_core_loop_and_simulation_v1` defines the race phase model.
- `spec_002_card_set_v1` names the first six vertical-slice cards.
- The current code foundation has `packages/shared` ready for pure domain logic.

# Acceptance criteria
- AC1: Shared domain types exist for race participants, decisions, cards, events, results, and reports.
- AC2: A seeded PRNG is used; same seed and inputs produce the same output.
- AC3: Simulation resolves five race segments and produces an ordered event timeline.
- AC4: The first six cards have implemented hooks or explicit report/event handling.
- AC5: Simulation produces final classification, points, credits, consumed cards, standings-like result data, and report blocks.
- AC6: Deterministic tests cover repeatability, card/event behavior, and basic result shape.
- AC7: No API, database, or UI dependency is introduced.

# AC Traceability
- AC1 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: shared race/card/event/result/report types in `packages/shared/src/domain/race.ts`.
- AC2 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: seeded PRNG in `packages/shared/src/simulation/prng.ts`; repeatability test passes.
- AC3 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: five-segment simulation and ordered event timeline in `packages/shared/src/simulation/simulateRace.ts`.
- AC4 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: six card definitions plus explicit card event/report hooks.
- AC5 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: `RaceResult` includes classification, points, credits, consumed cards, position changes, and report blocks.
- AC6 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: `packages/shared/src/simulation/simulateRace.test.ts`.
- AC7 -> `task_014_implement_cr_league_pure_simulation_core`. Proof: no API, database, or UI file changed for runtime integration.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `spec_011_simulation_algorithm_v0`
- `spec_001_grand_prix_core_loop_and_simulation_v1`
- `spec_002_card_set_v1`
- `adr_008_testing_quality`

# AI Context
- Summary: Draft a bounded request for implement cr league pure simulation core.
- Keywords: simulation, seeded-prng, race-events, cards, shared-package
- Use when: Implementing or reviewing the pure CR League simulation core.
- Skip when: Working on API persistence, frontend screens, or deployment.

# Backlog
- `item_019_implement_cr_league_pure_simulation_core`
