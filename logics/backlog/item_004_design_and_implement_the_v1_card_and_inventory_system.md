## item_004_design_and_implement_the_v1_card_and_inventory_system - Design and implement the V1 card and inventory system
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Cards and progression
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Cards need to create exciting tactical moments without turning the first version into a large deckbuilder or unbalanced economy.
- Trailing players need comeback tools that feel like smart opportunities rather than artificial boosts.

# Scope
- In:
  - Define a first set of roughly 12 cards.
  - Use mostly consumable cards in V1.
  - Allow at most one card to be played per Grand Prix.
  - Support a simple inventory and shop using race credits.
  - Include card types that support weather gambles, reliability saves, aggressive starts, late pushes, rival pressure, and economy choices.
- Out:
  - Rare card crafting.
  - Player-to-player trading.
  - Auction house or dynamic market.
  - Large card collection meta.
  - Permanent passive card builds in V1.

# Acceptance criteria
- AC1: Each V1 card has a clear trigger, upside, downside or limitation, and race-report explanation.
- AC2: A player can buy, hold, and play a card before a Grand Prix.
- AC3: Played consumable cards are removed from inventory after resolution.
- AC4: At least three cards are useful specifically for trailing or risk-taking players without guaranteeing a win.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Each V1 card has a clear trigger, upside, downside or limitation, and race-report explanation.
- request-AC5 -> This backlog slice. Proof: AC2: A player can buy, hold, and play a card before a Grand Prix.
- request-AC7 -> This backlog slice. Proof: AC3: Played consumable cards are removed from inventory after resolution.
- request-AC6 -> This backlog slice. Evidence needed: The brief explicitly excludes V1 features that would inflate cost or scope, including live real-time races, complex 3D rendering, deep market systems, advanced notifications, and heavy vehicle upgrade trees.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_define_the_asynchronous_racing_league_game_product_brief`
- Primary task(s): `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery`

# AI Context
- Summary: Design and implement the V1 card and inventory system
- Keywords: scaffolded-backlog, design and implement the v1 card and inventory system, implementation-ready
- Use when: Implementing the scaffolded slice for Design and implement the V1 card and inventory system.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery` was finished via `logics-manager flow finish task` on 2026-07-13.
