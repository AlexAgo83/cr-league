## item_246_resolve_residual_invariant_and_units_assumptions - Resolve residual invariant and units assumptions
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Cleanup
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- App.testHelpers.ts:5 uses raw localStorage.setItem, bypassing safeStorage and breaking the total invariant (test-only).
- App.tsx:107 collapsed ~10 modal booleans into one activeModal state machine, so opening modal B silently closes A, with only restart-from-league-controls handled.
- positionDelta (positions) is summed into scores.score (points) at simulateRace.ts:909, which should be confirmed as intended rather than a units mismatch.

# Scope
- In:
  - Route App.testHelpers through safeStorage.set.
  - Audit modal open sites to confirm no other simultaneous-modal flow exists; document the finding.
  - Confirm the positionDelta/score scale mix is intended (leave a short comment) or normalize it.
- Out:
  - A full modal-manager refactor.
  - Rebalancing card magnitudes beyond a units fix if one is needed.

# Acceptance criteria
- AC1: App.testHelpers uses safeStorage so the storage invariant is total.
- AC2: The activeModal single-open assumption is verified and documented.
- AC3: The positionDelta units question is resolved (normalized or documented as intended).

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: App.testHelpers uses safeStorage so the storage invariant is total.
- request-AC6 -> This backlog slice. Proof: AC2: The activeModal single-open assumption is verified and documented.
- request-AC3 -> This backlog slice. Evidence needed: POST /profiles no longer distinguishes existing from new emails in its response (Option A) or the team has explicitly chosen to keep the distinct message (Option B), with the decision and rationale recorded in the orchestration task; new-email signup and the DB duplicate guard still work.
- request-AC4 -> This backlog slice. Evidence needed: validateReplayTrace has negative tests for at least the speed-abruptness, backwards-progress, and overtake-phase branches, asserting their exact error strings.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Primary task(s): `task_101_orchestrate_post_remediation_review_fixes`

# AI Context
- Summary: Resolve residual invariant and units assumptions
- Keywords: scaffolded-backlog, resolve residual invariant and units assumptions, implementation-ready
- Use when: Implementing the scaffolded slice for Resolve residual invariant and units assumptions.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_101_orchestrate_post_remediation_review_fixes`

# Notes
- Task `task_101_orchestrate_post_remediation_review_fixes` was finished via `logics-manager flow finish task` on 2026-07-23.
