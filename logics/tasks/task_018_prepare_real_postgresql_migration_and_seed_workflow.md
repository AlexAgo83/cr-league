## task_018_prepare_real_postgresql_migration_and_seed_workflow - Prepare real PostgreSQL migration and seed workflow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_023_prepare_real_postgresql_migration_and_seed_workflow`

# Acceptance criteria
- AC1: Migration is versioned.
- AC2: Seed is idempotent.
- AC3: Scripts document the DB lifecycle.
- AC4: Smoke flow is runnable against a live API.
- AC5: Validation passes or live-DB blockers are explicit.

# AC Traceability
- request-AC1 -> This task. Proof: `prisma/migrations/20260713213000_init/migration.sql`.
- request-AC2 -> This task. Proof: migration creates `cr_league` and sets search path before table creation.
- request-AC3 -> This task. Proof: `prisma/seed.ts` upserts demo league `DEMO01`.
- request-AC4 -> This task. Proof: root `package.json` defines `db:generate`, `db:migrate`, `db:deploy`, `db:seed`, `db:studio`, and `smoke:league`.
- request-AC5 -> This task. Proof: README documents DB preparation and smoke flow.
- request-AC6 -> This task. Proof: `scripts/smoke-league-flow.ts` creates league, submits directive, and resolves GP through API.
- request-AC7 -> This task. Proof: validation commands passed on 2026-07-13 except live DB execution, which is blocked by missing `DATABASE_URL`.
- request-AC8 -> This task. Proof: managed DB provisioning, destructive reset, auth, and gameplay expansion remain out of scope.
- backlog-AC1 -> This task. Proof: migration is committed under `prisma/migrations`.
- backlog-AC2 -> This task. Proof: seed uses upsert/createMany with `skipDuplicates`.
- backlog-AC3 -> This task. Proof: package scripts and README document lifecycle.
- backlog-AC4 -> This task. Proof: smoke script is runnable via `npm run smoke:league`.
- backlog-AC5 -> This task. Proof: no live `DATABASE_URL` or `.env` is present in this shell, so live DB migrate/seed/smoke was not executed.

# Validation
- 2026-07-13: `npm run db:generate` passed.
- 2026-07-13: `DATABASE_URL='postgresql://user:password@localhost:5432/cr_league?schema=cr_league' npx prisma validate` passed.
- 2026-07-13: `npx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --types node --skipLibCheck prisma/seed.ts prisma.config.ts scripts/smoke-league-flow.ts` passed.
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_017_prepare_real_postgresql_migration_and_seed_workflow` passed with 0 findings.
- npm run db:generate; DATABASE_URL=postgresql://user:password@localhost:5432/cr_league?schema=cr_league npx prisma validate; npx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --types node --skipLibCheck prisma/seed.ts prisma.config.ts scripts/smoke-league-flow.ts; npm run typecheck; npm test; npm run build; npm run lint; npm run logics:validate; logics-manager flow validate req_017_prepare_real_postgresql_migration_and_seed_workflow
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Added versioned Prisma migration, Prisma config, idempotent seed, DB lifecycle scripts, API smoke script, and README workflow documentation.
- Live DB execution not run because this shell has no `DATABASE_URL` and no `.env`.
- Validation passed: `npm run db:generate`, Prisma validate with `DATABASE_URL`, standalone TypeScript check for Prisma config/seed/smoke script, `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `logics-manager flow validate req_017_prepare_real_postgresql_migration_and_seed_workflow`.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_023_prepare_real_postgresql_migration_and_seed_workflow`
- Related request(s): `req_017_prepare_real_postgresql_migration_and_seed_workflow`

# AI Context
- Summary: Implement prepare real postgresql migration and seed workflow.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_017_prepare_real_postgresql_migration_and_seed_workflow`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
