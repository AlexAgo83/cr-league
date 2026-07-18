## item_113_add_deterministic_grid_start_staging_to_replay - Add deterministic grid start staging to replay
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay start clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Replay starts currently look like a crowded marker around the start line, not a race launch.
- The first seconds set the tone for the replay, so a weak start makes the whole replay feel technical instead of fun.
- The fix belongs in presentation timing, not in simulation trace generation.

# Scope
- In:
  - Add a deterministic grid-start window to `ReplayView.tsx` or its local replay-plan helpers.
  - Render cars with readable progress/offset separation at progress near zero.
  - Transition from staged grid positions into existing trace-driven movement over a short bounded window.
  - Keep tower order and final classification semantics unchanged.
  - Add tests for deterministic start positions, transition bounds, and final-order preservation.
  - Coordinate with `item_111_add_a_readable_staged_grid_start_beat_to_race_replay`; either implement this backlog as the fuller version or mark that item consumed/superseded during closeout.
- Out:
  - Changing qualifying grid calculation.
  - Changing `simulateRace` trace points solely for presentation.
  - Adding countdown audio, start lights art, or a formation lap.
  - Replacing the current SVG route renderer.

# Acceptance criteria
- AC1: At replay progress zero, at least the field's first visible cluster is separated enough to read multiple cars instead of one stack.
- AC2: Seeking inside the start window gives stable deterministic positions.
- AC3: After the start window, car progress converges into the existing replay movement without jumps larger than the documented transition bound.
- AC4: Tower order and final classification remain unchanged.
- AC5: Desktop and mobile screenshots or e2e checks show a readable race start.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: At replay progress zero, at least the field's first visible cluster is separated enough to read multiple cars instead of one stack.
- request-AC6 -> This backlog slice. Proof: AC2: Seeking inside the start window gives stable deterministic positions.
- request-AC7 -> This backlog slice. Proof: AC3: After the start window, car progress converges into the existing replay movement without jumps larger than the documented transition bound.
- request-AC8 -> This backlog slice. Proof: AC4: Tower order and final classification remain unchanged.
- request-AC9 -> This backlog slice. Proof: AC5: Desktop and mobile screenshots or e2e checks show a readable race start.
- request-AC10 -> This backlog slice. Proof: AC5: Desktop and mobile screenshots or e2e checks show a readable race start.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Primary task(s): `task_049_orchestrate_replay_spectacle_fun_pass`

# AI Context
- Summary: Add deterministic grid start staging to replay
- Keywords: scaffolded-backlog, add deterministic grid start staging to replay, implementation-ready
- Use when: Implementing the scaffolded slice for Add deterministic grid start staging to replay.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_049_orchestrate_replay_spectacle_fun_pass`

# Notes
- Task `task_049_orchestrate_replay_spectacle_fun_pass` was finished via `logics-manager flow finish task` on 2026-07-18.
