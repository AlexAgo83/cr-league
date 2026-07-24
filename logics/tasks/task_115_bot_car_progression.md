## task_115_bot_car_progression - Bot car progression
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_272_bot_car_progression`

# Acceptance criteria
- AC1: New bot teams start on free car skins only.
- AC2: During next-GP progression, bots with enough credits can buy one locked paid car and equip it.
- AC3: At season rollover, bot car skins rotate deterministically from cars available in that league.
- AC4: Paid car unlocks remain team/league-scoped and do not carry into another league.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_115_bot_car_progression.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_115_bot_car_progression.md` after implementation.
- rtk npm test: 309 passed, 7 skipped; rtk npm run typecheck: passed; rtk npm run lint: passed; rtk npm run build: passed; apps/api/src/app.test.ts covers bot car purchase, season rollover rotation, and per-league unlock isolation.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- `uniqueBotLivery` now assigns bots only free car assets at creation/restart.
- `startNextGrandPrix` runs bot paid-car purchases before bot card purchases, then rotates bot car skins on season rollover from free plus league-owned paid cars.
- API tests cover bot paid-car purchase, season rollover rotation, and per-league car unlock isolation.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_272_bot_car_progression`
- Related request(s): `req_114_bot_car_progression`

# AI Context
- Summary: Implement bot cosmetic car progression in the next-GP flow.
- Keywords: bot cars, paid car unlocks, season rollover, startNextGrandPrix, per-league skins
- Use when: Reviewing the bot car purchase/rotation implementation.
- Skip when: The work is unrelated to garage cosmetics.

# Links
- Request: `req_114_bot_car_progression`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `uniqueBotLivery` assigns only zero-price car assets and `apps/api/src/app.test.ts` asserts created bots start on free cars.
- request-AC2 -> This task. Proof: `buyBotCars` runs in `startNextGrandPrix`, debits credits, unlocks a paid car, equips it, and the API test asserts a bot spends 1000 credits on one paid car.
- request-AC3 -> This task. Proof: season rollover re-reads bot teams and rotates `livery.carAssetId` from free plus unlocked cars; the API test asserts the rollover car changes within that available set.
- request-AC4 -> This task. Proof: car unlocks remain on `Team.unlockedCarAssetIds`; the API test buys a paid car in one league and asserts a second league team stays unmodified.
