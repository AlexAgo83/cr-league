## item_317_raise_dependency_majors_in_reviewable_steps_under_green_ci - Raise dependency majors in reviewable steps under green CI
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- npm outdated shows prisma and @prisma/client at 6.19.3 versus 7.9.0, vite at 7.3.6 versus 8.1.5, eslint and @eslint/js at 9.39.5 versus 10.x, jsdom at 27.4.0 versus 29.1.1, @types/node at 24.13.3 versus 26.1.1, and @vitejs/plugin-react at 5.2.0 versus 6.0.4.
- Nothing is currently flagged by npm audit, so this is preventive: each skipped major makes the eventual upgrade harder and raises the odds of being stuck on an unpatched line when a real advisory lands.
- A single sweeping bump would be unreviewable, because Prisma 7 touches generated client code and migrations while the others touch build and lint configuration.

# Scope
- In:
  - Group the upgrades into independently reviewable commits, at minimum separating the Prisma major from the build and lint tooling majors.
  - For the Prisma major, run db:generate, verify the migration path against the Postgres integration job, and confirm the API test suites including the postgres suite.
  - For the vite and plugin-react majors, confirm dev server, production build, and the Chromium e2e flow.
  - For eslint 10 and typescript-eslint, migrate any removed or renamed configuration and confirm the lint run stays at zero warnings.
  - For jsdom and @types/node, confirm the web unit suites and the scripts typecheck project.
  - Record any major deliberately deferred, with the blocking reason.
- Out:
  - Adding a dependency update bot, renovate config, or scheduled upgrade workflow.
  - Swapping any tool for an alternative, for example replacing vite or eslint rather than upgrading them.
  - Upgrading TypeScript itself to a new major in this pass unless a dependency hard-requires it.
  - Refactoring application code beyond what the upgrades mechanically require.

# Acceptance criteria
- AC1: Each dependency major lands in its own reviewable commit with the full CI suite green.
- AC2: The Prisma major is verified against the Postgres integration path, not only the in-memory test database.
- AC3: npm audit --omit=dev --audit-level=high still reports no findings after the upgrades.
- AC4: Any deferred major is recorded with the reason it was deferred.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Each dependency major lands in its own reviewable commit with the full CI suite green.
- request-AC8 -> This backlog slice. Proof: AC2: The Prisma major is verified against the Postgres integration path, not only the in-memory test database.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-27 closeout decision: defer Prisma 7 until its adapter/client migration can be completed as a dedicated wave; defer ESLint 10 until jsx-a11y has a supported path or an accessibility-safe replacement is chosen; leave TypeScript 7 out of scope unless dependency constraints require it.

# Links
- Product brief(s): `prod_078_credential_storage_and_dependency_currency_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation`
- Primary task(s): `task_127_orchestrate_credential_storage_and_dependency_currency_remediation`

# AI Context
- Summary: Raise dependency majors in reviewable steps under green CI
- Keywords: scaffolded-backlog, raise dependency majors in reviewable steps under green ci, implementation-ready
- Use when: Implementing the scaffolded slice for Raise dependency majors in reviewable steps under green CI.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Report
- 2026-07-27 wave 2: upgraded the build-tooling group only: `vite` 8.1.5 and `@vitejs/plugin-react` 6.0.4.
- Updated `engines.node` to `^20.19.0 || >=22.12.0`, matching Vite 8's package engine requirement.
- Validation: `typecheck`, `lint`, full unit suite, production build, Chromium e2e, and production audit passed.
- Deferred within this item after wave 2: Prisma 7, ESLint 10, jsdom/Node types, and TypeScript major decision remained separate reviewable waves.
- 2026-07-27 wave 3: upgraded `jsdom` to 29.1.1 and `@types/node` to 26.1.1.
- Declined `jsdom@30` in this wave because its package engine is higher than the current local runtime and the Vite 8 engine floor.
- Validation: `typecheck`, `lint`, full unit suite, production build, and production audit passed.
- Deferred within this item: Prisma 7, ESLint 10, and TypeScript major decision remain separate reviewable waves.
- ESLint 10 deferral reason: latest `eslint-plugin-jsx-a11y` still peers only through ESLint 9; `--force` or removing the plugin would reduce accessibility coverage.
- Prisma 7 deferral reason: attempted upgrade proved it needs a dedicated adapter/client migration: remove schema datasource URL, configure `prisma.config.ts`, add `@prisma/adapter-pg` and `pg`, rewrite all `new PrismaClient()` call sites, and resolve Prisma 7 transaction/delegate type changes before green CI.

# Validation
- 2026-07-27 closeout validation: npm run typecheck OK; npm run lint OK; npm test OK with 352 passing / 7 skipped; npm run test:coverage OK with 352 passing / 7 skipped and 91.89% statements; npm run build OK; npm run test:e2e -- --project=chromium OK, 4 passed; npm audit --omit=dev --audit-level=high OK, 0 vulnerabilities.

# Notes
- Task `task_127_orchestrate_credential_storage_and_dependency_currency_remediation` was finished via `logics-manager flow finish task` on 2026-07-27.
