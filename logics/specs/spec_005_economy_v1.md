## spec_005_economy_v1 - Economy V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 85%
> Confidence: 75%
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`

# Purpose
Define the minimal economy for V1.

The economy should create useful choices between races without becoming the game.

# Resources
V1 has three resource concepts:

- Championship points: sporting ranking.
- Credits: spendable currency.
- Cards: inventory items.

No permanent car upgrades in V1.

# Credit Awards
Initial placeholder payout for 6-team races:

- P1: 150 credits
- P2: 130 credits
- P3: 115 credits
- P4: 105 credits
- P5: 100 credits
- P6: 95 credits

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
Initial placeholder prices:

- common tactical card: 100 credits;
- strong conditional card: 140 credits;
- economy card: 80 credits;
- defensive card: 120 credits.

The vertical slice can avoid a shop and give one card reward per race if that is faster.

# Inventory
V1 recommendation:

- max 5 cards in inventory;
- 1 card played per Grand Prix;
- played consumable cards are removed after resolution;
- duplicate cards allowed only if the UI stays clear.

# Shop Model
Simple shop:

- 3 cards offered before each Grand Prix;
- offers refresh after race;
- no dynamic market;
- no player trading.

This creates a small decision without overwhelming users.

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

# Non-goals
- No sponsors as a full system.
- No car part upgrades.
- No salaries or staff costs.
- No debt.
- No auction house.
- No premium currency.

# Open Questions
- Should card rewards be random, shop-based, or both?
- Is max 5 inventory too restrictive?
- Should credits persist across seasons?
- Should season winner receive cosmetic-only reward later?
