## task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode - Orchestrate Solo / Multiplayer entry and local solo mode
> From version: 0.6.1
> Schema version: 1.0
> Status: In progress
> Understanding: 96
> Confidence: 88
> Progress: 75%
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
- [ ] 2. Refactor API-backed multiplayer actions to use the shared engine around DB load/persist, with regression tests proving create/join/rejoin, qualifying, resolve, next GP, garage, livery, and team rename still behave as before.
- [x] 3. Wave 2: add the Solo / Multiplayer setup screen before profile setup. Solo bypasses profile; Multiplayer keeps the existing profile gate and LeagueSetupView create/join/saved-claims sublevel.
- [x] 4. Add one versioned local solo save, recommended `cr-league-solo-save-v1`, storing LeagueState plus schemaVersion, createdAt, and updatedAt metadata. Keep it separate from profile and multiplayer claim keys.
- [ ] 5. Wave 3: wire solo actions to localStorage load -> shared engine transition -> React state update -> localStorage persist.
- [ ] 6. Cover solo briefing, plan editing, chrono/qualifying, directive lock, GP resolution, replay/report, next Grand Prix, garage buy/sell, livery update, and team rename.
- [ ] 7. Add clear en/fr copy, a `Solo local` indicator, and a confirmed reset solo command that only clears the solo save.
- [ ] 8. Add focused tests for setup hierarchy, multiplayer regression, solo no-fetch behavior, solo persistence, solo reset, and multiplayer logout isolation.
- [ ] 9. Run web typecheck, focused Vitest suites, web build, and Logics validation; record any deliberately deferred work in the closeout notes.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Progress notes
- 2026-07-28: Implementation started; current progress is around 5-10%. Three workstreams are now active: shared engine extraction, Solo / Multiplayer setup UI, and solo local storage/action adapter.
- 2026-07-28: Wave checkpoints committed: `58eb7b3` local solo save storage, `7145fda` shared league engine helpers, `443a56c` Solo / Multiplayer setup choice, and `a811ba9` corrected the setup gate so Solo / Multiplayer remains before profile setup even when a profile is already saved. Web App/App.profile suites and web/shared typechecks passed at this checkpoint.
- 2026-07-28: Wave 3 first slice replaced the Solo stub with a real local save start/resume path. Solo now bypasses profile, creates `solo-local`, persists `cr-league-solo-save-v1`, skips tab-refresh rejoin, and routes directive submit, buy/sell card, livery update, and team rename through the shared engine into localStorage. Focused no-fetch start proof, App/soloStorage Vitest, and web typecheck pass.
- 2026-07-28: Solo clarity/safety slice added the `Solo local` topbar badge and a confirmed reset action that clears only `cr-league-solo-save-v1`; focused reset no-fetch coverage passes.
- 2026-07-28: Qualification slice moved `createQualifyingRuns` into `packages/shared`, added shared `runQualifying`, kept API qualification on the shared generator, and wired Solo chrono through localStorage with no-fetch proof.
- 2026-07-28: Local GP loop slice added shared `resolveGrandPrix` and `startNextGrandPrix`, then wired Solo launch and next GP through localStorage. Focused no-fetch proof now covers Solo start, chrono, directive, GP resolution, and next GP.
- Remaining implementation risk is Wave 3 completion: car unlocks if kept exposed, broader no-fetch action coverage, web build, and final Logics closeout.

# Backlog
- `item_347_introduce_the_solo_multiplayer_setup_hierarchy`
- `item_348_build_local_solo_state_persistence_and_action_adapter`
- `item_349_polish_solo_multiplayer_affordances_and_reset_safety`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation launched; no closeout has been attempted.

# AI Context
- Summary: Orchestrate Solo / Multiplayer entry and local solo mode
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): `adr_009_shared_local_and_network_league_engine`
