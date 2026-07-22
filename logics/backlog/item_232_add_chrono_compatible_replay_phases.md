## item_232_add_chrono_compatible_replay_phases - Add chrono-compatible replay phases
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Replay parity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Chrono traces currently mark all moving points as `racing`, so the start lacks the launch semantics recently added to race traces.
- Solo chronos need only the phases that match a single-car lap.
- Adding race-only phases would make the replay vocabulary less trustworthy.

# Scope
- In:
  - Emit `grid` at the first trace point, `launch` during a small bounded early progress window, `racing` for the rest of the moving lap, and `finished` at completion.
  - Keep phase transitions deterministic and based on trace progress rather than wall-clock animation state.
  - Use existing `ReplayTracePoint.cars[].phase` vocabulary where possible.
  - Add a focused test proving the generated chrono trace contains `launch` and no race-only phases.
  - Document the deliberate exclusion of pit, overtake, defense, and gap-spacing phases.
- Out:
  - Reaction-time, false-start, or clutch modeling.
  - Overtake, pit, defending, or traffic phases.
  - New director beat types unless the existing chrono beats need a tiny label alignment.

# Acceptance criteria
- AC1: Chrono traces expose `grid`, `launch`, `racing`, and `finished` in the expected order.
- AC2: No race-only phases are emitted by solo chrono trace generation.
- AC3: Phase tests pass without changing final chrono result data.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Chrono traces expose `grid`, `launch`, `racing`, and `finished` in the expected order.
- request-AC5 -> This backlog slice. Proof: AC2: No race-only phases are emitted by solo chrono trace generation.
- request-AC6 -> This backlog slice. Proof: AC3: Phase tests pass without changing final chrono result data.
- request-AC4 -> This backlog slice. Evidence needed: `npm run replay:inspect` or an equivalent existing inspection command includes representative chrono traces for Prague, Monaco, and Montreal, with progress, phase, speed, and weather context.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_098_chrono_replay_race_track_parity`
- Primary task(s): `task_099_orchestrate_chrono_replay_race_track_parity`

# AI Context
- Summary: Add chrono-compatible replay phases
- Keywords: scaffolded-backlog, add chrono-compatible replay phases, implementation-ready
- Use when: Implementing the scaffolded slice for Add chrono-compatible replay phases.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_099_orchestrate_chrono_replay_race_track_parity`

# Notes
- Task `task_099_orchestrate_chrono_replay_race_track_parity` was finished via `logics-manager flow finish task` on 2026-07-23.
