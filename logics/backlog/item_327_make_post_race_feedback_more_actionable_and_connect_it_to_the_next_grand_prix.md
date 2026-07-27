## item_327_make_post_race_feedback_more_actionable_and_connect_it_to_the_next_grand_prix - Make post-race feedback more actionable and connect it to the next Grand Prix
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Race feedback
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The report explains more than before, but beta players need a clearer next action after each GP.
- Advice should come from deterministic race, circuit, weather, rival, and card data.
- This should not become an assistant that plays for the user.

# Scope
- In:
  - Strengthen the race report and next-GP context with one primary reason, one next attempt, and one relevant card/setup hint.
  - Connect the advice to the next circuit and weather when known.
  - Include rival outcome when a rival exists or can be derived.
  - Keep copy localized and testable.
- Out:
  - Generative copy.
  - Full tutorial rewrite.
  - Mandatory objectives.
  - Replay highlight changes.

# Acceptance criteria
- AC1: Every completed GP report exposes a concise deterministic next-action recommendation.
- AC2: The recommendation references concrete race evidence or next-GP context.
- AC3: Report tests cover at least win, loss, card-hit/card-miss, and rival beat/lost cases.
- AC4: Browser playtest confirms the recommendation is visible without blocking the existing loop.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Every completed GP report exposes a concise deterministic next-action recommendation.
- request-AC6 -> This backlog slice. Proof: AC2: The recommendation references concrete race evidence or next-GP context.
- request-AC7 -> This backlog slice. Proof: AC3: Report tests cover at least win, loss, card-hit/card-miss, and rival beat/lost cases.
- request-AC13 -> This backlog slice. Proof: AC4: Browser playtest confirms the recommendation is visible without blocking the existing loop.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Make post-race feedback more actionable and connect it to the next Grand Prix
- Keywords: scaffolded-backlog, make post-race feedback more actionable and connect it to the next grand prix, implementation-ready
- Use when: Implementing the scaffolded slice for Make post-race feedback more actionable and connect it to the next Grand Prix.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
