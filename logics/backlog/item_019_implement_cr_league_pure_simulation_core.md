## item_019_implement_cr_league_pure_simulation_core - Implement CR League pure simulation core
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Simulation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- CR League needs a deterministic simulation core before API persistence or frontend gameplay can be meaningful.
- The simulation must be pure and testable, so later API/UI work can consume stable contracts.

# Scope
- In:
  - shared race domain types.
  - seeded PRNG.
  - first six card definitions/effects.
  - five-segment simulation.
  - event timeline generation.
  - classification, points, credits, consumed cards, report blocks.
  - focused deterministic tests.
- Out:
  - API endpoints.
  - Prisma schema changes.
  - persisted race resolution.
  - React UI.
  - replay rendering.
  - final balance tuning.

# Acceptance criteria
- AC1: Pure simulation exports are available from `@cr-league/shared`.
- AC2: Tests prove deterministic behavior and card/event output.
- AC3: No API/DB/UI scope is introduced.
- AC4: Validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: shared race domain types are in scope.
- request-AC2 -> This backlog slice. Proof: seeded PRNG is in scope.
- request-AC3 -> This backlog slice. Proof: five-segment event timeline is in scope.
- request-AC4 -> This backlog slice. Proof: first six card effects are in scope.
- request-AC5 -> This backlog slice. Proof: classification/rewards/report output is in scope.
- request-AC6 -> This backlog slice. Proof: deterministic tests are in scope.
- request-AC7 -> This backlog slice. Proof: API/DB/UI are out of scope.

# Decision framing
- Product framing: Not needed
- Architecture framing: Required.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_013_implement_cr_league_pure_simulation_core`
- Primary task(s): `task_014_implement_cr_league_pure_simulation_core`

# AI Context
- Summary: Implement CR League pure simulation core
- Keywords: backlog, promote, slice, implement cr league pure simulation core
- Use when: You need a bounded backlog item for Implement CR League pure simulation core.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: The simulation core is the first real gameplay implementation wave.

# Notes
- Generated locally by logics-manager.
- Task `task_014_implement_cr_league_pure_simulation_core` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_014_implement_cr_league_pure_simulation_core`
