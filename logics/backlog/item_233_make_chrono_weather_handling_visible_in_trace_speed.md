## item_233_make_chrono_weather_handling_visible_in_trace_speed - Make chrono weather handling visible in trace speed
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay parity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Chrono weather affects lap-time calculation, but the generated replay trace speed metadata is currently too flat to show dry versus rainy handling.
- The race replay work already made weather visible as bounded trace-level speed changes.
- Chrono should show the same kind of handling cue without changing the qualifying time model.

# Scope
- In:
  - Use existing qualifying weather progression and circuit speed-profile spans to lower trace `speed` on rainy and non-straight portions.
  - Keep the effect deterministic and bounded, with final `times` derived from the existing chrono visual duration.
  - Prefer a small shared helper only if it avoids duplicating an already-existing race speed-profile/weather calculation.
  - Add a test comparing dry and heavy-rain chrono traces on the same seed/profile.
  - Keep the web renderer as a consumer of generated trace metadata.
- Out:
  - Retuning lap-time weather penalties.
  - Changing card/preparation outcomes.
  - Adding wet-line, tire-temperature, or grip physics.

# Acceptance criteria
- AC1: Heavy-rain chrono traces expose lower relevant `speed` metadata than dry traces on the same profile.
- AC2: Chrono final time and deterministic generated run behavior remain stable for equal inputs.
- AC3: Tests cover dry versus rainy trace speed without asserting fragile animation details.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Heavy-rain chrono traces expose lower relevant `speed` metadata than dry traces on the same profile.
- request-AC5 -> This backlog slice. Proof: AC2: Chrono final time and deterministic generated run behavior remain stable for equal inputs.
- request-AC4 -> This backlog slice. Evidence needed: `npm run replay:inspect` or an equivalent existing inspection command includes representative chrono traces for Prague, Monaco, and Montreal, with progress, phase, speed, and weather context.
- request-AC6 -> This backlog slice. Evidence needed: The corpus explicitly documents that pit stops, overtakes, defense, and multi-car gap spacing are not chrono parity requirements for this solo-run scope.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_098_chrono_replay_race_track_parity`
- Primary task(s): `task_099_orchestrate_chrono_replay_race_track_parity`

# AI Context
- Summary: Make chrono weather handling visible in trace speed
- Keywords: scaffolded-backlog, make chrono weather handling visible in trace speed, implementation-ready
- Use when: Implementing the scaffolded slice for Make chrono weather handling visible in trace speed.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_099_orchestrate_chrono_replay_race_track_parity`

# Notes
- Task `task_099_orchestrate_chrono_replay_race_track_parity` was finished via `logics-manager flow finish task` on 2026-07-23.
