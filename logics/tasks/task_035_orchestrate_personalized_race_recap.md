## task_035_orchestrate_personalized_race_recap - Orchestrate personalized race recap
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
- [x] 1. Read ReportView.tsx, helpers.ts, i18n index, circuits.ts, simulateRace.ts event emission, and store.ts GP creation before changing anything.
- [x] 2. Ship the GP identity item first — it changes sim inputs and test expectations, and the recap items depend on varied identities being real.
- [x] 3. Ship the i18n interpolation item second (small, unblocks copy work).
- [x] 4. Rebuild the three recap cards with template pools and unit tests; update EN/FR catalogs together and remove replaced keys.
- [x] 5. Run typecheck, lint, unit tests, build, and the 3-GP e2e loop; verify recap copy in French visual QA before closeout.
- [x] 6. Record validation proof and close the Logics chain.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_054_derive_grand_prix_identity_from_the_circuit_rotation`
- `item_055_add_placeholder_interpolation_to_the_i18n_layer`
- `item_056_rebuild_the_three_recap_cards_on_player_race_data`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: `packages/shared/src/domain/circuits.ts` owns the identity table; API uses `raceInputFromCircuit`, web spreads `CITY_CIRCUIT_IDENTITIES` into route geometry, and `raceRecapCards` uses shared next-round identity.
- request-AC3 -> This task. Proof: `apps/web/src/i18n/index.ts` supports optional placeholder params; `apps/web/src/i18n/index.test.ts` covers substitution, missing params, and legacy lookups.
- request-AC5 -> This task. Proof: `raceRecapCards` computes prep/card/approach verdicts from resolved weather, own card events, and final `positionChange`; helper and App tests cover the rendered output.
- request-AC7 -> This task. Proof: EN/FR catalogs contain three variants for recap outcome families; helper selection is deterministic by seed/round and tests cover non-generic card/next-GP output.
- request-AC9 -> This task. Proof: `apps/web/src/app/helpers.test.ts` covers card-rain, quiet race, and rival-card fixtures; `apps/web/src/app/App.test.tsx` expectations were re-derived for the new recap copy.
- request-AC10 -> This task. Proof: Passed `npm run typecheck`, `npm run lint`, targeted unit tests, `npm run test:e2e`, and `npm run build`.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Passed: npm run typecheck; npm run lint; npm test -- apps/web/src/app/helpers.test.ts apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts packages/shared/src/domain/circuits.test.ts apps/api/src/app.test.ts; npm run test:e2e; npm run build
- Finish workflow executed on 2026-07-15.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-15.
- Linked backlog item(s): `item_054_derive_grand_prix_identity_from_the_circuit_rotation`, `item_055_add_placeholder_interpolation_to_the_i18n_layer`, `item_056_rebuild_the_three_recap_cards_on_player_race_data`
- Related request(s): `req_034_personalized_race_recap`

# AI Context
- Summary: Orchestrate personalized race recap
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_034_personalized_race_recap`
- Product brief(s): `prod_005_personalized_race_recap_product_brief`
- Architecture decision(s): (none yet)
