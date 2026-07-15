## req_036_github_ci_render_blueprint_and_release_contract - GitHub CI, Render blueprint, and release contract
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Medium
> Theme: CI/CD and release engineering
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add a GitHub Actions CI that runs on every PR and push to main, with genuinely parallel test lanes so wall-clock time tracks the slowest lane, not the sum.
- Add a Render blueprint (render.yaml) describing the API and web services so the production environment is reproducible from the repo.
- Define a release contract: how a version is cut, what must be true before it deploys, and how the deploy is verified after the fact.
- Make the release workflow trigger Render deploys via deploy hooks from CI, never via Render auto-deploy on push.
- Verify deploys by polling the API health endpoint until the running version matches the released tag.

# Context
- The stack matches cp-wc-26 almost exactly: npm-workspaces monorepo (apps/api Fastify, apps/web React+Vite static, packages/shared), Node 20+, ESM, TypeScript project references, Prisma 6 on PostgreSQL. cp-wc-26's render.yaml and deploy-release.yml transfer nearly verbatim.
- One deliberate divergence from cp-wc-26: cr-league has a real migrations history (prisma/migrations, 10 migrations) and a db:deploy script, so the Render build must run `prisma migrate deploy`, NOT `prisma db push`.
- Test surface today: ~2200 lines of fast vitest (jsdom) across three workspaces, and 2 Playwright e2e tests that mock the API with page.route — the e2e job needs no Postgres and no API server, only the Vite dev server Playwright already starts. Test sharding (electrical-plan-editor style --shard matrix) is deliberately NOT adopted yet: a 3-workspace matrix gives real parallelism at this size; the unit lane can move to vitest --shard later without touching other lanes.
- The API health endpoint exists (apps/api/src/features/health/routes.ts) but does not expose a version field; the post-deploy gate needs it. Root package.json version is 0.1.0 and workspace versions must stay in sync with it (cp-wc-26 convention: version single-sourced, tag vX.Y.Z matches package.json).
- The repo already has a curated changelogs/ directory (cp-wc-26 convention: one markdown file per version) — the release contract formalizes it rather than adding release automation tooling (no changesets/semantic-release, consistent with all sibling projects).
- Owner defaults (overridable at implementation review, not blockers): provision the production PostgreSQL as a Render database inside the blueprint (self-contained; switch DATABASE_URL to a dashboard secret if an external DB is preferred later), and run `prisma migrate deploy` inside the API buildCommand (free-tier compatible; preDeployCommand is a paid Render feature).
- Branch strategy: main-only with tag/release-driven deploys (the cdx-manager/logics-manager/electrical-plan-editor camp), not a release branch. Publishing a GitHub Release vX.Y.Z is the one and only deploy trigger; workflow_dispatch is the manual fallback.
- CI must keep running the existing gates: lint, typecheck, unit tests, build, e2e, and logics:validate (which requires the @grifhinz/logics-manager devDependency that req_033/item_052 adds — coordinate if req_033 has not shipped yet).

# Acceptance criteria
- AC1: render.yaml describes two services — API (runtime node, healthCheckPath /health, buildCommand running npm ci, prisma generate, prisma migrate deploy, shared+api builds; startCommand node dist/server.js) and web (runtime static, staticPublishPath apps/web/dist, SPA rewrite to index.html, no-cache on index.html, immutable 1-year cache on assets, nosniff/deny frame/referrer security headers) — both with autoDeployTrigger off.
- AC2: The blueprint provisions a Render PostgreSQL database and wires DATABASE_URL from it; all other secrets (WEB_ORIGIN, VITE_API_BASE_URL) are declared sync: false; no secret value is committed.
- AC3: ci.yml runs on pull_request, push to main, and workflow_dispatch with five parallel lanes — quality (lint, typecheck, logics:validate), unit (matrix over the three workspaces running vitest per workspace), e2e (Playwright chromium with playwright-report always uploaded and traces on failure), build (full npm run build), and a validate aggregator with if: always() that fails if any lane failed — plus npm caching and cancel-in-progress concurrency scoped to PRs.
- AC4: The unit lane's total wall-clock is bounded by the slowest workspace, verified by three concurrent jobs in the Actions run; no lane waits on another lane's completion except the aggregator.
- AC5: GET /health on the API returns the application version read from package.json, and the value matches the root package.json version in a unit test.
- AC6: deploy-release.yml triggers on release published (and workflow_dispatch fallback), verifies the tag equals v<package.json version>, polls the CI workflow conclusion for the release SHA until success (no test re-run), then POSTs RENDER_API_DEPLOY_HOOK_URL and RENDER_WEB_DEPLOY_HOOK_URL via curl --fail-with-body.
- AC7: After triggering the API hook, the workflow polls /health up to 30 times at 10-second intervals until the reported version equals the release tag, records a GitHub Deployment marked success or failure accordingly, and fails the run on timeout or mismatch.
- AC8: A release contract document (docs/) states the flow — bump version in root and workspace package.json together, add changelogs/CHANGELOGS_X_Y_Z.md, tag vX.Y.Z, publish the GitHub Release — and lists the two repository secrets to configure (the Render deploy hook URLs).
- AC9: Workflows use least-privilege permissions (contents: read; deployments: write only where the Deployment is created) and reference no secrets in CI test jobs (dummy inline DATABASE_URL where Prisma generate needs one).
- AC10: Typecheck, lint, unit tests, build, and e2e pass locally, and the ci.yml lanes are green on the first PR that introduces them.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_007_ci_and_release_pipeline_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- package.json
- vitest.config.ts
- playwright.config.ts
- prisma/schema.prisma
- apps/api/src/features/health/routes.ts
- apps/api/src/config.ts
- tests/e2e/private-league.spec.ts
- changelogs/
- Pattern source (local disk, read-only): /Users/alexandreagostini/Documents/cp-wc-26/render.yaml and .github/workflows/deploy-release.yml — closest Render setup: node API + static web blueprint, autoDeployTrigger off, release-published deploy via deploy-hook curl, post-deploy /health version-match poll gate.
- Pattern source (local disk, read-only): /Users/alexandreagostini/Documents/electrical-plan-editor/.github/workflows/ci.yml and render-release-deploy.yml — split CI lanes (quality/unit/ui-sharded/e2e/build) with an if-always aggregator job, PR-only cancel-in-progress concurrency, deploy workflow that polls CI success on the release SHA before curling the Render deploy hook.
- Pattern source (local disk, read-only): /Users/alexandreagostini/Documents/logics-manager/.github/workflows/release.yml — tag/package.json version-match check and await-ci polling via gh run list instead of re-running tests.

# AI Context
- Summary: GitHub CI, Render blueprint, and release contract
- Keywords: request-chain-scaffold, github ci, render blueprint, and release contract, development-ready
- Use when: You need to implement or review the scaffolded workflow for GitHub CI, Render blueprint, and release contract.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_058_author_the_render_blueprint_for_api_web_and_database`
- `item_059_build_the_parallel_ci_workflow`
- `item_060_define_the_release_contract_and_version_verified_health`
- `item_061_build_the_release_triggered_render_deploy_workflow`
