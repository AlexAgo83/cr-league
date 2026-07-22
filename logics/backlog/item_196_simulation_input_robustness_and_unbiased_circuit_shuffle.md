## item_196_simulation_input_robustness_and_unbiased_circuit_shuffle - Simulation input robustness and unbiased circuit shuffle
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Robustness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- isRaceInput (simulation/routes.ts:32-48) does not validate the optional traits object on the public /simulation/preview route, so non-numeric trait fields reach clampTrait(Math.round(...)) = NaN and poison the returned race result.
- seasonCircuitIdentities (circuits.ts:50-58) draws its Fisher-Yates swap index from LCG low bits (state % (index+1)), whose lowest bits have very short periods, skewing per-season orderings.

# Scope
- In:
  - Validate traits with a numeric guard in isRaceInput (or run normalizeRaceTraits before simulateRace) and reject non-numeric trait fields with 400.
  - Derive the shuffle swap index from the high bits of the LCG state (e.g. Math.floor(state/65536) % (index+1)) so orderings are unbiased and still seed-deterministic.
  - Extend the seasonCircuitIdentities test to keep reproducibility and assert no position is structurally pinned; add a preview test for the rejected non-numeric traits body.
- Out:
  - Replacing the LCG with a different PRNG.
  - Adding validation to internal (non-public) simulation callers that already clamp.
  - Changing the circuit catalogue contents.

# Acceptance criteria
- AC1: /simulation/preview rejects non-numeric traits with 400 and never returns NaN results.
- AC2: The per-season shuffle is unbiased and remains reproducible for a given seed.
- AC3: Tests cover both the rejected preview body and the shuffle reproducibility.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: /simulation/preview rejects non-numeric traits with 400 and never returns NaN results.
- request-AC5 -> This backlog slice. Proof: AC2: The per-season shuffle is unbiased and remains reproducible for a given seed.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Primary task(s): `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes`

# AI Context
- Summary: Simulation input robustness and unbiased circuit shuffle
- Keywords: scaffolded-backlog, simulation input robustness and unbiased circuit shuffle, implementation-ready
- Use when: Implementing the scaffolded slice for Simulation input robustness and unbiased circuit shuffle.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes` was finished via `logics-manager flow finish task` on 2026-07-22.
