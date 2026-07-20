## item_139_postgres_integration_test_ci_lane_for_concurrent_store_paths - Postgres integration-test CI lane for concurrent store paths
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 98
> Confidence: 92
> Progress: 100
> Complexity: Medium
> Theme: Test integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The in-memory test DB implements $transaction as fn(db) and $queryRaw as a no-op, so the FOR UPDATE locks, transactional claims, and rollback behavior the store relies on are never exercised by any test.
- The CI unit job exports DATABASE_URL without provisioning a database, which is misleading and a latent flake.

# Scope
- In:
  - Add an integration test suite that runs against real Postgres via a services: postgres container in a dedicated CI job, applying prisma migrate deploy before the run.
  - Cover at least: concurrent qualifying submissions holding the attempt limit under the row lock, the resolve transition claimed exactly once under concurrent calls, the credit-guarded card purchase never overspending, and the restartLeague rollback from the API-integrity item.
  - Make the suite runnable locally against a DATABASE_URL with a single npm script, and skip cleanly when no database is configured.
  - Remove the unused DATABASE_URL from the unit lane or scope it to the new integration job.
  - This implements roadmap patch 0.4.2.
- Out:
  - Replacing the in-memory DB for the fast unit suite.
  - Testcontainers or Docker-in-Docker orchestration beyond the CI service container.
  - Load or soak testing.

# Acceptance criteria
- AC1: A CI job runs the integration suite against real Postgres on every push and pull request lane where unit tests run.
- AC2: The suite proves the attempt limit, single resolve claim, credit guard, and restart rollback under real transaction semantics.
- AC3: The unit lane no longer advertises a DATABASE_URL it does not use.
- AC4: The integration suite runs locally with one command given a DATABASE_URL.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: A CI job runs the integration suite against real Postgres on every push and pull request lane where unit tests run.
- request-AC9 -> This backlog slice. Proof: AC2: The suite proves the attempt limit, single resolve claim, credit guard, and restart rollback under real transaction semantics.
- request-AC3 -> This backlog slice. Evidence needed: restartLeague executes atomically inside runWrite so an injected mid-sequence failure leaves the previous league state intact, with a test proving no league can end up without a current Grand Prix.
- request-AC4 -> This backlog slice. Evidence needed: The admin token comparison is constant-time and localhost CORS origins are absent from the production origin set, verified by tests or config assertions.
- request-AC5 -> This backlog slice. Evidence needed: App.tsx drops below ~700 lines by extracting domain hooks (league, profile, admin, plan form) and view containers, the rejoin effect has correct dependencies or an explicit mount guard, the rejoin logic exists once, the seven command-clicked booleans collapse into one structure, and all existing web tests still pass.
- request-AC6 -> This backlog slice. Evidence needed: ReplayView.tsx is split into a useReplayClock hook and separate scrubber/tower/stage files with no behavior change pinned by the existing replay tests.
- request-AC8 -> This backlog slice. Evidence needed: CI gains dependency scanning (Dependabot config plus an npm audit gate), vitest coverage collection surfaced in CI, eslint enforces react-hooks and jsx-a11y rules with the codebase passing, the release workflow fails on a health-version mismatch, package.json declares engines, and the reports/ gitignore policy is consistent.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-20 implementation: added a POSTGRES_INTEGRATION-gated Vitest file for real Postgres concurrency paths and a CI postgres-integration job using postgres:16 plus prisma migrate deploy. The test covers concurrent qualifying attempts, concurrent resolve claims, and concurrent credit-guarded card purchases. Verified locally with Docker using DATABASE_URL schema=cr_league.

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: Postgres integration-test CI lane for concurrent store paths
- Keywords: scaffolded-backlog, postgres integration-test ci lane for concurrent store paths, implementation-ready
- Use when: Implementing the scaffolded slice for Postgres integration-test CI lane for concurrent store paths.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-20 closeout proof: Postgres integration suite now covers concurrent qualifying row-lock behavior, single resolve transition claim, credit-guarded concurrent card purchase, and restartLeague rollback when the replacement Grand Prix insert fails. CI has a postgres:16 job with migrate deploy and POSTGRES_INTEGRATION=1. Local verification: DATABASE_URL=postgresql://postgres:postgres@localhost:55432/cr_league?schema=cr_league POSTGRES_INTEGRATION=1 rtk npm test -- apps/api/src/app.postgres.test.ts passed 4 tests.

# Tasks
- `task_059_orchestrate_repo_review_remediation_pass_5`

# Notes
- Task `task_059_orchestrate_repo_review_remediation_pass_5` was finished via `logics-manager flow finish task` on 2026-07-20.
