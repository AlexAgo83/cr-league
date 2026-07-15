## item_048_delete_dead_code_dead_i18n_keys_and_stray_files - Delete dead code, dead i18n keys, and stray files
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Progress: 100%
> Complexity: Low
> Theme: Dead code removal
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- About 30 i18n keys survive in both catalogs from a previous UI iteration with zero references.
- localizedReportBlocks, prng.int, and three RaceEventType members are exported or declared but never used or emitted.
- Empty directories and .gitkeep placeholders from early scaffolding suggest structure that does not exist.

# Scope
- In:
  - Remove the ~30 audited unused keys from apps/web/src/i18n/en.json and fr.json.
  - Delete localizedReportBlocks from apps/web/src/app/helpers.ts.
  - Delete prng.int from the Prng type and implementation.
  - Delete RaceEventType members strong_start, poor_start, late_push_failure.
  - Remove the empty root src/ directory, apps/api/src/simulation/.gitkeep, apps/api/src/db/.gitkeep, and the local .npm-cache directory.
  - Re-verify each key/symbol has zero references (including dynamic template access) before deleting.
- Out:
  - Adding new i18n keys or tooling to detect unused keys.
  - Any change to rendered copy.

# Acceptance criteria
- AC1: Both catalogs contain only keys referenced by the web app, and EN/FR key sets are identical.
- AC2: The named dead symbols are gone and typecheck passes.
- AC3: The named stray directories and placeholder files are gone.
- AC4: Unit tests and e2e pass unchanged.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Both catalogs contain only keys referenced by the web app, and EN/FR key sets are identical.
- request-AC2 -> This backlog slice. Proof: AC2: The named dead symbols are gone and typecheck passes.
- request-AC6 -> This backlog slice. Proof: AC3: The named stray directories and placeholder files are gone.
- request-AC9 -> This backlog slice. Proof: AC4: Unit tests and e2e pass unchanged.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_033_over_engineering_cleanup_pass_1`
- Primary task(s): `task_034_orchestrate_over_engineering_cleanup_pass_1`

# AI Context
- Summary: Delete dead code, dead i18n keys, and stray files
- Keywords: scaffolded-backlog, delete dead code, dead i18n keys, and stray files, implementation-ready
- Use when: Implementing the scaffolded slice for Delete dead code, dead i18n keys, and stray files.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_034_orchestrate_over_engineering_cleanup_pass_1`

# Notes
- Task `task_034_orchestrate_over_engineering_cleanup_pass_1` was finished via `logics-manager flow finish task` on 2026-07-15.
