## item_200_racedecision_data_model_integrity - RaceDecision data-model integrity
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Data model
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- RaceDecision.teamId has no standalone index (schema.prisma:93); the composite unique cannot lead on teamId, so the cascade and teamId filters seq-scan.
- RaceDecision.rivalTeamId (schema.prisma:98) stores a Team id with no FK/relation/onDelete/index, leaving dangling references the sim consumes.
- status/kind/cadence/approach/preparation/pitStrategy are free-text String with no DB constraint, so an invalid value can persist and crash the as RaceInput casts.
- The profileId index migration uses non-concurrent CREATE INDEX, write-locking teams during db:deploy.

# Scope
- In:
  - Add @@index([teamId]) to RaceDecision.
  - Model rivalTeamId as a relation to Team with onDelete: SetNull plus an index (or clean it up on team delete).
  - Convert the enum-like columns to Prisma enums or add CHECK constraints.
  - Split the profileId index into a CREATE INDEX CONCURRENTLY migration run outside a transaction.
- Out:
  - Migrating qualifyingRuns/cards/result JSON columns to dedicated tables.
  - Broad re-indexing beyond the RaceDecision references.
  - Changing the simulation's consumption of these fields beyond the safety the constraints add.

# Acceptance criteria
- AC1: RaceDecision.teamId is indexed and rivalTeamId is a FK/relation with onDelete handling and an index.
- AC2: The enum-like columns are DB-constrained so an invalid value cannot persist.
- AC3: The profileId index migration deploys without write-locking teams, and prisma migrate deploy is clean.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: RaceDecision.teamId is indexed and rivalTeamId is a FK/relation with onDelete handling and an index.
- request-AC6 -> This backlog slice. Proof: AC2: The enum-like columns are DB-constrained so an invalid value cannot persist.
- request-AC3 -> This backlog slice. Evidence needed: The replay honors prefers-reduced-motion (defaults to no auto-motion when reduce is set), the modal focus trap skips hidden elements and focuses the first visible control, and the speed menu either implements listbox keyboard navigation or drops the listbox roles.
- request-AC5 -> This backlog slice. Evidence needed: The API fails fast on missing WEB_ORIGIN/DATABASE_URL outside development, and render.yaml declares ADMIN_TOKEN and ADMIN_EMAILS.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Primary task(s): `task_089_orchestrate_post_remediation_hardening`

# AI Context
- Summary: RaceDecision data-model integrity
- Keywords: scaffolded-backlog, racedecision data-model integrity, implementation-ready
- Use when: Implementing the scaffolded slice for RaceDecision data-model integrity.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_089_orchestrate_post_remediation_hardening`

# Notes
- Task `task_089_orchestrate_post_remediation_hardening` was finished via `logics-manager flow finish task` on 2026-07-22.
