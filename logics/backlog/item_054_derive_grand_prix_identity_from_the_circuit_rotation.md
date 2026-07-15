## item_054_derive_grand_prix_identity_from_the_circuit_rotation - Derive Grand Prix identity from the circuit rotation
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: GP identity ground truth
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- startNextGrandPrix and league creation copy DEMO_RACE_INPUT.primaryTrait/secondaryTrait/forecast for every round, so all Grands Prix are mechanically identical.
- The per-circuit identity data (traits, likelyWeather) already exists but lives web-side in apps/web/src/app/circuits.ts where the API cannot use it.
- Trait-based recap advice, briefing telemetry, and preparation stakes are all hollow while GP inputs never vary.

# Scope
- In:
  - Move the circuit identity table (city, country, layoutKey, laps, traits, likelyWeather) and circuitForRound rotation to packages/shared; keep route geometry web-side keyed by the same circuit identifier.
  - Map each circuit's identity to sim inputs: primaryTrait/secondaryTrait from its dominant trait scores, forecast from likelyWeather — one small deterministic mapping function with a unit test.
  - Use the mapping in league creation and startNextGrandPrix instead of DEMO_RACE_INPUT constants; keep seeds deterministic as they are.
  - Re-derive existing test expectations that pin race outcomes to the old constant inputs (same PRNG, new inputs); do not loosen assertions.
  - Verify the 3-GP e2e loop passes with varying traits.
- Out:
  - New traits, weather types, or sim behavior changes.
  - Changing the rotation order or adding circuits.
  - Any recap copy change (later items).

# Acceptance criteria
- AC1: Two consecutive Grands Prix in a league have different trait/forecast inputs whenever their circuits differ.
- AC2: The identity table exists once, in packages/shared, consumed by API and web; the web route geometry still renders CircuitMap unchanged.
- AC3: The identity-to-sim-input mapping is deterministic and unit-tested.
- AC4: All gates pass with expectations re-derived, including the 3-GP e2e loop.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Two consecutive Grands Prix in a league have different trait/forecast inputs whenever their circuits differ.
- request-AC2 -> This backlog slice. Proof: AC2: The identity table exists once, in packages/shared, consumed by API and web; the web route geometry still renders CircuitMap unchanged.
- request-AC9 -> This backlog slice. Proof: AC3: The identity-to-sim-input mapping is deterministic and unit-tested.
- request-AC10 -> This backlog slice. Proof: AC4: All gates pass with expectations re-derived, including the 3-GP e2e loop.
- request-AC5 -> This backlog slice. Evidence needed: The 'directive' recap card adds a computed verdict: preparation judged against resolved weather across segments, played card judged against its triggered events and their deltas, approach judged against final positionChange — each verdict phrased from parameterized templates in EN and FR.
- request-AC6 -> This backlog slice. Evidence needed: The 'next GP' lesson names the actual next round's circuit and its dominant trait or likely weather (via the deterministic rotation) and ties it to the main cause of the player's result this race; the card-attribution bug (rival cards counted via relatedTeamId) is fixed.
- request-AC7 -> This backlog slice. Evidence needed: Template variety: each recap card draws from at least three parameterized variants per outcome family, and the same variant does not repeat on consecutive GPs for the same card when alternatives exist.
- request-AC8 -> This backlog slice. Evidence needed: All new copy exists in both EN and FR catalogs with identical key sets; no hardcoded user-facing strings in the recap path.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_005_personalized_race_recap_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_034_personalized_race_recap`
- Primary task(s): `task_035_orchestrate_personalized_race_recap`

# AI Context
- Summary: Derive Grand Prix identity from the circuit rotation
- Keywords: scaffolded-backlog, derive grand prix identity from the circuit rotation, implementation-ready
- Use when: Implementing the scaffolded slice for Derive Grand Prix identity from the circuit rotation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_035_orchestrate_personalized_race_recap`

# Notes
- Task `task_035_orchestrate_personalized_race_recap` was finished via `logics-manager flow finish task` on 2026-07-15.
