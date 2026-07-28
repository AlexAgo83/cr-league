## item_335_add_missing_leagueid_indexes_on_team_and_grandprix - Add missing leagueId indexes on Team and GrandPrix
> From version: 0.6.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 95
> Progress: 100
> Complexity: Low
> Theme: Database performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Team (prisma/schema.prisma:52) and GrandPrix (prisma/schema.prisma:78) have no @@index([leagueId]), despite leagueId being the most common query filter across the codebase (getLeagueState in apps/api/src/features/leagues/lifecycle.ts:181, getCurrentGrandPrix in apps/api/src/features/leagues/persistence.ts).
- The existing @@unique([leagueId, name]) on Team and @@unique([leagueId, season, round]) on GrandPrix provide only incidental leading-column index coverage for exact-match lookups, not for the broader leagueId-scoped queries and orderings used elsewhere.

# Scope
- In:
  - Add @@index([leagueId]) to the Team model and to the GrandPrix model in prisma/schema.prisma.
  - Write a matching Postgres migration under prisma/migrations/ following this repo's existing hand-authored migration.sql convention (see prisma/migrations/20260728120000_add_variable_shop/migration.sql for the exact style: plain ALTER TABLE / CREATE INDEX statements, no down migration).
  - Run npm run db:generate and confirm the app and full test suite still pass with the new schema.
- Out:
  - Any other schema normalization (JSON columns, reminder columns, etc.) — out of scope for this slice.
  - Query rewrites; this slice only adds indexes, it does not change any query code.

# Acceptance criteria
- AC1: Team and GrandPrix have @@index([leagueId]) in prisma/schema.prisma.
- AC2: A Postgres migration exists that creates both indexes, matching this repo's existing hand-authored migration style.
- AC3: npm run db:generate, npm run typecheck, and the full test suite pass with no behavior change.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Team and GrandPrix have @@index([leagueId]) in prisma/schema.prisma.
- request-AC13 -> This backlog slice. Proof: AC2: A Postgres migration exists that creates both indexes, matching this repo's existing hand-authored migration style.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Add missing leagueId indexes on Team and GrandPrix
- Keywords: scaffolded-backlog, add missing leagueid indexes on team and grandprix, implementation-ready
- Use when: Implementing the scaffolded slice for Add missing leagueId indexes on Team and GrandPrix.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Done: added `@@index([leagueId])` to `Team` and `GrandPrix` in `prisma/schema.prisma` plus migration `20260728160000_add_league_id_indexes`. `npm run db:generate`, `npm run typecheck`, and `npm test` (373 passed, 7 skipped) all green; no behavior change.
