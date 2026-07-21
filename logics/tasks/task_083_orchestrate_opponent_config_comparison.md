## task_083_orchestrate_opponent_config_comparison - Orchestrate opponent config comparison
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Map where opponent decision and classification data already exists server-side and how the client currently renders the abstract dot markers.
- [x] 2. Add an API path that returns opponent configurations and results only after the player's plan is locked and after the race, with the reveal rule enforced and unit-tested at the trust boundary.
- [x] 3. Build a readable comparison view reachable from qualifying (post-lock) and the report (post-race), legible without color alone, with EN/FR copy.
- [x] 4. Verify no reveal is possible before lock and no copy reads as a recommendation.
- [x] 5. Run typecheck, test, build, lint, e2e, and logics:validate; record validation evidence in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_180_add_api_gated_opponent_config_reveal_and_a_comparison_view`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `OpponentConfigComparison` renders opponent approach, preparation, pit, card, and post-race result fields after server reveal.
- request-AC2 -> API responses filter public `decisions`; `/leagues/:leagueId/opponent-configs` rejects before player lock and is unit-tested.
- request-AC3 -> Copy is descriptive-only and does not recommend or rank setups.
- request-AC4 -> Comparison rows use text labels and position badges, not color alone.
- request-AC5 -> No simulation, reward, or economy files changed.
- request-AC6 -> Unit tests cover reveal-timing and view-model shape; web tests cover i18n/app/report rendering.
- request-AC7 -> Proof: typecheck, tests, build, lint, e2e, and Logics validation pass.

# Validation
- `npm run typecheck` passed.
- `npx vitest run apps/api/src/app.test.ts apps/web/src/i18n/index.test.ts apps/web/src/app/App.test.tsx apps/web/src/features/ReportView.test.tsx` passed: 60 tests.
- `npm run test` passed: 24 passed, 1 skipped; 217 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run test:e2e` passed: 4 Playwright tests.
- `npm run lint` passed.
- `npm run logics:validate` passed before closeout; warnings are deferred/open-doc warnings only.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Added API-gated opponent configuration comparison and filtered public decision projection.
- Added a descriptive comparison view in Drive after lock and Report after race.
- No simulation behavior, rewards, or economy behavior changed.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_180_add_api_gated_opponent_config_reveal_and_a_comparison_view`
- Related request(s): `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`
- Finished on 2026-07-21.
- Linked backlog item(s): `item_180_add_api_gated_opponent_config_reveal_and_a_comparison_view`
- Related request(s): `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`

# AI Context
- Summary: Orchestrate opponent config comparison
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`
- Product brief(s): `prod_046_opponent_configuration_comparison_product_brief`
- Architecture decision(s): (none yet)
