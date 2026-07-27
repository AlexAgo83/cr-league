## item_329_add_contextual_card_guidance_in_plan_and_garage - Add contextual card guidance in Plan and Garage
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 94
> Progress: 0%
> Complexity: Medium
> Theme: Card readability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Players need to understand why a card is useful, neutral, or risky for the next race.
- The guidance should reduce opacity without replacing player judgment.
- Card advice must stay aligned with existing card effects and circuit/weather data.
- Owner decision: use exactly three guidance labels first, `Useful here`, `Situational`, and `Low impact`; do not use "best card" language, full rankings, or hidden scoring explanations.

# Scope
- In:
  - Classify owned and purchasable cards against the next GP as `Useful here`, `Situational`, or `Low impact`.
  - Explain the classification with one short reason tied to circuit, weather, setup, position, or economy.
  - Prefer simple per-card deterministic rules over an opaque global scoring model.
  - Show guidance in the Garage and where the player chooses a plan/card.
  - Keep the model deterministic and covered by tests.
- Out:
  - Auto-selecting cards.
  - Changing card effects as part of the guidance work.
  - Adding a new recommendation service or telemetry system.

# Acceptance criteria
- AC1: Each card visible to the player can display a contextual guidance label for the next GP.
- AC2: Guidance never recommends a card that cannot legally be used.
- AC3: Guidance avoids "best card" wording and never auto-picks or auto-submits a card.
- AC4: Guidance exposes labels and short reasons without presenting a full ordered ranking.
- AC5: Tests cover weather cards, position/delta cards, economy cards, and no-card/low-impact cases.
- AC6: Browser playtest confirms card guidance is visible without layout overflow.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Each card visible to the player can display a contextual guidance label for the next GP.
- request-AC13 -> This backlog slice. Proof: AC6: Browser playtest confirms card guidance is visible without layout overflow.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Add contextual card guidance in Plan and Garage
- Keywords: scaffolded-backlog, add contextual card guidance in plan and garage, implementation-ready
- Use when: Implementing the scaffolded slice for Add contextual card guidance in Plan and Garage.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
