## item_152_map_simulation_laps_to_circuit_laps_at_the_display_boundary - Map simulation laps to circuit laps at the display boundary
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Race simulation realism and replay coherence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- RaceEvent.lap carries the simulation's internal lap scale and every consumer formats it raw, so a 3-lap circuit reports key moments at laps 5, 8, and 10 and a finish at lap 10.
- Only long circuits masked the mismatch; the catalog ranges from 3 to 12 laps.

# Scope
- In:
  - Diagnose where the simulation's lap count comes from and whether callers fail to wire the circuit's laps into it; record the finding in the task.
  - Implement one pure mapping from simulation lap to displayed lap (aligned with the replay clock's existing time-to-lap scaling) and route every consumer through it: ReportView key moments, helpers.ts recap interpolations, ReplayView callouts and seek-marker aria-labels, and any finish-line copy.
  - Add a short-circuit (3-lap) fixture test asserting every displayed lap is within 1..circuitLaps and the finish maps to the final lap; keep long-circuit tests green.
  - Document the mapping at its definition so future event-producing features use it.
- Out:
  - Changing simulateRace outcomes, internal lap loops, or the trace format.
  - Key-moment selection, dedup, or recap wording (req_060, req_062).

# Acceptance criteria
- AC1: No player-visible lap number exceeds the circuit's lap count on any catalog circuit.
- AC2: All event-consuming surfaces share the single mapping.
- AC3: Marker positions, replay clock, and stated laps agree.
- AC4: Short-circuit fixture test locks the invariant; existing tests pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: No player-visible lap number exceeds the circuit's lap count on any catalog circuit.
- request-AC2 -> This backlog slice. Proof: AC2: All event-consuming surfaces share the single mapping.
- request-AC3 -> This backlog slice. Proof: AC3: Marker positions, replay clock, and stated laps agree.
- request-AC4 -> This backlog slice. Proof: AC4: Short-circuit fixture test locks the invariant; existing tests pass.
- request-AC5 -> This backlog slice. Proof: AC4: Short-circuit fixture test locks the invariant; existing tests pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_027_lap_scale_coherence_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`
- Primary task(s): `task_064_orchestrate_lap_scale_coherence_fix`

# AI Context
- Summary: Map simulation laps to circuit laps at the display boundary
- Keywords: scaffolded-backlog, map simulation laps to circuit laps at the display boundary, implementation-ready
- Use when: Implementing the scaffolded slice for Map simulation laps to circuit laps at the display boundary.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
