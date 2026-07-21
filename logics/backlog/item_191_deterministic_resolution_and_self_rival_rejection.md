## item_191_deterministic_resolution_and_self_rival_rejection - Deterministic resolution and self-rival rejection
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Simulation integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- resolveCurrentGrandPrix (store.ts:708-711) feeds input.traits/laps/trackLengthMeters/pitLaneProgress from the HTTP body into simulateRace, and normalizeRaceTraits(input.traits) overrides the circuit's canonical traits, so the owner can tilt a result and replays lose seed-determinism.
- validateDecisionValues (store.ts:992-1010) checks rivalTeamId membership but not that it differs from the submitting team, so urban_draft/calculated_attack can self-target.

# Scope
- In:
  - Derive traits, laps, trackLengthMeters, and pitLaneProgress from the stored circuit identity in resolveCurrentGrandPrix and ignore the client-supplied values in the scored input; keep any render hints display-only.
  - Reject rivalTeamId === input.teamId in validateDecisionValues with a 400.
  - Tests: identical resolve output for a seed+circuit across varied request bodies; self-rival decision rejected.
- Out:
  - Reworking the admin resolve route contract beyond dropping the trusted render params.
  - Changing how qualifying derives its inputs (already correct).
  - Rival-card effect magnitudes.

# Acceptance criteria
- AC1: Resolve output depends only on seed and stored circuit, not on request-body traits/track params.
- AC2: A self-targeted rival decision is rejected with 400.
- AC3: Existing resolve and decision tests still pass.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Resolve output depends only on seed and stored circuit, not on request-body traits/track params.
- request-AC4 -> This backlog slice. Proof: AC2: A self-targeted rival decision is rejected with 400.
- request-AC6 -> This backlog slice. Proof: AC3: Existing resolve and decision tests still pass.
- request-AC5 -> This backlog slice. Evidence needed: The recovery limiter prunes expired buckets and does not consume the email attempt when the IP branch rejects; Team.profileId is indexed; buyBotCards no longer writes bot cards from a stale snapshot.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_050_gameplay_and_economy_integrity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
- Primary task(s): `task_087_orchestrate_gameplay_and_economy_integrity_fixes`

# AI Context
- Summary: Deterministic resolution and self-rival rejection
- Keywords: scaffolded-backlog, deterministic resolution and self-rival rejection, implementation-ready
- Use when: Implementing the scaffolded slice for Deterministic resolution and self-rival rejection.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_087_orchestrate_gameplay_and_economy_integrity_fixes` was finished via `logics-manager flow finish task` on 2026-07-22.
