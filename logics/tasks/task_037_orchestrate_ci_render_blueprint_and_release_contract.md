## task_037_orchestrate_ci_render_blueprint_and_release_contract - Orchestrate CI, Render blueprint, and release contract
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read the referenced cp-wc-26, electrical-plan-editor, and logics-manager files on local disk before writing any YAML — the request adopts their patterns deliberately.
- [x] 2. Ship the release-contract item first (health version + docs) — both workflows depend on it.
- [x] 3. Ship ci.yml second and open the introducing PR to watch the five lanes run concurrently.
- [x] 4. Ship render.yaml and deploy-release.yml together — the deploy workflow references the blueprint's services and hooks.
- [x] 5. Hand the operator checklist at closeout: apply the blueprint on Render, create the two deploy-hook secrets, set the sync:false env vars, require the validate check on main.
- [x] 6. Run all local gates and record proof in the Logics closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_058_author_the_render_blueprint_for_api_web_and_database`
- `item_059_build_the_parallel_ci_workflow`
- `item_060_define_the_release_contract_and_version_verified_health`
- `item_061_build_the_release_triggered_render_deploy_workflow`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `render.yaml` defines `cr-league-api` with Node runtime, `/health`, `npm ci`, `db:generate`, `db:deploy`, shared+api builds, `npm run start -w @cr-league/api`, and autoDeployTrigger off; it defines `cr-league-web` as a static service publishing `apps/web/dist`, with SPA rewrite, cache headers, nosniff, DENY frame policy, referrer policy, and autoDeployTrigger off.
- request-AC2 -> This task. Proof: `render.yaml` provisions `cr-league-db` and wires API `DATABASE_URL` from that database; `WEB_ORIGIN` and `VITE_API_BASE_URL` are `sync: false`, and no secret literal was committed.
- request-AC3 -> This task. Proof: `.github/workflows/ci.yml` triggers on pull_request, push to main, and workflow_dispatch; defines parallel quality, unit matrix, e2e, build, and validate jobs; runs lint/typecheck/logics:validate, Vitest per workspace, Playwright chromium with always-uploaded report and failure artifacts, full build, npm cache, and PR-only cancel-in-progress.
- request-AC4 -> This task. Proof: The `unit` job uses a three-entry matrix (`shared`, `api`, `web`) with no `needs`, so workspace unit tests run concurrently and only the validate aggregator waits for completion.
- request-AC5 -> This task. Proof: `apps/api/src/version.ts` reads the root `package.json` version once through `createRequire`, `/health` returns it, and `apps/api/src/app.test.ts` asserts the response version equals `APP_VERSION`.
- request-AC6 -> This task. Proof: `.github/workflows/deploy-release.yml` triggers on release published and workflow_dispatch, verifies `v<version>` across root and workspace package files at the release SHA, waits for `ci.yml` success on that SHA via `gh run list`, then posts the Render API and web deploy hooks with `curl --fail-with-body`.
- request-AC7 -> This task. Proof: `deploy-release.yml` creates a GitHub Deployment, posts the API deploy hook, polls `$API_HEALTH_URL` 30 times at 10-second intervals until `.version` matches the tag without `v`, and marks the Deployment success or failure.
- request-AC8 -> This task. Proof: `docs/release-contract.md` documents version bump, changelog entry, `vX.Y.Z` tag, GitHub Release publication, required Render deploy-hook secrets, runtime Render env vars, verification, and rollback.
- request-AC9 -> This task. Proof: CI uses only `contents: read` and a dummy inline `DATABASE_URL`; deployment adds `actions: read` and `deployments: write` only for the release workflow, and production secrets are referenced only in deploy steps.
- request-AC10 -> This task. Proof: Local gates passed on 2026-07-15: `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` (63 tests), `npm run test:e2e` (2 Playwright tests), YAML parse for `render.yaml` and workflows, and `npm run logics:validate`; first remote PR CI remains to be observed after push.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Implemented render.yaml, CI workflow, release deployment workflow, versioned /health endpoint, release contract docs, and health version test. Local validation passed: npm run typecheck; npm run lint; npm run build; npm test; npm run test:e2e; ruby YAML parse for render.yaml and workflow YAML; npm run logics:validate.
- Finish workflow executed on 2026-07-15.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-15.
- Linked backlog item(s): `item_058_author_the_render_blueprint_for_api_web_and_database`, `item_059_build_the_parallel_ci_workflow`, `item_060_define_the_release_contract_and_version_verified_health`, `item_061_build_the_release_triggered_render_deploy_workflow`
- Related request(s): `req_036_github_ci_render_blueprint_and_release_contract`

# AI Context
- Summary: Orchestrate CI, Render blueprint, and release contract
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_036_github_ci_render_blueprint_and_release_contract`
- Product brief(s): `prod_007_ci_and_release_pipeline_product_brief`
- Architecture decision(s): (none yet)
