## item_252_define_the_chrono_engine_contract_and_motion_parameter_mapping - Define the chrono engine contract and motion parameter mapping
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Engine design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current simulateRace flow has a split truth: abstract scores decide classification, while replayTrace reconstructs movement afterward.
- A track-driven chrono engine needs explicit input/output contracts and a complete mapping from existing gameplay concepts into motion parameters before implementation starts, otherwise cards or decisions can silently become meaningless.

# Scope
- In:
  - Document the internal engine contract: inputs, motion state, tick/micro-segment cadence, outputs, tie-breakers, and compatibility with RaceInput/RaceResult.
  - Define a deterministic mapping from current scores/decisions/cards/traits/weather/pit strategies into motion parameters such as topSpeed, acceleration, braking, cornering, wetGrip, consistency, attack, defense, reliability, and pit behavior.
  - Record which existing helpers remain for calibration only and which become runtime truth.
  - Add targeted unit tests for the pure parameter-mapping helper so every current decision/card path affects at least one runtime parameter.
- Out:
  - Implementing the full tick simulation in this slice.
  - Retuning all numeric values through balance sim.
  - Changing public API/database contracts.

# Acceptance criteria
- AC1: A new internal contract document or module-level comment explains the chrono engine source of truth and migration boundaries.
- AC2: Every current approach, preparation, pit strategy, and race card maps to at least one motion parameter or explicitly documented non-motion reward.
- AC3: Mapping tests fail if a card/decision becomes written-but-unread.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A new internal contract document or module-level comment explains the chrono engine source of truth and migration boundaries.
- request-AC2 -> This backlog slice. Proof: AC2: Every current approach, preparation, pit strategy, and race card maps to at least one motion parameter or explicitly documented non-motion reward.
- request-AC6 -> This backlog slice. Proof: AC3: Mapping tests fail if a card/decision becomes written-but-unread.
- request-AC4 -> This backlog slice. Evidence needed: Motion remains arcade-realistic and valid: no backwards progress, no impossible speed, bounded acceleration/deceleration, plausible pit entry/stop/exit, and overtake phases line up with actual order changes.
- request-AC5 -> This backlog slice. Evidence needed: Determinism is proven across repeated runs for representative seeds/circuits/weather/pit/card combinations, and balance simulations show acceptable distributions for winner spread, gap spread, card impact, weather impact, and pit strategy impact.
- request-AC7 -> This backlog slice. Evidence needed: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run balance:sim (or a bounded documented subset), and npm run logics:validate pass, with validation evidence recorded at task closeout.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`
- Primary task(s): `task_103_orchestrate_track_driven_chrono_race_engine_migration`

# AI Context
- Summary: Define the chrono engine contract and motion parameter mapping
- Keywords: scaffolded-backlog, define the chrono engine contract and motion parameter mapping, implementation-ready
- Use when: Implementing the scaffolded slice for Define the chrono engine contract and motion parameter mapping.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_103_orchestrate_track_driven_chrono_race_engine_migration`

# Notes
- Task `task_103_orchestrate_track_driven_chrono_race_engine_migration` was finished via `logics-manager flow finish task` on 2026-07-23.
