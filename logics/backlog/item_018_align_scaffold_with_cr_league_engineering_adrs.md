## item_018_align_scaffold_with_cr_league_engineering_adrs - Align scaffold with CR League engineering ADRs
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The scaffold was created before the engineering ADRs. A small alignment pass avoids early drift before feature code grows.
- The pass should remain structural and not start gameplay implementation.

# Scope
- In:
  - API health feature module.
  - Web `app` folder.
  - Web styles split into token/base/layout files.
  - Lightweight visible folder/file structure for future web/API organization.
  - Validation.
- Out:
  - simulation implementation.
  - i18n dictionaries.
  - Prisma data model.
  - gameplay UI.
  - new runtime dependencies.

# Acceptance criteria
- AC1: Code organization reflects ADR direction.
- AC2: Existing behavior and tests still pass.
- AC3: Later waves remain out of scope.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: API health feature module is in scope.
- request-AC2 -> This backlog slice. Proof: web app folder move is in scope.
- request-AC3 -> This backlog slice. Proof: CSS split is in scope.
- request-AC4 -> This backlog slice. Proof: lightweight organization markers are in scope.
- request-AC5 -> This backlog slice. Proof: out-of-scope list preserves later waves.
- request-AC6 -> This backlog slice. Proof: validation is recorded on the linked task.

# Decision framing
- Product framing: Not needed
- Architecture framing: Required.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_012_align_scaffold_with_cr_league_engineering_adrs`
- Primary task(s): `task_013_align_scaffold_with_cr_league_engineering_adrs`

# AI Context
- Summary: Align scaffold with CR League engineering ADRs
- Keywords: backlog, promote, slice, align scaffold with cr league engineering adrs
- Use when: You need a bounded backlog item for Align scaffold with CR League engineering ADRs.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: Small structure alignment now prevents drift before Wave 2 simulation work.

# Notes
- Generated locally by logics-manager.
- Task `task_013_align_scaffold_with_cr_league_engineering_adrs` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_013_align_scaffold_with_cr_league_engineering_adrs`
