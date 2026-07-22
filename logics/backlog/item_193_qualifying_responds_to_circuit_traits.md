## item_193_qualifying_responds_to_circuit_traits - Qualifying responds to circuit traits
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Simulation fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- createQualifyingRuns (qualifying.ts:31-45) takes an optional numeric traits object but all three store.ts call sites (628, 649, 908) pass only the primaryTrait/secondaryTrait strings, so traits falls back to the flat default and traitBonus is constant.
- As a result no circuit characteristic affects qualifying times, contradicting the store.ts:636 comment that qualifying uses the GP's canonical track traits.

# Scope
- In:
  - Recompute the circuit via circuitIdentityForRound (as store.ts:324 does) at the qualifying call sites and pass traits: currentCircuit.traits into every createQualifyingRuns call.
  - Keep the deterministic seed convention unchanged (ADR-004).
  - Add a test asserting two circuits with different traits produce different qualifying chronos for the same seed and decision, and run balance:sim to confirm no unintended shift.
- Out:
  - Retuning the traitBonus formula magnitude.
  - Changing how the race consumes traits (already correct).
  - Adding new circuit trait fields.

# Acceptance criteria
- AC1: Qualifying chronos differ across circuits with different numeric traits for the same seed/decision.
- AC2: The store.ts:636 intent comment is accurate after the change.
- AC3: Determinism is preserved and balance:sim shows no unintended regression.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Qualifying chronos differ across circuits with different numeric traits for the same seed/decision.
- request-AC5 -> This backlog slice. Proof: AC2: The store.ts:636 intent comment is accurate after the change.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Primary task(s): `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes`

# AI Context
- Summary: Qualifying responds to circuit traits
- Keywords: scaffolded-backlog, qualifying responds to circuit traits, implementation-ready
- Use when: Implementing the scaffolded slice for Qualifying responds to circuit traits.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
