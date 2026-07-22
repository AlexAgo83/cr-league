## item_229_make_weather_visible_in_replay_handling - Make weather visible in replay handling
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 65%
> Complexity: Medium
> Theme: Replay realism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Weather affects race context, but replay motion can look similar across dry, light rain, and heavy rain.
- Weather should be visible through braking and acceleration behavior before it changes balance.
- Adding weather too early can hide trace alignment bugs, so it should depend on canonical trace and gap stability.

# Scope
- In:
  - Apply bounded trace-level modifiers from existing weather facts: dry baseline, light rain slightly longer braking, heavy rain slower corners and softer exits.
  - Use existing circuit speed-profile spans and zone metadata instead of route projection logic.
  - Keep weather modifiers deterministic and visible in the developer trace inspection artifact.
  - Add tests comparing dry, light-rain, and heavy-rain trace behavior on the same representative circuit.
  - Document that this slice does not rebalance race outcomes.
- Out:
  - Changing weather probability, weather event generation, or race scoring.
  - Wet-line, standing-water, tire-choice, or grip-map simulation.
  - New weather UI.

# Acceptance criteria
- AC1: Weather changes trace-level braking/corner/exit behavior in a bounded deterministic way.
- AC2: Dry, light rain, and heavy rain remain distinguishable in inspection/tests.
- AC3: Final results and economy outputs are unchanged by this visual realism layer.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Weather changes trace-level braking/corner/exit behavior in a bounded deterministic way.
- request-AC7 -> This backlog slice. Proof: AC2: Dry, light rain, and heavy rain remain distinguishable in inspection/tests.
- request-AC8 -> This backlog slice. Proof: AC3: Final results and economy outputs are unchanged by this visual realism layer.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Make weather visible in replay handling
- Keywords: scaffolded-backlog, make weather visible in replay handling, implementation-ready
- Use when: Implementing the scaffolded slice for Make weather visible in replay handling.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
