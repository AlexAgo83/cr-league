## item_058_author_the_render_blueprint_for_api_web_and_database - Author the Render blueprint for API, web, and database
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
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
