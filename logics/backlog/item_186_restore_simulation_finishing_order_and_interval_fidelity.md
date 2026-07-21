## item_186_restore_simulation_finishing_order_and_interval_fidelity - Restore simulation finishing-order and interval fidelity
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Simulation fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- FinalClassification (DriveView.tsx:391-405) derives intervals from finalTrace.gaps, which is (leaderProgress - trackProgress) * raceDuration and structurally zero at the final trace point because trackProgress is clamped to 1 (simulateRace.ts:292,311), so every non-leader row shows +0.0s.
- The segmentTime clamp [base*0.72, base*1.28] (simulateRace.ts:664-666) saturates for competitive deltas, so elapsedTime (the primary classify key, :920) stops tracking scores.score and order collapses to sub-clamp noise.
- calculated_attack/urban_draft call carAhead (simulateRace.ts:797-815) inside the per-state loop, comparing elapsedTime values that are half-updated across the iteration, so 'the car ahead' depends on loop order.

# Scope
- In:
  - Compute Final Classification intervals from finalTrace.times: leader shows absolute time, each following row shows the positive difference of consecutive elapsed times.
  - Make classify tie-break on scores.score before elapsedTime so finishing order follows the score model; keep the segment clamp for realism.
  - Snapshot every state's elapsedTime into a Map before the card-effect loop and have carAhead read the snapshot so all look-ahead sees one consistent frame.
  - Validate finishing-order stability before/after with npm run balance:sim; widen the clamp only if the tie-break alone does not restore spread.
- Out:
  - Changing the replay trace format or gaps semantics for mid-race beats.
  - Retuning card magnitudes or approach deltas.
  - Reworking the scoring model itself.

# Acceptance criteria
- AC1: Final Classification shows distinct, non-zero finishing intervals matching elapsed-time differences.
- AC2: Finishing order tracks scores.score, with elapsedTime only refining within a score tier.
- AC3: Card look-ahead selects the same 'car ahead' regardless of state iteration order.
- AC4: balance:sim shows no unintended finishing-order regression.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Final Classification shows distinct, non-zero finishing intervals matching elapsed-time differences.
- request-AC6 -> This backlog slice. Proof: AC2: Finishing order tracks scores.score, with elapsedTime only refining within a score tier.
- request-AC3 -> This backlog slice. Evidence needed: deleteAdminUser refuses to delete a non-test profile without an explicit matching confirmation, and requireAdminClaim rejects with 403 when there is no valid recorded owner instead of transferring ownership; tests cover both.
- request-AC4 -> This backlog slice. Evidence needed: Approach, preparation, and pit badges in DirectivePanel are derived from a single shared stat-delta descriptor that applyDecision also consumes, include pace, and match the real deltas, pinned by a snapshot test.
- request-AC5 -> This backlog slice. Evidence needed: The duplicated lap helper, dead DriveView ternary, FNV-1a qualifying timestamp, unused ensureProfileExists export, and doubly-computed replay order are removed, and tt is memoized; behavior is unchanged and all existing tests pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_049_repo_review_remediation_pass_6_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`
- Primary task(s): `task_086_orchestrate_repo_review_remediation_pass_6`

# AI Context
- Summary: Restore simulation finishing-order and interval fidelity
- Keywords: scaffolded-backlog, restore simulation finishing-order and interval fidelity, implementation-ready
- Use when: Implementing the scaffolded slice for Restore simulation finishing-order and interval fidelity.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_086_orchestrate_repo_review_remediation_pass_6` was finished via `logics-manager flow finish task` on 2026-07-22.
