## item_245_deepen_replay_validator_and_prng_determinism_tests - Deepen replay-validator and PRNG determinism tests
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Test coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- validateReplayTrace.test.ts covers ~5 of ~13 error branches; nontrivial branches (speed changes too abruptly, progress goes backwards, overtake phases missing) are untested.
- prng.test.ts:91 asserts determinism with a single draw on a single seed, which can false-pass on a lucky cursor position.

# Scope
- In:
  - Add validateReplayTrace negative tests for at least the speed-abruptness, backwards-progress, and overtake-phase branches, asserting exact error strings.
  - Loop the PRNG determinism test over several seeds and multiple sequential draws with reordered-but-equal forecasts.
- Out:
  - Testing every trivial guard branch.
  - Changing the validator or PRNG behavior.

# Acceptance criteria
- AC1: The three nontrivial validator branches have negative tests asserting their error strings.
- AC2: The PRNG determinism test covers multiple seeds and sequential draws.
- AC3: The suite is green.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The three nontrivial validator branches have negative tests asserting their error strings.
- request-AC6 -> This backlog slice. Proof: AC2: The PRNG determinism test covers multiple seeds and sequential draws.
- request-AC3 -> This backlog slice. Evidence needed: POST /profiles no longer distinguishes existing from new emails in its response (Option A) or the team has explicitly chosen to keep the distinct message (Option B), with the decision and rationale recorded in the orchestration task; new-email signup and the DB duplicate guard still work.
- request-AC5 -> This backlog slice. Evidence needed: The minor invariant break is fixed (App.testHelpers uses safeStorage), the activeModal single-open assumption is verified/documented, and the positionDelta units question is resolved (normalized or documented as intended).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Primary task(s): `task_101_orchestrate_post_remediation_review_fixes`

# AI Context
- Summary: Deepen replay-validator and PRNG determinism tests
- Keywords: scaffolded-backlog, deepen replay-validator and prng determinism tests, implementation-ready
- Use when: Implementing the scaffolded slice for Deepen replay-validator and PRNG determinism tests.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_101_orchestrate_post_remediation_review_fixes`

# Notes
- Task `task_101_orchestrate_post_remediation_review_fixes` was finished via `logics-manager flow finish task` on 2026-07-23.
