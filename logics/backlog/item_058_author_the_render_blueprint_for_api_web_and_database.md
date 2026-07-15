## item_058_author_the_render_blueprint_for_api_web_and_database - Author the Render blueprint for API, web, and database
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Infrastructure as code
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Production topology exists nowhere in the repo; standing up or reproducing the environment is manual dashboard work.
- cp-wc-26 proved the exact blueprint shape for this stack, but it uses prisma db push while cr-league has a real migration history that must be respected.

# Scope
- In:
  - Write render.yaml with the API service (node runtime, region, plan, healthCheckPath /health, autoDeployTrigger off, buildCommand: npm ci && prisma generate && prisma migrate deploy && shared+api builds, startCommand: npm run start -w @cr-league/api), mirroring cp-wc-26's structure.
  - Add the web static service: buildCommand building shared+web, staticPublishPath apps/web/dist, SPA rewrite, cp-wc-26's cache and security headers, pullRequestPreviewsEnabled true, autoDeployTrigger off.
  - Provision a Render PostgreSQL database in the blueprint and reference its connection string as the API's DATABASE_URL (owner default; leave a comment noting the external-DB alternative via sync: false).
  - Declare WEB_ORIGIN and VITE_API_BASE_URL as sync: false env vars; NODE_VERSION and API_HOST/API_PORT as plaintext.
  - Verify apps/api start script serves /health with the configured host/port on Render's expected port convention.
- Out:
  - Actually creating the Render services or database (dashboard/one-click blueprint apply is an operator action).
  - Dockerfiles, staging environments, custom domains.

# Acceptance criteria
- AC1: render.yaml passes Render blueprint validation (or a documented schema check) and contains both services plus the database with autoDeployTrigger off on both services.
- AC2: The API buildCommand uses prisma migrate deploy, never db push, and no secret value appears in the file.
- AC3: Header and rewrite rules for the static site match the cp-wc-26 set (no-cache index.html, immutable assets, nosniff, DENY framing).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: render.yaml passes Render blueprint validation (or a documented schema check) and contains both services plus the database with autoDeployTrigger off on both services.
- request-AC2 -> This backlog slice. Proof: AC2: The API buildCommand uses prisma migrate deploy, never db push, and no secret value appears in the file.
- request-AC10 -> This backlog slice. Proof: AC3: Header and rewrite rules for the static site match the cp-wc-26 set (no-cache index.html, immutable assets, nosniff, DENY framing).
- request-AC4 -> This backlog slice. Evidence needed: The unit lane's total wall-clock is bounded by the slowest workspace, verified by three concurrent jobs in the Actions run; no lane waits on another lane's completion except the aggregator.
- request-AC5 -> This backlog slice. Evidence needed: GET /health on the API returns the application version read from package.json, and the value matches the root package.json version in a unit test.
- request-AC6 -> This backlog slice. Evidence needed: deploy-release.yml triggers on release published (and workflow_dispatch fallback), verifies the tag equals v<package.json version>, polls the CI workflow conclusion for the release SHA until success (no test re-run), then POSTs RENDER_API_DEPLOY_HOOK_URL and RENDER_WEB_DEPLOY_HOOK_URL via curl --fail-with-body.
- request-AC7 -> This backlog slice. Evidence needed: After triggering the API hook, the workflow polls /health up to 30 times at 10-second intervals until the reported version equals the release tag, records a GitHub Deployment marked success or failure accordingly, and fails the run on timeout or mismatch.
- request-AC8 -> This backlog slice. Evidence needed: A release contract document (docs/) states the flow — bump version in root and workspace package.json together, add changelogs/CHANGELOGS_X_Y_Z.md, tag vX.Y.Z, publish the GitHub Release — and lists the two repository secrets to configure (the Render deploy hook URLs).
- request-AC9 -> This backlog slice. Evidence needed: Workflows use least-privilege permissions (contents: read; deployments: write only where the Deployment is created) and reference no secrets in CI test jobs (dummy inline DATABASE_URL where Prisma generate needs one).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_ci_and_release_pipeline_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_036_github_ci_render_blueprint_and_release_contract`
- Primary task(s): `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# AI Context
- Summary: Author the Render blueprint for API, web, and database
- Keywords: scaffolded-backlog, author the render blueprint for api, web, and database, implementation-ready
- Use when: Implementing the scaffolded slice for Author the Render blueprint for API, web, and database.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# Notes
- Task `task_037_orchestrate_ci_render_blueprint_and_release_contract` was finished via `logics-manager flow finish task` on 2026-07-15.
