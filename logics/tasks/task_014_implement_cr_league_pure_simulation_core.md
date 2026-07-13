## task_014_implement_cr_league_pure_simulation_core - Implement CR League pure simulation core
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Simulation
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Execute Wave 2 from `spec_016_implementation_roadmap`.
- Implement pure shared simulation only.
- Keep API, DB, UI, and replay rendering out of scope.

# Plan
- [x] 1. Confirm scope, dependencies, and linked acceptance criteria.
- [x] 2. Add domain and card types.
- [x] 3. Add seeded PRNG.
- [x] 4. Implement segment simulation and event generation.
- [x] 5. Implement report/reward/classification output.
- [x] 6. Add deterministic tests.
- [x] 7. Run validation and close out.
- [x] 8. Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close a wave or step until the relevant automated tests and quality checks have been run successfully.

# Backlog
- `item_019_implement_cr_league_pure_simulation_core`

# Definition of Done (DoD)
- [x] Code is implemented and reviewed.
- [x] Validation passes.
- [x] Linked docs are synchronized.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: shared race/card/event/result/report types are implemented in `packages/shared/src/domain/race.ts`.
- request-AC2 -> This task. Proof: seeded PRNG is implemented in `packages/shared/src/simulation/prng.ts` and deterministic Vitest coverage passes.
- request-AC3 -> This task. Proof: `RACE_SEGMENTS` plus ordered event generation are implemented in `packages/shared/src/simulation/simulateRace.ts`.
- request-AC4 -> This task. Proof: six card definitions plus card hooks/report events are implemented in `packages/shared/src/cards/definitions.ts` and `packages/shared/src/simulation/simulateRace.ts`.
- request-AC5 -> This task. Proof: `RaceResult` includes classification, points, credits, consumed cards, position changes, and report blocks.
- request-AC6 -> This task. Proof: `packages/shared/src/simulation/simulateRace.test.ts` covers repeatability, result shape, consumed cards, and card events.
- request-AC7 -> This task. Proof: API, DB, and UI are explicitly out of scope.
- backlog-AC1 -> This task. Proof: shared simulation exports are available from `packages/shared/src/index.ts`.
- backlog-AC2 -> This task. Proof: deterministic and card/event output tests pass.
- backlog-AC3 -> This task. Proof: API/DB/UI remain out of scope.
- backlog-AC4 -> This task. Proof: validation commands passed on 2026-07-13.

# Validation
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_013_implement_cr_league_pure_simulation_core` passed with 0 findings.
- npm run typecheck; npm test; npm run build; npm run lint; npm run logics:validate; logics-manager flow validate req_013_implement_cr_league_pure_simulation_core
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Implemented a pure shared simulation core with typed race input/output contracts, first-card definitions, seeded PRNG, five-segment race resolution, event timeline, classification, rewards, consumed cards, and report blocks.
- Added focused Vitest coverage for deterministic repeatability, result shape, consumed cards, and card event handling.
- Validation passed: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `logics-manager flow validate req_013_implement_cr_league_pure_simulation_core`.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_019_implement_cr_league_pure_simulation_core`
- Related request(s): `req_013_implement_cr_league_pure_simulation_core`

# AI Context
- Summary: Implement implement cr league pure simulation core.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_013_implement_cr_league_pure_simulation_core`
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
