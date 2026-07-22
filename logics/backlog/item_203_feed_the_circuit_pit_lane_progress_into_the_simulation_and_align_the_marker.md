## item_203_feed_the_circuit_pit_lane_progress_into_the_simulation_and_align_the_marker - Feed the circuit pit-lane progress into the simulation and align the marker
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85
> Progress: 100%
> Complexity: Low
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The sim halts the car at hardcoded pitLaneProgress: 0.5 (store.ts:724) and the map draws the marker from its OWN independently-derived pitProgress (CircuitMap.tsx:240,247) — two origins that must instead both READ the single canonical value from item_202.
- The car is projected with stageProgress = progressFromStart(progress, startProgress) (CircuitMap.tsx:354); the marker aligns with the car only if it is drawn with the SAME projection fed the same canonical value, so alignment must be structural, not a matched pair of separate derivations.

# Scope
- In:
  - Sim: replace the hardcoded 0.5 in resolveCurrentGrandPrix with the circuit's canonical pitLaneProgress, and pass the same value into the qualifying, preview, and demo/default sim inputs.
  - Map: draw the pit marker with the same projection used for cars -- poseOnRoute(renderPoints, stageProgress(pitLaneProgress)) -- instead of the independent pitProgress; remove analyzeCircuitRoute's pitProgress/pitStop self-derivation and route the pitLapProgress / pitStopTraceProgress consumers (replayMath.ts:166 and callers) to the canonical value.
  - Because the marker is then "where a car at pitLaneProgress is drawn," alignment is structural; add a test asserting the sim's pit target progress equals the drawn marker progress across a representative set of circuits.
- Out:
  - Changing the replay dwell/time-vs-distance behavior.
  - Altering pit-stop cost or the number of stops.
  - Keeping any second, independent pit-position derivation anywhere.

# Acceptance criteria
- AC1: The simulation and the map both read the one canonical pitLaneProgress; neither computes an independent pit position.
- AC2: The map draws the marker with the same projection as cars, so a pitting car's rendered pose equals the marker for every tested circuit.
- AC3: Replays stay seed-deterministic and the full validation suite passes.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Sim and map both read the one canonical pitLaneProgress; no independent pit derivation remains.
- request-AC3 -> This backlog slice. Proof: AC2: The marker is drawn with the car projection, so the pitting car's pose equals the marker for every tested circuit.
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

# Tasks
- `task_090_orchestrate_pit_stop_visual_alignment`

# Notes
- Task `task_090_orchestrate_pit_stop_visual_alignment` was finished via `logics-manager flow finish task` on 2026-07-22.
