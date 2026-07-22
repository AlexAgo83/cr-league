## item_216_apply_speed_profiles_to_replay_motion_without_changing_race_outcomes - Apply speed profiles to replay motion without changing race outcomes
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Replay cars currently follow canonical trace progress with limited local speed variation, so distance-faithful playback lacks the natural rhythm of braking and acceleration.
- Changing simulation trace times directly would risk desyncing tower gaps, events, overtakes, pit stops, and classification.
- The replay needs visual speed variation that respects canonical race facts but stays a rendering concern.

# Scope
- In:
  - Add replay math that maps canonical race progress through the circuit speed profile for visual car progress only.
  - Apply a small, bounded slowdown before/through high-curvature spans and mild recovery/boost on exits or long straights.
  - Preserve monotonic progress and keep final progress, pit-stop holds, event markers, director beats, and tower ordering aligned with canonical trace data.
  - Use existing replay/CircuitMap patterns and no new dependency.
  - Add focused tests for straight, tight-corner, and pit-stop traces proving the visual mapping is deterministic, monotonic, and endpoint-preserving.
- Out:
  - Changing `simulateRace` elapsed times or event generation.
  - Changing replay speed menu labels or global speed multiplier again.
  - Adding new UI copy or controls for speed profiles.

# Acceptance criteria
- AC1: Replay car motion visibly slows near generated corner spans and recovers on exit/straight spans.
- AC2: The visual progress mapping is deterministic, monotonic, and reaches the same endpoints as the canonical trace.
- AC3: Pit-stop marker alignment, event markers, tower gaps, and final classification remain driven by canonical replay data.

# Implementation notes
- Replay now remaps visual lap progress through the circuit speed profile by integrating speed factors over a normalized lap.
- The remap is applied only to displayed car progress; canonical trace progress, timing, event markers, tower gaps, and classification stay unchanged.
- Pit phases keep raw trace progress so pit-stop holds remain aligned with pit markers.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Replay car motion visibly slows near generated corner spans and recovers on exit/straight spans.
- request-AC4 -> This backlog slice. Proof: AC2: The visual progress mapping is deterministic, monotonic, and reaches the same endpoints as the canonical trace.
- request-AC6 -> This backlog slice. Proof: AC3: Pit-stop marker alignment, event markers, tower gaps, and final classification remain driven by canonical replay data.
- request-AC5 -> This backlog slice. Proof: Replay remapping changes displayed car progress only; simulation and balance files are untouched.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_095_canonical_corner_speed_profile_for_replay_motion`
- Primary task(s): `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion`

# AI Context
- Summary: Apply speed profiles to replay motion without changing race outcomes
- Keywords: scaffolded-backlog, apply speed profiles to replay motion without changing race outcomes, implementation-ready
- Use when: Implementing the scaffolded slice for Apply speed profiles to replay motion without changing race outcomes.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion`

# Notes
- Task `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion` was finished via `logics-manager flow finish task` on 2026-07-23.
