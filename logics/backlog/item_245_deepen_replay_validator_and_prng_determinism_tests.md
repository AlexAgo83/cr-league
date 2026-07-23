## item_245_deepen_replay_validator_and_prng_determinism_tests - Deepen replay-validator and PRNG determinism tests
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
