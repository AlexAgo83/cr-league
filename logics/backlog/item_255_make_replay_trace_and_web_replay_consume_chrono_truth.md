## item_255_make_replay_trace_and_web_replay_consume_chrono_truth - Make replay trace and web replay consume chrono truth
> From version: 0.4.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Replay coherence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- ReplayView and replayMath currently tolerate generated traces but still interpolate times/gaps/progress from trace points built by the old score-first flow.
- After the chrono engine lands, the web replay should need no reconstruction hacks for finishTimes, order, gaps, or car progress.

# Scope
- In:
  - Ensure replayTrace captures chrono motion at a stable cadence with cars, order, times, gaps, distanceMeters, speed, and phase for each point.
  - Update shared replay helpers only where necessary so finishTimes, traceTimesAt, traceGapsAt, carProgressAtTrace, liveClassificationByCarProgress, and replay facts consume the chrono truth.
  - Keep CircuitMap rendering and useReplayClock behavior compatible with the existing RaceResult shape.
  - Strengthen validateReplayTrace where needed for acceleration/deceleration, final-time coherence, and event/phase alignment.
- Out:
  - Visual redesign of ReplayView, CircuitMap, or overlays.
  - Changing replay speed controls or camera behavior.
  - Adding new required fields to the client unless justified as additive.

# Acceptance criteria
- AC1: Replay final order, final trace times, finish events, and classification agree.
- AC2: Existing replay UI tests pass without broad rewrites.
- AC3: validateReplayTrace catches chrono-specific coherence failures.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Replay final order, final trace times, finish events, and classification agree.
- request-AC4 -> This backlog slice. Proof: AC2: Existing replay UI tests pass without broad rewrites.
- request-AC6 -> This backlog slice. Proof: AC3: validateReplayTrace catches chrono-specific coherence failures.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`
- Primary task(s): `task_103_orchestrate_track_driven_chrono_race_engine_migration`

# AI Context
- Summary: Make replay trace and web replay consume chrono truth
- Keywords: scaffolded-backlog, make replay trace and web replay consume chrono truth, implementation-ready
- Use when: Implementing the scaffolded slice for Make replay trace and web replay consume chrono truth.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
