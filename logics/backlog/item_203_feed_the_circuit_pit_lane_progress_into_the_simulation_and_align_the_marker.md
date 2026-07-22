## item_203_feed_the_circuit_pit_lane_progress_into_the_simulation_and_align_the_marker - Feed the circuit pit-lane progress into the simulation and align the marker
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- resolveCurrentGrandPrix hardcodes pitLaneProgress: 0.5 (store.ts:724), so the car always stops at half a lap regardless of where the pit is drawn.
- The map draws the pit from geometry and the car from the sim value with a start-line offset (stageProgress/progressFromStart, CircuitMap.tsx:354), so the two only align if the sim is fed the from-start pit fraction.

# Scope
- In:
  - Replace the hardcoded 0.5 in resolveCurrentGrandPrix with the circuit's shared pitLaneProgress, and pass the same value into the qualifying, preview, and demo/default sim inputs.
  - Ensure the map marker and the car both resolve to the same drawn position (feed the from-start value to the sim so progressFromStart maps the car back onto the raw pitProgress the marker uses).
  - Add a test asserting the sim's pit target progress equals the map's drawn pit progress after the start-line offset, for a representative set of circuits.
- Out:
  - Changing the replay dwell/time-vs-distance behavior.
  - Altering pit-stop cost or the number of stops.
  - Reworking the resolve request contract beyond dropping the hardcoded value.

# Acceptance criteria
- AC1: The simulation stops a pitting car at the circuit's geometry-derived pit position, not 0.5.
- AC2: On the replay map, the pitting car's rendered pose equals the drawn pit-garage marker for every tested circuit.
- AC3: Replays stay seed-deterministic and the full validation suite passes.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The simulation stops a pitting car at the circuit's geometry-derived pit position, not 0.5.
- request-AC3 -> This backlog slice. Proof: AC2: On the replay map, the pitting car's rendered pose equals the drawn pit-garage marker for every tested circuit.
- request-AC4 -> This backlog slice. Proof: AC3: Replays stay seed-deterministic and the full validation suite passes.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_053_pit_stop_visual_alignment_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map`
- Primary task(s): `task_090_orchestrate_pit_stop_visual_alignment`

# AI Context
- Summary: Feed the circuit pit-lane progress into the simulation and align the marker
- Keywords: scaffolded-backlog, feed the circuit pit-lane progress into the simulation and align the marker, implementation-ready
- Use when: Implementing the scaffolded slice for Feed the circuit pit-lane progress into the simulation and align the marker.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
