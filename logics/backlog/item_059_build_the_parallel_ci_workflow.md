## item_059_build_the_parallel_ci_workflow - Build the parallel CI workflow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Continuous integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The repo has no CI: lint, typecheck, tests, build, and logics validation only run when someone remembers to run them locally.
- A single sequential job would serialize ~5 independent gates; the electrical-plan-editor lane pattern bounds wall-clock by the slowest lane instead.

# Scope
- In:
  - Create .github/workflows/ci.yml triggered on pull_request, push to main, and workflow_dispatch, with concurrency cancel-in-progress scoped to PRs and permissions contents: read.
  - Lane quality: npm ci, prisma generate with a dummy inline DATABASE_URL, lint, typecheck, logics:validate.
  - Lane unit: matrix over [shared, api, web] running vitest for that workspace only (root vitest config filtered by path), fail-fast false.
  - Lane e2e: Playwright install --with-deps chromium, npm run test:e2e (webServer starts the Vite dev server; API is mocked by the spec), upload playwright-report always (14d retention) and traces/videos on failure.
  - Lane build: full npm run build across workspaces.
  - Aggregator job validate with needs on all lanes and if: always(), failing unless every lane succeeded — the single required status check for branch protection.
  - npm caching via setup-node cache: npm in every job; Node version pinned to 20.
  - Document in the workflow file that the unit lane upgrades to vitest --shard when suite growth warrants it.
- Out:
  - Test sharding, OS/runtime matrices, coverage reporting, integration-test lane with real Postgres (no such suite exists yet).
  - Branch protection configuration itself (operator action; the contract doc names the check to require).

# Acceptance criteria
- AC1: A PR run shows quality, three unit matrix jobs, e2e, and build executing concurrently, with validate aggregating.
- AC2: Failing any single lane fails validate; cancelling is scoped so main pushes are never cancelled by newer PR pushes.
- AC3: No repository secret is referenced anywhere in ci.yml.
- AC4: All lanes are green on the introducing PR.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: A PR run shows quality, three unit matrix jobs, e2e, and build executing concurrently, with validate aggregating.
- request-AC4 -> This backlog slice. Proof: AC2: Failing any single lane fails validate; cancelling is scoped so main pushes are never cancelled by newer PR pushes.
- request-AC9 -> This backlog slice. Proof: AC3: No repository secret is referenced anywhere in ci.yml.
- request-AC10 -> This backlog slice. Proof: AC4: All lanes are green on the introducing PR.
- request-AC5 -> This backlog slice. Evidence needed: GET /health on the API returns the application version read from package.json, and the value matches the root package.json version in a unit test.
- request-AC6 -> This backlog slice. Evidence needed: deploy-release.yml triggers on release published (and workflow_dispatch fallback), verifies the tag equals v<package.json version>, polls the CI workflow conclusion for the release SHA until success (no test re-run), then POSTs RENDER_API_DEPLOY_HOOK_URL and RENDER_WEB_DEPLOY_HOOK_URL via curl --fail-with-body.
- request-AC7 -> This backlog slice. Evidence needed: After triggering the API hook, the workflow polls /health up to 30 times at 10-second intervals until the reported version equals the release tag, records a GitHub Deployment marked success or failure accordingly, and fails the run on timeout or mismatch.
- request-AC8 -> This backlog slice. Evidence needed: A release contract document (docs/) states the flow — bump version in root and workspace package.json together, add changelogs/CHANGELOGS_X_Y_Z.md, tag vX.Y.Z, publish the GitHub Release — and lists the two repository secrets to configure (the Render deploy hook URLs).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_ci_and_release_pipeline_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_036_github_ci_render_blueprint_and_release_contract`
- Primary task(s): `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# AI Context
- Summary: Build the parallel CI workflow
- Keywords: scaffolded-backlog, build the parallel ci workflow, implementation-ready
- Use when: Implementing the scaffolded slice for Build the parallel CI workflow.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# Notes
- Task `task_037_orchestrate_ci_render_blueprint_and_release_contract` was finished via `logics-manager flow finish task` on 2026-07-15.
