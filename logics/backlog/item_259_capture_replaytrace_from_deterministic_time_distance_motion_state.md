## item_259_capture_replaytrace_from_deterministic_time_distance_motion_state - Capture replayTrace from deterministic time-distance motion state
> From version: 0.4.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 30%
> Complexity: High
> Theme: Simulation core
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Current replayTrace is still reconstructed from final times and TeamTracePlan rather than emitted by a motion simulation.
- This limits how credible speed ramps, gaps, pits, and overtakes can become.

# Scope
- In:
  - Add a minimal deterministic time-distance simulator inside the chrono module.
  - Track each car's distanceMeters, trackProgress, speed, elapsedTime, phase, pit state, and finished flag over bounded ticks or micro-segments.
  - Use circuit speedProfile, weather, race traits, motion parameters, and bounded acceleration/deceleration to update speed.
  - Sample ReplayTracePoint data from the motion states at the existing replay cadence unless a new cadence is documented and tested.
  - Derive final classification, final times, final gaps, and final trace order from finish crossings in the motion state.
- Out:
  - Collision physics, lane choice, continuous pack behavior, or visual rendering changes.
  - Adding new required fields to RaceResult or ReplayTracePoint unless strictly additive and justified.
  - Changing event copy or report layout.

# Acceptance criteria
- AC1: ReplayTrace points are emitted from simulated motion state, not from a final-time-only reconstruction.
- AC2: Final classification, final trace order, finish times, and final gaps agree for representative fixed seeds.
- AC3: Trace invariants hold across multiple circuits/weather/pit/card combinations: monotonic progress, finite times, bounded speed, bounded acceleration/deceleration, and deterministic repeatability.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: ReplayTrace points are emitted from simulated motion state, not from a final-time-only reconstruction.
- request-AC4 -> This backlog slice. Proof: AC2: Final classification, final trace order, finish times, and final gaps agree for representative fixed seeds.
- request-AC5 -> This backlog slice. Proof: AC3: Trace invariants hold across multiple circuits/weather/pit/card combinations: monotonic progress, finite times, bounded speed, bounded acceleration/deceleration, and deterministic repeatability.
- request-AC6 -> This backlog slice. Proof: AC3: Trace invariants hold across multiple circuits/weather/pit/card combinations: monotonic progress, finite times, bounded speed, bounded acceleration/deceleration, and deterministic repeatability.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_066_chrono_engine_v2_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Primary task(s): `task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture`

# AI Context
- Summary: Capture replayTrace from deterministic time-distance motion state
- Keywords: scaffolded-backlog, capture replaytrace from deterministic time-distance motion state, implementation-ready
- Use when: Implementing the scaffolded slice for Capture replayTrace from deterministic time-distance motion state.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
