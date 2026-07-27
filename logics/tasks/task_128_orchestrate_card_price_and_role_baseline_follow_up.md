## task_128_orchestrate_card_price_and_role_baseline_follow_up - Orchestrate card price and role baseline follow-up
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Record the fresh replayability baseline and balance-gate result from the post-closeout build.
- [ ] 2. Group the long balance audit by card and classify suspect cards before touching code.
- [ ] 3. Decide whether a tiny tuning change is justified. If not, close with a no-op decision and move roadmap attention to 0.6.
- [ ] 4. If tuning is justified, adjust only the smallest existing price/effect/copy surface for confirmed weak cards.
- [ ] 5. Run typecheck, lint, test, build, playtest:replayability, balance:gate, and Logics validation; record before/after metrics at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence`
- `item_320_apply_the_smallest_card_price_or_role_fix_only_for_confirmed_weak_cards`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence`. Proof: `docs/audits/card-price-role-baseline-2026-07-27.md` records replayability, balance-gate, and grouped long-audit card metrics.
- request-AC2 -> `item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence`. Proof: the baseline classifies `pit_relay` and `hard_tires` as confirmed weak at 180 credits, with other suspect cards marked inconclusive or acceptable.
- request-AC3 -> `item_320_apply_the_smallest_card_price_or_role_fix_only_for_confirmed_weak_cards`. Proof: only `CARD_PRICES.pit_relay` and `CARD_PRICES.hard_tires` changed, from 180 to 120 credits.
- request-AC4 -> `item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence`. Proof: no no-op path was taken because two confirmed weak cards justified a price-only fix.
- request-AC5 -> `item_320_apply_the_smallest_card_price_or_role_fix_only_for_confirmed_weak_cards`. Proof: post-change replayability has no dominant cluster above 25%, 0% boring races, 29.17% close finishes, and healthy order variety.
- request-AC6 -> This task. Proof: typecheck, lint, unit tests, build, replayability, balance gate, and Logics validation are recorded at closeout.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-27 validation: npm run typecheck OK; npm run lint OK; npm test OK with 352 passing / 7 skipped; npm run build OK; npm run playtest:replayability OK; npm run balance:gate OK. Logics validation pending final closeout.
- Finish workflow executed on 2026-07-27.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- 2026-07-27 implementation: scaffolded req_127 as the first 0.5 economy follow-up, classified suspect cards from fresh replayability plus balance evidence, and applied the smallest price-only fix: pit_relay and hard_tires move from 180 to 120 credits. No card effects, simulation formula, shop model, or UI surfaces changed.
- Finished on 2026-07-27.
- Linked backlog item(s): `item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence`, `item_320_apply_the_smallest_card_price_or_role_fix_only_for_confirmed_weak_cards`
- Related request(s): `req_127_card_price_and_role_baseline_follow_up_validate_weak_card_affordability_before_0_5_economy_expansion`

# AI Context
- Summary: Orchestrate card price and role baseline follow-up
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_127_card_price_and_role_baseline_follow_up_validate_weak_card_affordability_before_0_5_economy_expansion`
- Product brief(s): `prod_079_card_price_and_role_baseline_follow_up_product_brief`
- Architecture decision(s): (none yet)
