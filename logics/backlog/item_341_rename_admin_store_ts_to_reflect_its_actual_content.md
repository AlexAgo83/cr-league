## item_341_rename_admin_store_ts_to_reflect_its_actual_content - Rename admin/store.ts to reflect its actual content
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Code organization
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- apps/api/src/features/admin/store.ts (196 lines) contains real cleanup/inspection business logic (cleanupAdminTestData, listAdminLeagues, inspectAdminLeague, etc.), but shares its filename with apps/api/src/features/leagues/store.ts, which is a pure re-export barrel/facade — the established store.ts convention elsewhere in this codebase.
- A contributor or AI agent grepping 'store.ts' in the admin feature folder, expecting the leagues-feature convention (a thin facade), lands instead in a file with real logic and a completely different role.

# Scope
- In:
  - Rename apps/api/src/features/admin/store.ts to a name reflecting its actual content (e.g. adminData.ts) — pick whatever name best matches this repo's existing naming conventions for similar files (e.g. compare to apps/api/src/features/leagues/persistence.ts, cards.ts, decisions.ts for naming style).
  - Update every import of the old path across the codebase, including apps/api/src/features/admin/routes.ts and the cross-feature import from apps/api/src/features/leagues/lifecycle.ts (or wherever admin/store.ts is imported from outside its own feature folder).
  - Leave apps/api/src/features/leagues/store.ts untouched — it matches the established barrel convention used elsewhere and should not be renamed.
- Out:
  - Splitting or refactoring the renamed file's internal contents — this is a rename-only slice.
  - Renaming any other file in the codebase.

# Acceptance criteria
- AC1: apps/api/src/features/admin/store.ts no longer exists under that name; its content lives under a new name reflecting its actual role.
- AC2: Every import of the old path is updated; npm run typecheck passes with no dangling references.
- AC3: The full test suite passes with no behavior change.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: apps/api/src/features/admin/store.ts no longer exists under that name; its content lives under a new name reflecting its actual role.
- request-AC13 -> This backlog slice. Proof: AC2: Every import of the old path is updated; npm run typecheck passes with no dangling references.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Rename admin/store.ts to reflect its actual content
- Keywords: scaffolded-backlog, rename admin/store.ts to reflect its actual content, implementation-ready
- Use when: Implementing the scaffolded slice for Rename admin/store.ts to reflect its actual content.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
