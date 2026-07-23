## item_243_pin_positiondelta_wiring_and_align_trace_tiebreak_with_classification - Pin positionDelta wiring and align trace tiebreak with classification
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Gameplay correctness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- simulateRace.test.ts:386 does not actually test positionDelta: launch_boost's +26 score bonus alone flips the order, so deleting the positionDelta wiring would not fail the test.
- createReplayTracePoint (simulateRace.ts:407) breaks elapsed-time ties with raw scores.score, while classification uses classificationScore (score + positionDelta), so a tie can order a mid-race trace point inconsistently with the final result.

# Scope
- In:
  - Export classificationScore and add a direct unit test so removing the positionDelta term fails a test.
  - Change the createReplayTracePoint tiebreak to use classificationScore for consistency with the final classification.
- Out:
  - Re-tuning card balance.
  - Changing how positionDelta is accumulated.

# Acceptance criteria
- AC1: classificationScore is exported and unit-tested such that removing the positionDelta term breaks a test.
- AC2: The mid-race trace tiebreak uses classificationScore.
- AC3: Any affected trace snapshot test is regenerated intentionally and the suite is green.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: classificationScore is exported and unit-tested such that removing the positionDelta term breaks a test.
- request-AC6 -> This backlog slice. Proof: AC2: The mid-race trace tiebreak uses classificationScore.
- request-AC3 -> This backlog slice. Evidence needed: POST /profiles no longer distinguishes existing from new emails in its response (Option A) or the team has explicitly chosen to keep the distinct message (Option B), with the decision and rationale recorded in the orchestration task; new-email signup and the DB duplicate guard still work.
- request-AC4 -> This backlog slice. Evidence needed: validateReplayTrace has negative tests for at least the speed-abruptness, backwards-progress, and overtake-phase branches, asserting their exact error strings.
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
- Summary: Pin positionDelta wiring and align trace tiebreak with classification
- Keywords: scaffolded-backlog, pin positiondelta wiring and align trace tiebreak with classification, implementation-ready
- Use when: Implementing the scaffolded slice for Pin positionDelta wiring and align trace tiebreak with classification.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_101_orchestrate_post_remediation_review_fixes`

# Notes
- Task `task_101_orchestrate_post_remediation_review_fixes` was finished via `logics-manager flow finish task` on 2026-07-23.
