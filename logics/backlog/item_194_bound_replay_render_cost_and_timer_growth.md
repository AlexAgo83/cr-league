## item_194_bound_replay_render_cost_and_timer_growth - Bound replay render cost and timer growth
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Web performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- CircuitMap recomputes circuitScene (CircuitMap.tsx:330), analyzeCircuitRoute (CircuitMap.tsx:352, an O(n^2) scan at 224-233), and routeFitTransform on every render, and it re-renders on every replay rAF tick because ReplayView setSnapshot passes a fresh cars array per frame.
- useReplayClock (useReplayClock.ts:88-92) pushes pop-timer ids into positionPopTimers.current but never splices fired timers, so the array grows across long replays.

# Scope
- In:
  - Wrap circuitScene, analyzeCircuitRoute, and routeFitTransform in useMemo keyed on circuit (deriving the analyses from the memoized scene) so they run once per circuit, not per frame.
  - Capture each pop-timer id and splice it out of positionPopTimers.current inside its own callback, keeping the bulk-clear on seek/unmount.
  - Confirm no visual change to the map or the position-pop animation.
- Out:
  - Changing the rAF loop or the per-frame snapshot contract.
  - Reworking CircuitMap's projection or tiling math.
  - Broader memoization of unrelated components.

# Acceptance criteria
- AC1: The circuit scene and route analysis are computed once per circuit, not per replay frame.
- AC2: The pop-timer array does not grow unbounded across a long replay.
- AC3: Map rendering and position-pop behavior are visually unchanged.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The circuit scene and route analysis are computed once per circuit, not per replay frame.
- request-AC5 -> This backlog slice. Proof: AC2: The pop-timer array does not grow unbounded across a long replay.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Primary task(s): `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes`

# AI Context
- Summary: Bound replay render cost and timer growth
- Keywords: scaffolded-backlog, bound replay render cost and timer growth, implementation-ready
- Use when: Implementing the scaffolded slice for Bound replay render cost and timer growth.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
