## item_226_represent_pit_stops_as_entry_stop_and_exit_trace_phases - Represent pit stops as entry stop and exit trace phases
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 15%
> Complexity: Medium
> Theme: Replay realism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Pit stops are currently aligned better than before, but they can still read as a point event rather than a small sequence.
- A realistic replay needs visible deceleration into the pit, a stable stop, and acceleration back onto the route.
- Pit sequencing must stay tied to canonical pit progress and event timing.

# Scope
- In:
  - Emit canonical pit phases such as `pit_entry`, `pit_stop`, and `pit_exit` in the generated car trace.
  - Use existing pit lane progress, event progress, and deterministic pit duration data.
  - Keep event markers, director beats, tower ordering, and visible time loss aligned with the phase sequence.
  - Add focused tests for a pit-stop race covering entry, stop, exit, marker placement, and live order changes.
  - Expose pit phase data in the developer trace inspection artifact.
- Out:
  - Changing pit strategy selection or pit duration balance.
  - Drawing a separate pit lane route unless a later visual request needs it.
  - Manual per-circuit pit-lane geometry.

# Acceptance criteria
- AC1: Canonical pit-stop traces include entry, stop, and exit phases.
- AC2: The car slows, stops, and rejoins without marker or tower desync.
- AC3: Tests cover at least one pit-stop scenario end to end.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Canonical pit-stop traces include entry, stop, and exit phases.
- request-AC4 -> This backlog slice. Proof: AC2: The car slows, stops, and rejoins without marker or tower desync.
- request-AC8 -> This backlog slice. Proof: AC3: Tests cover at least one pit-stop scenario end to end.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Represent pit stops as entry stop and exit trace phases
- Keywords: scaffolded-backlog, represent pit stops as entry stop and exit trace phases, implementation-ready
- Use when: Implementing the scaffolded slice for Represent pit stops as entry stop and exit trace phases.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
