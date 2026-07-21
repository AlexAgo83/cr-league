## item_188_derive_plan_badges_from_a_single_shared_stat_delta_descriptor - Derive plan badges from a single shared stat-delta descriptor
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Balance legibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- APPROACH/PREPARATION/PIT_BADGES in DirectivePanel.tsx:74-88 hand-mirror applyDecision's stat deltas with a flat magnitude of 3 and omit pace, so the player-facing hints have drifted from the balance the simulation applies (e.g. prudent is really pace-8/control+10/reliability+9/aggression-12).

# Scope
- In:
  - Extract the per-approach, per-preparation, and per-pit stat-delta descriptors into a shared module that applyDecision consumes as its source of truth.
  - Render DirectivePanel badges from the signed deltas of that descriptor, including pace, so panel and simulation cannot diverge.
  - Add a snapshot test pinning the badge output to the descriptor.
- Out:
  - Changing any delta value (this exposes existing balance, it does not retune it).
  - Redesigning the badge visual style.
  - Localizing new copy beyond existing badge labels.

# Acceptance criteria
- AC1: applyDecision and DirectivePanel read the same descriptor; there is no second hand-written delta table.
- AC2: Badges reflect the real signed deltas including pace.
- AC3: A snapshot test fails if the descriptor and rendered badges drift apart.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: applyDecision and DirectivePanel read the same descriptor; there is no second hand-written delta table.
- request-AC6 -> This backlog slice. Proof: AC2: Badges reflect the real signed deltas including pace.
- request-AC3 -> This backlog slice. Evidence needed: deleteAdminUser refuses to delete a non-test profile without an explicit matching confirmation, and requireAdminClaim rejects with 403 when there is no valid recorded owner instead of transferring ownership; tests cover both.
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
- Summary: Derive plan badges from a single shared stat-delta descriptor
- Keywords: scaffolded-backlog, derive plan badges from a single shared stat-delta descriptor, implementation-ready
- Use when: Implementing the scaffolded slice for Derive plan badges from a single shared stat-delta descriptor.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_086_orchestrate_repo_review_remediation_pass_6` was finished via `logics-manager flow finish task` on 2026-07-22.
