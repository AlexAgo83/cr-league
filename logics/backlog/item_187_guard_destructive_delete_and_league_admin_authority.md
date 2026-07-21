## item_187_guard_destructive_delete_and_league_admin_authority - Guard destructive delete and league-admin authority
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Admin safety
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- deleteAdminUser (admin/store.ts:58-61) permanently deletes any profile with no isTestProfile guard and no confirmation, unlike cleanupAdminTestData which already gates on isTestProfile and a confirmation constant.
- requireAdminClaim (store.ts:1021-1028) silently reassigns and persists ownerTeamId to the oldest human team when the recorded owner is missing, transferring league-admin powers with no explicit action.

# Scope
- In:
  - Make deleteAdminUser refuse when isTestProfile(email) is false unless the caller passes an explicit confirmation matching the profile email (type-to-confirm), threading the confirmation through the admin route and the admin panel UI.
  - Remove the ownerTeamId self-reassignment in requireAdminClaim: a missing or non-human recorded owner rejects with 403 rather than transferring ownership.
  - Tests: non-test-profile delete rejected without confirmation and allowed with it; admin action rejected when the recorded owner is absent.
- Out:
  - Building an explicit ownership-transfer flow (deferred until a real need).
  - Reworking the admin authentication model.
  - Soft-delete or audit-log infrastructure.

# Acceptance criteria
- AC1: A non-test profile cannot be deleted without an explicit matching confirmation.
- AC2: requireAdminClaim returns 403 when no valid owner is recorded and never mutates ownerTeamId as a side effect.
- AC3: Both behaviors are covered by tests and the closeout notes the deliberate narrowing of pass-4 self-healing.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: A non-test profile cannot be deleted without an explicit matching confirmation.
- request-AC6 -> This backlog slice. Proof: AC2: requireAdminClaim returns 403 when no valid owner is recorded and never mutates ownerTeamId as a side effect.
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
- Summary: Guard destructive delete and league-admin authority
- Keywords: scaffolded-backlog, guard destructive delete and league-admin authority, implementation-ready
- Use when: Implementing the scaffolded slice for Guard destructive delete and league-admin authority.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_086_orchestrate_repo_review_remediation_pass_6` was finished via `logics-manager flow finish task` on 2026-07-22.
