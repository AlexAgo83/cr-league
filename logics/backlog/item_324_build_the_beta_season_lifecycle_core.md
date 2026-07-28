## item_324_build_the_beta_season_lifecycle_core - Build the beta season lifecycle core
> From version: 0.5.2
> Schema version: 1.0
> Status: Done
> Understanding: 97
> Confidence: 95
> Progress: 100%
> Complexity: High
> Theme: Season lifecycle
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: Appended a closeout note recording that task_130 finished; no status or scope change.

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
  - On next-season/restart, preserve league players, palmares, archived season stats, cosmetic/team identity, credits, and garage cards while resetting championship points only.
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
- AC6: Starting the next season or restarting the season preserves players, palmares, archived season stats, cosmetic/team identity, credits, and garage cards while resetting championship points only.
- AC7: API and web tests cover season presets, season completion, manual resolution, absent-player defaults, and restart/next-season behavior.

# Implementation Notes
- 2026-07-27: Added league-creation season presets in the setup UI: `Standard season` (6 GP, default) and `Quick beta` (3 GP).
- 2026-07-27: Updated action state so only human teams count as pending; bots are auto-ready and no preparation deadline auto-resolves a GP.
- 2026-07-27: Added explicit resolve-with-defaults state and backend guard: missing human plans require `allowDefaults`.
- 2026-07-27: Added the neutral absent-player plan used at resolution: balanced approach, reliability preparation, standard pit strategy, no card.
- 2026-07-27: Recorded defaulted human team ids on the race result for report/UI follow-up.
- 2026-07-27: Changed final-round action copy to `Lancer la saison suivante` / `Start next season`.
- 2026-07-27: Fixed next-season rollover to reset team points while preserving players, credits, garage cards, and livery identity.
- 2026-07-27: Added resolve confirmation copy naming absent human teams and their neutral default plan before commissioner launch.
- 2026-07-27: Added `Default plan` / `Plan par défaut` labeling for defaulted teams in the post-race report podium/classification.
- Evidence: `rtk npm test -- --run apps/api/src/app.test.ts apps/web/src/app/App.test.tsx` -> 70 tests passed.
- Evidence: `rtk npm test -- --run apps/web/src/app/App.test.tsx apps/web/src/features/ReportView.test.tsx` -> 43 tests passed.
- Evidence: `rtk npm run typecheck` -> passed.

# Remaining Work
- None for this slice.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A creator can create or configure a league with a short and default season preset.
- request-AC3 -> This backlog slice. Proof: AC2: A league can complete a full season and expose champion/podium/season-end state without database edits.
- request-AC10 -> This backlog slice. Proof: AC6: Starting the next season or restarting the season preserves players, palmares, archived season stats, cosmetic/team identity, credits, and garage cards while resetting championship points only.
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

# Notes
- Task `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus` was finished via `logics-manager flow finish task` on 2026-07-28.
