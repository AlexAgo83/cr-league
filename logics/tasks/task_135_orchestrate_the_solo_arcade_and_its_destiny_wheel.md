## task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel - Orchestrate the Solo Arcade and its Destiny Wheel
> From version: 0.8.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Confirm on the running app that a replay given only a result, a circuit and liveries renders without plan or stats, before building anything around that assumption.
- [ ] 2. Generate the icons and the hero from the prompts held in the asset backlog item, and land them through the runbook before the screens that use them.
- [ ] 3. Split the Solo step into Campaign and Arcade first, and verify the campaign path is untouched, including the skip when no slot holds a game.
- [ ] 4. Add the participant list and its storage, with tests, before any race is run.
- [ ] 5. Build the draw on the shared simulation without touching the simulation or the replay.
- [ ] 6. Verify on a rendered screen, not only through unit tests: the catalogue, an empty and a filled participant list, the replay without plan surfaces, and the final order.
- [ ] 7. Verify the upgrade path for an existing player: a campaign save must still open through Campaign, and arcade must not have touched it.
- [ ] 8. Run lint, typecheck, build, unit tests and the e2e suite, and record the results.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_356_produce_the_arcade_board_icons_and_hero`
- `item_357_split_solo_into_campaign_and_arcade`
- `item_358_enter_and_keep_the_destiny_wheel_participants`
- `item_359_race_the_destiny_wheel_draw_and_show_the_order`

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
- Summary: Orchestrate the Solo Arcade and its Destiny Wheel
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
