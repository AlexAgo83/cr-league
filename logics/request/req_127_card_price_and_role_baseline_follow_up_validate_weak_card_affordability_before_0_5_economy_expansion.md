## req_127_card_price_and_role_baseline_follow_up_validate_weak_card_affordability_before_0_5_economy_expansion - Card price and role baseline follow-up: validate weak card affordability before 0.5 economy expansion
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Economy evidence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Decide the next 0.5 economy step from measured card evidence, not from the stale card-economy hold language.
- Validate whether underperforming cards are truly dead/overpriced, merely situational, or artifacts of the current balance sample.
- If evidence confirms weak card role or affordability, make the smallest price/effect/copy adjustment that gives the card a real reason to exist.
- Keep broad economy expansion, draft shops, season rollover, and new card families out until this smaller card-role baseline is settled.

# Context
- The replayability baseline does not justify nerfing aggressive mini-pack: no cluster crosses the configured 25% dominance threshold, finishing-order variety is 100%, comeback race rate is 97.22%, close finishes are 30.56%, and boring races are 0%.
- The stronger evidence is card role and affordability: the long balance audit shows a set of cards with weak sporting output and poor or awkward credit margin, especially 180-credit cards and fleet_sponsorship as an economy card that buys often but underperforms heavily.
- The current Economy V1 spec still says card tuning was waiting on the positionDelta honesty question. That blocker is now settled; the remaining question is whether the post-remediation evidence shows specific card price/role problems.
- Prefer changing an existing constant or card effect over adding mechanics. If diagnostics do not confirm a stable problem, close the corpus with a no-tuning decision and move to 0.6 beta-season lifecycle.

# Acceptance criteria
- AC1: A fresh card-role baseline records replayability metrics, balance-gate result, and grouped long-audit card metrics for win rate, average points, buy/next-card rate, and credit margin.
- AC2: The corpus classifies each suspect card as confirmed weak, acceptable situational, or inconclusive, with evidence from reports rather than intuition.
- AC3: If tuning is applied, it is the smallest scoped change to CARD_PRICES, card effect magnitude, or card role copy needed to fix a confirmed weak card.
- AC4: If no tuning is applied, the task records the reason and leaves gameplay code unchanged.
- AC5: Replayability/fun signals remain acceptable after any tuning: no dominant cluster above 25%, no boring-race regression, close-finish rate remains visible, and champion/finishing-order variety remains healthy.
- AC6: npm run typecheck, npm test, npm run lint, npm run build, npm run playtest:replayability, npm run balance:gate, and npm run logics:validate pass before closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_079_card_price_and_role_baseline_follow_up_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/specs/spec_005_economy_v1.md
- logics/product/prod_045_card_economy_rebalance_product_brief.md
- logics/request/req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons.md
- logics/request/req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs.md
- scripts/replayability-analytics.ts
- scripts/balance-simulations.ts
- packages/shared/src/economy/constants.ts
- packages/shared/src/cards/definitions.ts
- packages/shared/src/simulation/simulateRace.ts
- reports/playtest/replayability-analytics.md
- docs/audits/balance-latest.json
- Fresh replayability baseline on 2026-07-27: 12 seasons x 6 GP x 14 agents, 4 unique champions, 72 unique finishing orders, 97.22% comeback race rate, 30.56% close finishes, 0% boring races, and no dominant cluster above the 25% threshold. Top clusters remain aggressive/speed/mini_pack/soft_tires at 19.44% and aggressive/weather/mini_pack/soft_tires at 18.06%.
- Latest long balance audit grouped by card shows no hard dominant card, but several expensive or low-role cards lag: pit_relay 5.07% win / 8.09 avg points / -67.28 avg credit margin, hard_tires 6.17% / 8.16 / -66.66, fleet_sponsorship 3.46% / 6.66 / +42.56, final_surge 6.99% / 8.86 / -6.42, and defensive_order 6.39% / 8.43 / -66.21.
- Short balance gate on 2026-07-27 passed, but its 1 run x 4 circuits sample is noisy: use it as a safety gate, not as the sole tuning basis.

# AI Context
- Summary: Card price and role baseline follow-up: validate weak card affordability before 0.5 economy expansion
- Keywords: request-chain-scaffold, card price and role baseline follow-up: validate weak card affordability before 0.5 economy expansion, development-ready
- Use when: You need to implement or review the scaffolded workflow for Card price and role baseline follow-up: validate weak card affordability before 0.5 economy expansion.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence`
- `item_320_apply_the_smallest_card_price_or_role_fix_only_for_confirmed_weak_cards`
