## item_328_introduce_a_non_mandatory_rival_thread_across_standings_and_reports - Introduce a non-mandatory rival thread across standings and reports
> From version: 0.5.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 94
> Progress: 100%
> Complexity: Medium
> Theme: Rivalry
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: Appended a closeout note recording that task_130 finished; no status or scope change.
> Owner: codex

# Problem
- Rivalry is already present in the specs and simulation language but is not yet a stable player-facing thread.
- A rival gives players a local goal without adding mandatory secondary objectives.
- The system needs to avoid false precision when the standings do not have a meaningful rival.
- Owner decision: derive rivals automatically from nearest standings proximity; do not ask players to choose a rival in the first pass; equal candidates use stable tie-breaks.

# Scope
- In:
  - Derive a nearest standings rival when useful.
  - Tie-break equal candidates by standings proximity, then points gap, then stable team id.
  - Show the rival in standings/pre-race context and summarize the result delta after the GP.
  - Keep rival visibility optional/non-blocking and avoid adding a new heavy configuration step.
  - Allow human or bot rivals when standings proximity makes the story clear.
- Out:
  - Player-selected rival targeting as a required decision.
  - New rival-only card mechanics.
  - Bot hierarchy tuning unless evidence proves it is needed.

# Acceptance criteria
- AC1: A player with a meaningful nearest standings neighbor sees a rival marker before and after a race.
- AC2: Reports say whether the player gained or lost ground to the rival.
- AC3: No rival is shown for the first race before meaningful points exist, or when the data is ambiguous or misleading.
- AC4: Equal rival candidates resolve deterministically with standings proximity, points gap, then stable team id.
- AC5: Unit tests cover derived rival selection, tie-breaks, and no-rival fallback.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: A player with a meaningful standings neighbor sees a rival marker before and after a race.
- request-AC13 -> This backlog slice. Proof: AC2: Reports say whether the player gained or lost ground to the rival.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-28 delivery: shipped derived nearest-standing rival context without a required selection step. Standings mark the current rival, Plan shows a non-blocking Rival read after meaningful points exist, and race report recommendations fall back to the derived rival when no explicit rival decision exists.

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

# Validation
- 2026-07-28 validation: vitest targeted helpers/report/directive/championship tests passed (43 tests); npm run typecheck passed; git diff --check passed; browser playtest rounds 2 passed earlier with Rival read evidence in reports/playtest/rival-thread-browser.md and reports/ux/rival-thread-browser.md.

# Notes
- Task `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus` was finished via `logics-manager flow finish task` on 2026-07-28.
