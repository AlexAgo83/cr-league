## item_324_build_the_beta_season_lifecycle_core - Build the beta season lifecycle core
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 95
> Progress: 0%
> Complexity: High
> Theme: Season lifecycle
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current private-league loop can play Grands Prix, but the beta needs an explicit season lifecycle that does not depend on manual operator cleanup.
- The first 0.6 value is a full season that can start, progress, complete, and restart cleanly.
- Season presets must keep tests short while preserving a default season shape for real beta play.
- Owner decisions: the first presets are `Quick beta` (3 GP) and `Standard season` (6 GP, default); GP resolution is not automatic; absent players can run one visible neutral default plan only through commissioner-controlled resolution; next season starts only by explicit commissioner action.

# Scope
- In:
  - Support `Quick beta` (3 GP) and `Standard season` (6 GP, default) at league creation or league setup.
  - Make season completion and next-season/restart behavior explicit in API state and UI state.
  - Keep commissioner-controlled resolution as the default cadence; when all plans are ready the resolve action becomes available, but the app does not auto-resolve.
  - For absent players, expose the neutral default plan before resolution and record default-plan use in the race report. The 0.6 default is balanced setup, no card, and medium strategy.
  - Require an explicit commissioner action to start the next season after champion/podium/palmares state is visible in a `Saison terminée` state.
  - On next-season/restart, preserve league players, palmares, archived season stats, and cosmetic/team identity while resetting cards and credits.
  - Update playtest/checklist docs so another operator can run a full beta season from a clean league.
- Out:
  - Automatic calendar scheduling.
  - Polling/SSE realtime infrastructure.
  - Bot replacement after absences.
  - Broad economy redesign.

# Acceptance criteria
- AC1: A creator can create or configure a league with a short and default season preset.
- AC2: A league can complete a full season and expose champion/podium/season-end state without database edits.
- AC3: The app never auto-resolves a GP; commissioner-controlled resolve is available when all plans are ready.
- AC4: Commissioner-controlled resolve-with-defaults shows the neutral absent-player default before resolution and marks default-plan teams in the report.
- AC5: The next season starts only after a creator-only `Lancer la saison suivante` action from a `Saison terminée` state, preserving champion/podium/palmares review before rollover.
- AC6: Starting the next season or restarting the season preserves players, palmares, archived season stats, and cosmetic/team identity while resetting cards and credits.
- AC7: API and web tests cover season presets, season completion, manual resolution, absent-player defaults, and restart/next-season behavior.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A creator can create or configure a league with a short and default season preset.
- request-AC3 -> This backlog slice. Proof: AC2: A league can complete a full season and expose champion/podium/season-end state without database edits.
- request-AC10 -> This backlog slice. Proof: AC6: Starting the next season or restarting the season preserves players, palmares, archived season stats, and cosmetic/team identity while resetting cards and credits.
- request-AC13 -> This backlog slice. Proof: AC7: API and web tests cover season presets, season completion, manual resolution, absent-player defaults, and restart/next-season behavior.

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
