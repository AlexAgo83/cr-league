## item_324_build_the_beta_season_lifecycle_core - Build the beta season lifecycle core
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Season lifecycle
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current private-league loop can play Grands Prix, but the beta needs an explicit season lifecycle that does not depend on manual operator cleanup.
- The first 0.6 value is a full season that can start, progress, complete, and restart cleanly.
- Season presets must keep tests short while preserving a default season shape for real beta play.

# Scope
- In:
  - Support a short-test season preset and a default season preset at league creation or league setup.
  - Make season completion and next-season/restart behavior explicit in API state and UI state.
  - Keep all-ready resolution as the default cadence; absent-player handling should use a visible default plan before any automation.
  - Update playtest/checklist docs so another operator can run a full beta season from a clean league.
- Out:
  - Automatic calendar scheduling.
  - Polling/SSE realtime infrastructure.
  - Bot replacement after absences.
  - Broad economy redesign.

# Acceptance criteria
- AC1: A creator can create or configure a league with a short and default season preset.
- AC2: A league can complete a full season and expose champion/podium/season-end state without database edits.
- AC3: Starting the next season or restarting the season preserves the documented data that should persist and clears only the documented data that should reset.
- AC4: API and web tests cover season completion and restart/next-season behavior.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A creator can create or configure a league with a short and default season preset.
- request-AC3 -> This backlog slice. Proof: AC2: A league can complete a full season and expose champion/podium/season-end state without database edits.
- request-AC10 -> This backlog slice. Proof: AC3: Starting the next season or restarting the season preserves the documented data that should persist and clears only the documented data that should reset.
- request-AC13 -> This backlog slice. Proof: AC4: API and web tests cover season completion and restart/next-season behavior.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Build the beta season lifecycle core
- Keywords: scaffolded-backlog, build the beta season lifecycle core, implementation-ready
- Use when: Implementing the scaffolded slice for Build the beta season lifecycle core.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
