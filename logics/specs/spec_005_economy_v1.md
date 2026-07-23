## spec_005_economy_v1 - Economy V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 85%
> Confidence: 84
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`
> Non-semantic edit: 2026-07-23 corpus grooming note added; spec remains Draft.
> Semantic edit: 2026-07-23 refreshed current status after `req_086` completion and active `positionDelta` follow-up in `req_099`.

# Purpose
Define the minimal economy for V1.

The economy should create useful choices between races without becoming the game.

# Current Status
Keep this spec in Draft. The prototype has credits, fixed-price card buying, bot card buying, 15 consumable cards, an AI playtest report, and a balance simulation kit. The gameplay/economy integrity pass (`req_086`) has landed, so the monotonic payout and unchosen-card-consumption blockers are no longer open. Card economy tuning is still held until `req_099` resolves whether `positionDelta` position-gain cards affect classification or should be removed, then a fresh balance/playtest baseline confirms the honest card model.

# Resources
V1 has three resource concepts:

- Championship points: sporting ranking.
- Credits: spendable currency.
- Cards: inventory items.

No permanent car upgrades in V1.

# Credit Awards
Current implementation baseline for 6-team races:

- P1: 150 credits
- P2: 130 credits
- P3: 115 credits
- P4: 105 credits
- P5: 100 credits
- P6: 100 credits

Rationale:

- everyone receives something;
- strong finish matters;
- trailing players are not starved;
- spread is meaningful but not brutal.

# Optional Bonuses
- Rival objective: +20 credits.
- Clean finish with Prudent approach: +10 credits.
- High-risk recovery from lower half: +15 credits.
- Sponsor Bonus card: +50 credits, with race performance tradeoff.

Bonuses should be visible and capped.

# Card Pricing
Current implementation baseline:

- 120-credit cards: `rain_grip`, `fleet_maintenance`, `final_surge`, `fleet_sponsorship`, `qualifying_focus`, `economy_mode`.
- 180-credit cards: `launch_boost`, `urban_draft`, `soft_tires`, `defensive_order`, `adjustable_wing`, `rain_mapping`, `pit_relay`, `hard_tires`, `calculated_attack`.

The balance kit must read real `CARD_PRICES` rather than a generic price, so credit-margin evidence stays aligned with shipped prices.

Latest AI playtest and balance evidence:

- AI playtest PASS: every card was bought at least 16 times, including cards that were previously dead or overpriced.
- Balance simulation: no card dominates points, win rate, and credit margin simultaneously; economy cards can lead margin without also leading sporting output.

# Inventory
V1 recommendation:

- max 5 cards in inventory;
- 1 card played per Grand Prix;
- played consumable cards are removed after resolution;
- duplicate cards allowed only if the UI stays clear.

Keep max 5 until playtest says otherwise. If players hoard and stop making choices, reduce pressure through better recommendations before shrinking the cap. If the cap feels punitive, test 6-7 cards before adding larger collection systems.

# Shop Model
Simple shop:

- 3 cards offered before each Grand Prix;
- offers refresh after race;
- no dynamic market;
- no player trading.

This creates a small decision without overwhelming users.

Keep fixed offers until playtest evidence says the shop is too flat or too predictable. If it is, try a draft or hybrid offer model before adding rarity/crafting.

# Comeback Economy
Allowed:

- slightly flatter base payouts;
- cards useful from behind;
- objective bonuses for local wins;
- economy card tradeoffs.

Avoid:

- large direct cash bonus for last place;
- hidden compensation;
- leader tax;
- language that labels players as losers.

# Season Rollover Economy
Recommended first pass:

- carry over only 25-35% of unspent credits into the next season;
- cap the carry-over so a rich team cannot dominate the next season opener;
- make champion rewards cosmetic only, such as a badge, title, or palmares entry;
- show cosmetic champion rewards in the season history or palmares, not as a hidden account stat;
- avoid performance bonuses for last season's winner.

# Non-goals
- No sponsors as a full system.
- No car part upgrades.
- No salaries or staff costs.
- No debt.
- No auction house.
- No premium currency.

# Open Questions
- Is max 5 inventory too restrictive?
- After `req_099`, should position-gain cards remain as classification-affecting effects or be removed from the economy/card list?
