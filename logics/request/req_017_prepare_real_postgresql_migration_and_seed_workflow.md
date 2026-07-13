## req_017_prepare_real_postgresql_migration_and_seed_workflow - Prepare real PostgreSQL migration and seed workflow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Database
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Prepare the CR League PostgreSQL workflow so the persisted API can be exercised against a real database.
- Add a versioned Prisma migration, seed command, DB scripts, and a reusable API smoke flow.
- Keep managed database provisioning and destructive reset operations out of scope.

# Context
- Prisma schema already defines the minimal league persistence model.
- The project targets a dedicated PostgreSQL schema named `cr_league`, not `public`.
- This shell has no `DATABASE_URL` or `.env`, so live migration/seed execution cannot be performed here.

# Acceptance criteria
- AC1: Versioned Prisma migration exists for the current league persistence schema.
- AC2: Migration creates and uses the dedicated `cr_league` schema.
- AC3: Prisma seed command creates an idempotent demo league.
- AC4: Root npm scripts cover generate, migrate, deploy, seed, studio, and API league smoke.
- AC5: README documents local DB preparation and smoke execution.
- AC6: Smoke script covers create league, submit directive, and resolve Grand Prix against a running API.
- AC7: Validation passes for Prisma schema, seed/smoke TypeScript, app typecheck/tests/build/lint, and Logics.
- AC8: No managed DB provisioning, destructive reset, auth, or gameplay feature expansion is introduced.

# AC Traceability
- AC1 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: `prisma/migrations/20260713213000_init/migration.sql`.
- AC2 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: migration creates `cr_league` and sets search path.
- AC3 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: `prisma/seed.ts`.
- AC4 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: root `package.json` DB/smoke scripts.
- AC5 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: README DB workflow section.
- AC6 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: `scripts/smoke-league-flow.ts`.
- AC7 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: validation commands passed where no live DB is required.
- AC8 -> `task_018_prepare_real_postgresql_migration_and_seed_workflow`. Proof: DB provisioning/destructive reset/auth/gameplay expansion remain out of scope.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `req_015_add_minimal_league_persistence_api`
- `task_016_add_minimal_league_persistence_api`
- `adr_004_data_security`

# AI Context
- Summary: Prepare Prisma migration, seed, and smoke workflow for real PostgreSQL execution.
- Keywords: prisma, postgres, migration, seed, smoke-test, cr_league-schema
- Use when: Preparing or validating the real DB path for the persisted league API.
- Skip when: Working on frontend gameplay or database hosting/provisioning.

# Backlog
- `item_023_prepare_real_postgresql_migration_and_seed_workflow`
