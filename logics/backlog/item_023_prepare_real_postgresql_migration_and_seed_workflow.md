## item_023_prepare_real_postgresql_migration_and_seed_workflow - Prepare real PostgreSQL migration and seed workflow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Database
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The persisted league API needs a repeatable PostgreSQL setup path before it can be trusted outside fake-DB tests.
- This slice adds the migration, seed, scripts, and smoke command needed to exercise the real DB path.

# Scope
- In:
  - Prisma migration.
  - Prisma config and seed command.
  - DB npm scripts.
  - API league smoke script.
  - README workflow documentation.
  - validation that does not require live DB credentials.
- Out:
  - managed PostgreSQL provisioning.
  - destructive database reset.
  - auth/session changes.
  - frontend gameplay expansion.

# Acceptance criteria
- AC1: Migration is versioned.
- AC2: Seed is idempotent.
- AC3: Scripts document the DB lifecycle.
- AC4: Smoke flow is runnable against a live API.
- AC5: Validation passes or live-DB blockers are explicit.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: versioned migration is in scope.
- request-AC2 -> This backlog slice. Proof: dedicated schema behavior is in scope.
- request-AC3 -> This backlog slice. Proof: seed workflow is in scope.
- request-AC4 -> This backlog slice. Proof: DB/smoke scripts are in scope.
- request-AC5 -> This backlog slice. Proof: README docs are in scope.
- request-AC6 -> This backlog slice. Proof: API smoke script is in scope.
- request-AC7 -> This backlog slice. Proof: validation is in scope.
- request-AC8 -> This backlog slice. Proof: provisioning/reset/auth/gameplay expansion are out of scope.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required.
- Architecture signals: Prisma migration and dedicated PostgreSQL schema workflow.
- Architecture follow-up: Covered by existing data/security ADR; no new ADR required.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_017_prepare_real_postgresql_migration_and_seed_workflow`
- Primary task(s): `task_018_prepare_real_postgresql_migration_and_seed_workflow`

# AI Context
- Summary: Prepare real PostgreSQL migration and seed workflow
- Keywords: backlog-groom, request, prepare real postgresql migration and seed workflow, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Prepare real PostgreSQL migration and seed workflow.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: Real DB setup is required before the persisted gameplay loop can be trusted.

# Notes
- Hybrid rationale: Derived from request `req_017_prepare_real_postgresql_migration_and_seed_workflow` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_017_prepare_real_postgresql_migration_and_seed_workflow.md`.
- Generated locally by logics-manager.
- Task `task_018_prepare_real_postgresql_migration_and_seed_workflow` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_018_prepare_real_postgresql_migration_and_seed_workflow`
