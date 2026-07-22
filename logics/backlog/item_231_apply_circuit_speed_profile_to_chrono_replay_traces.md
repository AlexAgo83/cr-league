## item_231_apply_circuit_speed_profile_to_chrono_replay_traces - Apply circuit speed profile to chrono replay traces
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 65%
> Complexity: Medium
> Theme: Replay parity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Chrono traces currently advance linearly through the lap even when the circuit has corner speed-profile spans.
- Grand Prix traces already apply circuit speed-profile effects in the shared trace handoff, so chrono replay motion can look inconsistent on the same circuit.
- Fixing this in the web renderer would risk a second independent mapping instead of making the generated trace canonical.

# Scope
- In:
  - Add an optional `speedProfile` input to `createQualifyingRuns` and `createQualifyingReplayTrace`.
  - Pass `trackSpeedProfileForCircuit(circuit)` from each league chrono creation call site in `apps/api/src/features/leagues/store.ts`.
  - Apply the profile when writing `cars[teamId].trackProgress` for generated chrono traces.
  - Preserve `progress`, `times`, final time, lap count, and deterministic output.
  - Add a focused test showing a chrono trace with a non-empty speed profile is not linear while the final point remains complete.
- Out:
  - Changing qualifying lap-time formulas.
  - Adding a second speed-profile remap in the web replay consumer.
  - Changing legacy persisted traces.

# Acceptance criteria
- AC1: All league chrono generation call sites pass the circuit speed profile.
- AC2: Generated chrono car progress reflects the speed profile and still finishes at 1.0.
- AC3: Focused qualifying tests cover deterministic speed-profile output and unchanged final trace timing.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: All league chrono generation call sites pass the circuit speed profile.
- request-AC5 -> This backlog slice. Proof: AC2: Generated chrono car progress reflects the speed profile and still finishes at 1.0.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_098_chrono_replay_race_track_parity`
- Primary task(s): `task_099_orchestrate_chrono_replay_race_track_parity`

# AI Context
- Summary: Apply circuit speed profile to chrono replay traces
- Keywords: scaffolded-backlog, apply circuit speed profile to chrono replay traces, implementation-ready
- Use when: Implementing the scaffolded slice for Apply circuit speed profile to chrono replay traces.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
