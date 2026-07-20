## item_166_add_safe_admin_test_data_cleanup - Add safe admin test-data cleanup
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: High
> Theme: Admin support safety
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Hosted beta support needs a safe way to remove test accounts/leagues without manual database edits.
- Destructive actions are high risk and must be narrow, explicit, and well tested.

# Scope
- In:
  - Add admin-only cleanup endpoint(s) for explicitly selected test data sets.
  - Require confirmation in the web admin UI and report deleted counts.
  - Add safety-boundary tests proving non-admins cannot run cleanup and unrelated data is not deleted.
- Out:
  - Undo tooling.
  - Public account deletion.
  - Unscoped truncate/wipe-all operations.

# Acceptance criteria
- AC2: Cleanup deletes selected test data and reports counts.
- AC3: API tests cover authorization and safety.
- AC6: No broad wipe or public deletion is introduced.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC2: Cleanup deletes selected test data and reports counts.
- request-AC3 -> This backlog slice. Proof: AC3: API tests cover authorization and safety.
- request-AC4 -> This backlog slice. Proof: AC6: No broad wipe or public deletion is introduced.
- request-AC6 -> This backlog slice. Proof: AC6: No broad wipe or public deletion is introduced.
- request-AC7 -> This backlog slice. Proof: AC6: No broad wipe or public deletion is introduced.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_033_beta_support_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_069_beta_support_hardening`
- Primary task(s): `task_070_orchestrate_beta_support_hardening`

# AI Context
- Summary: Add safe admin test-data cleanup
- Keywords: scaffolded-backlog, add safe admin test-data cleanup, implementation-ready
- Use when: Implementing the scaffolded slice for Add safe admin test-data cleanup.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
