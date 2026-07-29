## task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel - Orchestrate the Solo Arcade and its Destiny Wheel
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: 2026-07-29 closeout stamps plus rejoining bullets the closeout split mid-sentence; status/progress unchanged.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Confirm on the running app that a replay given only a result, a circuit and liveries renders without plan or stats, before building anything around that assumption.
- [x] 2. Generate the icons and the hero from the prompts held in the asset backlog item, and land them through the runbook before the screens that use them.
- [x] 3. Split the Solo step into Campaign and Arcade first, and verify the campaign path is untouched, including the skip when no slot holds a game.
- [x] 4. Add the participant list and its storage, with tests, before any race is run.
- [x] 5. Build the draw on the shared simulation without touching the simulation or the replay.
- [x] 6. Verify on a rendered screen, not only through unit tests: the catalogue, an empty and a filled participant list, the replay without plan surfaces, and the final order.
- [x] 7. Verify the upgrade path for an existing player: a campaign save must still open through Campaign, and arcade must not have touched it.
- [x] 8. Run lint, typecheck, build, unit tests and the e2e suite, and record the results.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_356_produce_the_arcade_board_icons_and_hero`
- `item_357_split_solo_into_campaign_and_arcade`
- `item_358_enter_and_keep_the_destiny_wheel_participants`
- `item_359_race_the_destiny_wheel_draw_and_show_the_order`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `SoloModeView` offers Campaign and Arcade; `startCampaign` keeps the old `startSolo` body including the skip when no slot holds a game, asserted by "keeps Campaign going straight into a race when nothing is saved".
- request-AC2 -> This task. Proof: `ArcadeCatalogueView` maps over a games array holding one entry, so a second game is one array entry rather than a new screen. Nothing coming-soon is shown.
- request-AC3 -> This task. Proof: `DestinyWheelView` takes names only; `saveWheelParticipants` runs on launch, not on typing, asserted by "keeps the participants only once the draw is launched" and "restores the participants on the next visit".
- request-AC4 -> This task. Proof: `drawDestinyWheel` calls `simulateRace` directly with neutral decisions and no cardId; no LeagueState is built and no league engine is called.
- request-AC5 -> This task. Proof: a rendered run showed 14 map elements and 0 plan surfaces. ReplayView gained two optional opt-outs, `showPerformancePanel` and `towerTitleKey`, both defaulting to today's behaviour.
- request-AC6 -> This task. Proof: the result screen lists the classification with the winner accented and offers Draw again, Change the names and Back to the arcade. A rendered draw returned "1 Sam, 2 Chris, 3 Robin, 4 Alex" for names entered Alex-first.
- request-AC7 -> This task. Proof: `arcadeStorage` uses its own key; "does not touch campaign or multiplayer storage" asserts the slot, index and claim keys are unchanged, and a rendered run left `cr-league-solo-slot-v1-0` null.
- request-AC8 -> This task. Proof: `solo-campaign`, `arcade` and `destiny-wheel` are committed as 128px WebP (5.8-7.6 KB each) and `arcade-catalogue.webp` as 1600x600, 60 KB. The delivered sheet came back opaque as predicted and went through `rembg`; no extracted cell touched its edge, so no manual recrop was needed. A rendered run reported no 404 under /assets/crl.
- request-AC9 -> This task. Proof: lint, typecheck and build pass; 519 unit tests pass (9 skipped) and 7 chromium e2e scenarios pass.

# Validation
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 519 passed, 9 skipped.
- `npm run test:e2e` passed: 7 chromium scenarios.
- `npm run balance:gate` passed: 0 blocking issues.
- `logics-manager lint --require-status` passed.
- Rendered walkthrough of the arcade: catalogue, empty and filled participant lists, the replay reporting 14 map elements and 0 plan surfaces, the final order, and no 404 under /assets/crl.
- Finish workflow executed on 2026-07-29.
- Linked backlog/request close verification passed.

# Report
- Implementation complete, assets included.
- One diagnostic in the request was too optimistic: ReplayView needed no change for the plan surfaces, which are optional props, but the circuit traits panel and the tower title had no opt-out. Two optional props were added, both defaulting to the existing behaviour.
- Finished on 2026-07-29.
- Linked backlog item(s): `item_356_produce_the_arcade_board_icons_and_hero`, `item_357_split_solo_into_campaign_and_arcade`, `item_358_enter_and_keep_the_destiny_wheel_participants`, `item_359_race_the_destiny_wheel_draw_and_show_the_order`
- Related request(s): `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Two defects found by looking at the rendered screen rather than the tests: the tower was
  titled "Final classification" over a live order, which gives a draw away before the flag, and
  the participant input painted light text on the paper cockpit colour because the dark choice
  panel inverted every colour variable except that one.
- The board icon existence test kept its own copy of the icon name list, which could drift from
  the union it was meant to guard. `BoardIconName` is now derived from a `BOARD_ICON_NAMES`
  array and the test iterates that array, so a declared icon without artwork fails on sight.
  Verified by removing an icon and watching the suite fail.

# AI Context
- Summary: Orchestrate the Solo Arcade and its Destiny Wheel
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
