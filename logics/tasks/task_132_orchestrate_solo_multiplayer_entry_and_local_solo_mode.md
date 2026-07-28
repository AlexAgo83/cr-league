## task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode - Orchestrate Solo / Multiplayer entry and local solo mode
> From version: 0.6.1
> Schema version: 1.0
> Status: Done
> Understanding: 96
> Confidence: 92
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Confirmed product decisions: Solo appears before profile setup; Multiplayer keeps the existing profile then create/join flow; Solo V1 is local no-API after app load, not installable/PWA offline.
- Confirmed architecture decision: use `adr_009_shared_local_and_network_league_engine`; extract shared league rules into `packages/shared` and keep API/localStorage as persistence adapters.

# Plan
- [x] 1. Wave 1: extract shared league rules under `packages/shared/src/domain/leagueFactory.ts` and `packages/shared/src/domain/leagueEngine.ts` without changing multiplayer behavior.
- [x] 2. Refactor API-backed multiplayer actions to use the shared engine around DB load/persist, with regression tests proving create/join/rejoin, qualifying, resolve, next GP, garage, livery, and team rename still behave as before.
- [x] 3. Wave 2: add the Solo / Multiplayer setup screen before profile setup. Solo bypasses profile; Multiplayer keeps the existing profile gate and LeagueSetupView create/join/saved-claims sublevel.
- [x] 4. Add one versioned local solo save, recommended `cr-league-solo-save-v1`, storing LeagueState plus schemaVersion, createdAt, and updatedAt metadata. Keep it separate from profile and multiplayer claim keys.
- [x] 5. Wave 3: wire solo actions to localStorage load -> shared engine transition -> React state update -> localStorage persist.
- [x] 6. Cover solo briefing, plan editing, chrono/qualifying, directive lock, GP resolution, replay/report, next Grand Prix, garage buy/sell, livery update, and team rename.
- [x] 7. Add clear en/fr copy, a `Solo local` indicator, and a confirmed reset solo command that only clears the solo save.
- [x] 8. Add focused tests for setup hierarchy, multiplayer regression, solo no-fetch behavior, solo persistence, solo reset, and multiplayer logout isolation.
- [x] 9. Run web typecheck, focused Vitest suites, web build, and Logics validation; record any deliberately deferred work in the closeout notes.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Progress notes
- 2026-07-28: Implementation started; current progress is around 5-10%. Three workstreams are now active: shared engine extraction, Solo / Multiplayer setup UI, and solo local storage/action adapter.
- 2026-07-28: Wave checkpoints committed: `58eb7b3` local solo save storage, `7145fda` shared league engine helpers, `443a56c` Solo / Multiplayer setup choice, and `a811ba9` corrected the setup gate so Solo / Multiplayer remains before profile setup even when a profile is already saved. Web App/App.profile suites and web/shared typechecks passed at this checkpoint.
- 2026-07-28: Wave 3 first slice replaced the Solo stub with a real local save start/resume path. Solo now bypasses profile, creates `solo-local`, persists `cr-league-solo-save-v1`, skips tab-refresh rejoin, and routes directive submit, buy/sell card, livery update, and team rename through the shared engine into localStorage. Focused no-fetch start proof, App/soloStorage Vitest, and web typecheck pass.
- 2026-07-28: Solo clarity/safety slice added the `Solo local` topbar badge and a confirmed reset action that clears only `cr-league-solo-save-v1`; focused reset no-fetch coverage passes.
- 2026-07-28: Qualification slice moved `createQualifyingRuns` into `packages/shared`, added shared `runQualifying`, kept API qualification on the shared generator, and wired Solo chrono through localStorage with no-fetch proof.
- 2026-07-28: Local GP loop slice added shared `resolveGrandPrix` and `startNextGrandPrix`, then wired Solo launch and next GP through localStorage. Focused no-fetch proof now covers Solo start, chrono, directive, GP resolution, and next GP.
- 2026-07-28: Garage car unlocks are now handled by the shared engine and wired through localStorage in Solo, with no-fetch coverage for buying and equipping a paid car.
- 2026-07-28: The API-only league controls modal is hidden in Solo so settings/reminders/restart commands cannot escape the local mode path.
- 2026-07-28: API-backed card buy/sell, car unlock, livery update, and team rename now call the shared engine before persisting DB deltas, preserving the existing API tests.
- 2026-07-28: API-backed `resolveCurrentGrandPrix` and `startNextGrandPrix` now use the shared engine for race resolution, rewards, consumed cards, next-round validation, and season summary state while preserving server DB transactions, bot fill/chrono/shop/car-buy/card-buy behavior, and persisted seeds.
- 2026-07-28: Final validation checkpoint passed: shared/api/web typechecks, API lifecycle regression tests, web solo/multiplayer focused suites, web production build, and Logics lint/audit/flow validate.

# Backlog
- `item_347_introduce_the_solo_multiplayer_setup_hierarchy`
- `item_348_build_local_solo_state_persistence_and_action_adapter`
- `item_349_polish_solo_multiplayer_affordances_and_reset_safety`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `App.test.tsx` covers the root splash leading to Solo / Multiplayer before create/join.
- request-AC2 -> This task. Proof: `App.profile.test.tsx` and `apps/api/src/app.test.ts` keep profile-backed multiplayer create/join/rejoin and API behavior passing.
- request-AC3 -> This task. Proof: `App.test.tsx` covers starting Solo before profile with `fetch` not called and `cr-league-solo-save-v1` persisted.
- request-AC4 -> This task. Proof: `App.test.tsx` covers Solo chrono, directive, GP resolve, next GP, garage car unlock, and reset; shared engine tests cover card/livery/name/resolve/next transitions.
- request-AC5 -> This task. Proof: `soloStorage.test.ts` covers the versioned solo save; profile/logout paths leave solo reset behind a dedicated command.
- request-AC6 -> This task. Proof: Solo tests spy on `globalThis.fetch` and assert no API calls for setup, chrono, resolve/next GP, and garage car unlock.
- request-AC7 -> This task. Proof: en/fr i18n keys and UI tests cover Solo / Multiplayer copy plus the `Solo local` badge/reset affordance.
- request-AC8 -> This task. Proof: shared/api/web typechecks, API/web Vitest suites, web build, and Logics validation passed on 2026-07-28.

# Validation
- `rtk npm run typecheck -w @cr-league/shared`
- `rtk npm run typecheck -w @cr-league/api`
- `rtk npm run typecheck -w @cr-league/web`
- `rtk npx vitest run packages/shared/src/domain/leagueEngine.test.ts apps/api/src/app.test.ts apps/api/src/app.postgres.test.ts --environment node`
- `rtk npx vitest run packages/shared/src/domain/leagueEngine.test.ts apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/soloStorage.test.ts apps/web/src/i18n/index.test.ts --environment jsdom`
- `rtk npm run build -w @cr-league/web`
- `rtk logics-manager lint --require-status`
- `rtk logics-manager audit --group-by-doc`
- `rtk logics-manager flow validate task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode`
- PASSED: shared/api/web typechecks; API lifecycle Vitest; web solo/multiplayer Vitest; web production build; Logics lint/audit/flow validate
- Finish workflow executed on 2026-07-28.
- Linked backlog/request close verification passed.

# Report
- Solo / Multiplayer entry is implemented with Solo before profile setup and Multiplayer preserving the existing profile/private-league flow.
- Solo V1 uses one isolated versioned local save and routes gameplay/team/garage actions through the shared engine into localStorage without API calls.
- Multiplayer API team mutations, qualification generation, GP resolution, and next-GP lifecycle now use shared engine rules while keeping server persistence and bot lifecycle behavior.
- Validation passed on 2026-07-28; no known scope blocker remains.
- Finished on 2026-07-28.
- Linked backlog item(s): `item_347_introduce_the_solo_multiplayer_setup_hierarchy`, `item_348_build_local_solo_state_persistence_and_action_adapter`, `item_349_polish_solo_multiplayer_affordances_and_reset_safety`
- Related request(s): `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`

# AI Context
- Summary: Orchestrate Solo / Multiplayer entry and local solo mode
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): `adr_009_shared_local_and_network_league_engine`
