## task_035_orchestrate_personalized_race_recap - Orchestrate personalized race recap
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read ReportView.tsx, helpers.ts, i18n index, circuits.ts, simulateRace.ts event emission, and store.ts GP creation before changing anything.
- [ ] 2. Ship the GP identity item first — it changes sim inputs and test expectations, and the recap items depend on varied identities being real.
- [ ] 3. Ship the i18n interpolation item second (small, unblocks copy work).
- [ ] 4. Rebuild the three recap cards with template pools and unit tests; update EN/FR catalogs together and remove replaced keys.
- [ ] 5. Run typecheck, lint, unit tests, build, and the 3-GP e2e loop; verify recap copy in French visual QA before closeout.
- [ ] 6. Record validation proof and close the Logics chain.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_054_derive_grand_prix_identity_from_the_circuit_rotation`
- `item_055_add_placeholder_interpolation_to_the_i18n_layer`
- `item_056_rebuild_the_three_recap_cards_on_player_race_data`

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
- Implementation complete.

# AI Context
- Summary: Orchestrate personalized race recap
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_034_personalized_race_recap`
- Product brief(s): `prod_005_personalized_race_recap_product_brief`
- Architecture decision(s): (none yet)
