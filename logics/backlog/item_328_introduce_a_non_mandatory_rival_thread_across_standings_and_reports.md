## item_328_introduce_a_non_mandatory_rival_thread_across_standings_and_reports - Introduce a non-mandatory rival thread across standings and reports
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Rivalry
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Rivalry is already present in the specs and simulation language but is not yet a stable player-facing thread.
- A rival gives players a local goal without adding mandatory secondary objectives.
- The system needs to avoid false precision when the standings do not have a meaningful rival.

# Scope
- In:
  - Derive or suggest a nearest standings rival when useful.
  - Show the rival in standings/pre-race context and summarize the result delta after the GP.
  - Keep rival visibility optional/non-blocking and avoid adding a new heavy configuration step.
- Out:
  - Player-selected rival targeting as a required decision.
  - New rival-only card mechanics.
  - Bot hierarchy tuning unless evidence proves it is needed.

# Acceptance criteria
- AC1: A player with a meaningful standings neighbor sees a rival marker before and after a race.
- AC2: Reports say whether the player gained or lost ground to the rival.
- AC3: No rival is shown when the data is ambiguous or misleading.
- AC4: Unit tests cover derived rival selection and no-rival fallback.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: A player with a meaningful standings neighbor sees a rival marker before and after a race.
- request-AC13 -> This backlog slice. Proof: AC2: Reports say whether the player gained or lost ground to the rival.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Introduce a non-mandatory rival thread across standings and reports
- Keywords: scaffolded-backlog, introduce a non-mandatory rival thread across standings and reports, implementation-ready
- Use when: Implementing the scaffolded slice for Introduce a non-mandatory rival thread across standings and reports.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
