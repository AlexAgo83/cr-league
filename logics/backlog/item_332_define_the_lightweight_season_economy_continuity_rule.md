## item_332_define_the_lightweight_season_economy_continuity_rule - Define the lightweight season economy continuity rule
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Season economy
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Repeated seasons need some continuity, but too much carry-over can snowball leaders.
- The user asked to develop the idea before it becomes broad card-economy work.
- The right first pass should be small, capped, and easy to remove or tune.
- Owner decision: first pass resets credits and cards; capped credit carry-over is a later evidence-gated follow-up if reset feels too dry in beta.

# Scope
- In:
  - Document and implement first-pass season rollover: preserve players, palmares, archived season stats, and cosmetic/team identity; reset credits and cards.
  - Record capped partial credit carry-over as a later option, not the first implementation.
  - Prefer palmares/cosmetic recognition over large mechanical champion bonuses.
  - Run balance/replayability evidence if mechanical carry-over ships.
- Out:
  - Broad card-economy expansion.
  - Large winner bonuses.
  - Persistent card inventories across seasons unless specifically justified.
  - Paid cosmetics or external progression.

# Acceptance criteria
- AC1: The documented season rollover rule preserves players, palmares, archived season stats, and cosmetic/team identity.
- AC2: The first implementation resets credits and cards for every team.
- AC3: Any later credit carry-over proposal is documented as a separate evidence-gated follow-up with a 25-35% cap candidate and anti-snowball rationale.
- AC4: Season rollover tests cover top, middle, and bottom teams.
- AC5: Balance evidence is recorded if mechanical carry-over changes gameplay in a later slice.

# AC Traceability
- request-AC10 -> This backlog slice. Proof: AC1 and AC2 document the first-pass season rollover rule, including preserved and reset resources.
- request-AC13 -> This backlog slice. Proof: AC4: Season rollover tests cover top, middle, and bottom teams.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Define the lightweight season economy continuity rule
- Keywords: scaffolded-backlog, define the lightweight season economy continuity rule, implementation-ready
- Use when: Implementing the scaffolded slice for Define the lightweight season economy continuity rule.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
