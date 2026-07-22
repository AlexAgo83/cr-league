## item_220_move_speed_profile_motion_into_the_shared_trace_handoff - Move speed-profile motion into the shared trace handoff
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Simulation and replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current replay can apply speed-profile easing in the web layer, which improves visuals but leaves speed variation outside the canonical trace.
- If tower order, event progress, and map progress read different notions of car progress, users can see positions that do not match the ranking.
- Future simulation gameplay cannot safely use corner speed profiles until the trace boundary represents speed phases consistently.

# Scope
- In:
  - Choose the smallest shared boundary for speed-profile application: inside `simulateRace` trace generation or a shared trace-preparation helper called by simulation.
  - Emit canonical per-car progress that already reflects braking, cornering, exit recovery, straights, and pit phases for generated traces.
  - Expose speed/profile state only at the granularity needed for replay inspection and current UI consistency.
  - Update web replay math so canonical traces are rendered directly, with speed remapping reserved only for legacy adapter output if still needed.
  - Add tests proving speed-profile trace progress is deterministic, monotonic, endpoint-preserving, and aligned with events/pits/order changes.
- Out:
  - Changing elapsed finish times or winner selection.
  - Retuning card effects based on speed zones.
  - Creating a continuous physics model.

# Acceptance criteria
- AC1: Generated trace car progress already includes bounded speed-profile variation before the web renders it.
- AC2: Web replay does not double-apply speed-profile easing on canonical traces.
- AC3: Pit stops, event markers, live tower order, and final classification remain aligned after the handoff change.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Generated trace car progress already includes bounded speed-profile variation before the web renders it.
- request-AC2 -> This backlog slice. Proof: AC2: Web replay does not double-apply speed-profile easing on canonical traces.
- request-AC3 -> This backlog slice. Proof: AC3: Pit stops, event markers, live tower order, and final classification remain aligned after the handoff change.
- request-AC6 -> This backlog slice. Proof: AC3: Pit stops, event markers, live tower order, and final classification remain aligned after the handoff change.
- request-AC8 -> This backlog slice. Proof: AC3: Pit stops, event markers, live tower order, and final classification remain aligned after the handoff change.
- request-AC4 -> This backlog slice. Evidence needed: Legacy fallback behavior is isolated behind an explicit adapter or guard with tests that prove older persisted results still replay, while generated traces use stricter validation and do not silently fall back to inferred facts.
- request-AC5 -> This backlog slice. Evidence needed: A documented distance contract explains `trackLengthMeters` versus `routeLengthMeters`, identifies which one owns simulation scoring, replay pacing, and display labels, and circuit audit fails on undocumented or suspicious drift.
- request-AC7 -> This backlog slice. Evidence needed: A developer inspection artifact or command summarizes representative race-track replay traces, including progress, live order, zone, speed phase, pit moments, and distance basis for at least Prague, Monaco, Montreal, and one pit-stop race.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_096_canonical_race_track_replay_trace_and_simulation_handoff`
- Primary task(s): `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff`

# AI Context
- Summary: Move speed-profile motion into the shared trace handoff
- Keywords: scaffolded-backlog, move speed-profile motion into the shared trace handoff, implementation-ready
- Use when: Implementing the scaffolded slice for Move speed-profile motion into the shared trace handoff.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff`

# Notes
- Task `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff` was finished via `logics-manager flow finish task` on 2026-07-23.
