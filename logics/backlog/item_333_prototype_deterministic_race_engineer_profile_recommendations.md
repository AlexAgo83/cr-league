## item_333_prototype_deterministic_race_engineer_profile_recommendations - Prototype deterministic race-engineer profile recommendations
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Race engineer assistant
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- An immersive assistant could help if the game remains hard to read.
- The assistant must explain race profiles rather than play automatically.
- A deterministic first pass avoids model dependencies and keeps advice auditable.

# Scope
- In:
  - Frame the assistant as a race engineer that presents two or three race profiles such as prudent, attack, rain, or economy.
  - Tie each profile to circuit/weather/risk/card context with a short explanation.
  - Keep it optional and make manual plan choices remain available.
  - Use deterministic rules already present in the app where possible.
- Out:
  - Generative AI calls.
  - Autopilot that submits plans.
  - New onboarding mode.
  - Replacing card guidance or race report advice.

# Acceptance criteria
- AC1: The assistant presents bounded profile options with clear risk/reward text.
- AC2: The player can ignore the assistant and choose manually.
- AC3: Recommendations are deterministic and test-covered.
- AC4: Browser playtest confirms the assistant does not add a blocking step.

# AC Traceability
- request-AC11 -> This backlog slice. Proof: AC1: The assistant presents bounded profile options with clear risk/reward text.
- request-AC13 -> This backlog slice. Proof: AC2: The player can ignore the assistant and choose manually.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Prototype deterministic race-engineer profile recommendations
- Keywords: scaffolded-backlog, prototype deterministic race-engineer profile recommendations, implementation-ready
- Use when: Implementing the scaffolded slice for Prototype deterministic race-engineer profile recommendations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
