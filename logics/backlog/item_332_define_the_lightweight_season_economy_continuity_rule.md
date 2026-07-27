## item_332_define_the_lightweight_season_economy_continuity_rule - Define the lightweight season economy continuity rule
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Season economy
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Repeated seasons need some continuity, but too much carry-over can snowball leaders.
- The user asked to develop the idea before it becomes broad card-economy work.
- The right first pass should be small, capped, and easy to remove or tune.

# Scope
- In:
  - Decide and document what persists across season rollover: credits, cards, cosmetics, palmares, and stats.
  - If implemented in this corpus, use capped partial credit carry-over and reset cards by default.
  - Prefer palmares/cosmetic recognition over large mechanical champion bonuses.
  - Run balance/replayability evidence if mechanical carry-over ships.
- Out:
  - Broad card-economy expansion.
  - Large winner bonuses.
  - Persistent card inventories across seasons unless specifically justified.
  - Paid cosmetics or external progression.

# Acceptance criteria
- AC1: A documented season rollover rule names each persisted and reset resource.
- AC2: Any implemented credit carry-over has an explicit cap and anti-snowball rationale.
- AC3: Season rollover tests cover top, middle, and bottom teams.
- AC4: Balance evidence is recorded if mechanical carry-over changes gameplay.

# AC Traceability
- request-AC10 -> This backlog slice. Proof: AC1: A documented season rollover rule names each persisted and reset resource.
- request-AC13 -> This backlog slice. Proof: AC2: Any implemented credit carry-over has an explicit cap and anti-snowball rationale.

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
