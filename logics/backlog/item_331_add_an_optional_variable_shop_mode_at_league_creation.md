## item_331_add_an_optional_variable_shop_mode_at_league_creation - Add an optional variable shop mode at league creation
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Shop variety
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A fixed shop is readable but can become repetitive across repeated private seasons.
- The user wants variable shop behavior only as an explicit league option and disabled by default.
- Shop variation must not obscure balance evidence for standard leagues.
- Owner decision: when enabled, the shop changes every GP and shows a fixed 6-card selection.

# Scope
- In:
  - Add a league-creation option for variable shop mode, default off.
  - When enabled, expose a deterministic 6-card shop selection per GP.
  - Show the mode clearly to players and keep reports/tests aware of the shop model.
  - Keep the fixed shop unchanged for existing/default leagues.
- Out:
  - Draft mode.
  - Random paid gacha mechanics.
  - Changing card effects.
  - Making variable shop the default.

# Acceptance criteria
- AC1: Existing/default leagues keep the fixed shop behavior.
- AC2: New leagues can opt into variable shop mode at creation.
- AC3: Variable shop contents are deterministic from league/season/round data, change every GP, show exactly 6 cards, and are testable.
- AC4: UI copy makes the mode understandable before league creation is confirmed.

# AC Traceability
- request-AC9 -> This backlog slice. Proof: AC1: Existing/default leagues keep the fixed shop behavior.
- request-AC10 -> This backlog slice. Proof: AC2: New leagues can opt into variable shop mode at creation.
- request-AC13 -> This backlog slice. Proof: AC3: Variable shop contents are deterministic from league/season/round data, change every GP, show exactly 6 cards, and are testable.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Add an optional variable shop mode at league creation
- Keywords: scaffolded-backlog, add an optional variable shop mode at league creation, implementation-ready
- Use when: Implementing the scaffolded slice for Add an optional variable shop mode at league creation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
