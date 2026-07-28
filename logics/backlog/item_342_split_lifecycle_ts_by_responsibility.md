## item_342_split_lifecycle_ts_by_responsibility - Split lifecycle.ts by responsibility
> From version: 0.6.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Code organization
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- apps/api/src/features/leagues/lifecycle.ts is 671 lines across 18 exported functions, mixing several unrelated responsibilities: season lifecycle (createDemoLeague, startNextGrandPrix, restartLeague, season summary helpers), team admin (updateTeamLivery, updateTeamName, updateLeagueSettings), reminder orchestration (sendPlanReminders), and visibility/decision-reveal rules (publicLeagueState, withPlayer, canRevealOpponentDecisions, revealedDecisions, buildActionState).

# Scope
- In:
  - Split lifecycle.ts into focused files by responsibility, for example: seasonLifecycle.ts (createDemoLeague, startNextGrandPrix, restartLeague, season summary helpers), teamAdmin.ts (updateTeamLivery, updateTeamName, updateLeagueSettings), reminders.ts (sendPlanReminders), visibility.ts (publicLeagueState, withPlayer, canRevealOpponentDecisions, revealedDecisions, buildActionState).
  - getLeagueState is the central read model used throughout this feature — keep it in whichever resulting file keeps the overall import graph cleanest (e.g. seasonLifecycle.ts, or its own file if that's clearer), and update every caller's import path accordingly.
  - Update apps/api/src/features/leagues/store.ts's re-exports to point at the new file locations so every existing external import path (routes.ts, tests, cross-feature admin import) keeps working unchanged.
  - Run the full test suite after the split and fix any import path the split missed.
- Out:
  - Changing any function's behavior, signature, or logic — this is a pure file-organization split, not a refactor of logic.
  - Renaming any function during the split unless strictly necessary to avoid a naming collision between the new files.

# Acceptance criteria
- AC1: lifecycle.ts's 18 exported functions are split across focused files grouped by the responsibilities named above, with no single resulting file mixing more than one of those responsibility groups.
- AC2: apps/api/src/features/leagues/store.ts's public re-export surface is unchanged from the outside — every existing external import path still resolves to the same function.
- AC3: The full test suite (unit, integration, e2e) passes with no behavior change.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: lifecycle.ts's 18 exported functions are split across focused files grouped by the responsibilities named above, with no single resulting file mixing more than one of those responsibility groups.
- request-AC13 -> This backlog slice. Proof: AC2: apps/api/src/features/leagues/store.ts's public re-export surface is unchanged from the outside — every existing external import path still resolves to the same function.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Split lifecycle.ts by responsibility
- Keywords: scaffolded-backlog, split lifecycle.ts by responsibility, implementation-ready
- Use when: Implementing the scaffolded slice for Split lifecycle.ts by responsibility.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Done: `lifecycle.ts` went from 671 lines to 375 and now holds only season lifecycle (`createDemoLeague`, `joinLeagueByCode`, `rejoinLeague`, `startNextGrandPrix`, `restartLeague`, `ensureBotQualifyingRuns`, and the season-summary / car-asset helpers).
- Extracted: `leagueState.ts` (104 lines, `getLeagueState` — the central read model, given its own file so both lifecycle and the other stores depend on it rather than on each other), `teamAdmin.ts` (88 lines, `updateLeagueSettings` / `updateTeamLivery` / `updateTeamName`), `reminders.ts` (59 lines, `sendPlanReminders`), `visibility.ts` (65 lines, `buildActionState` / `publicLeagueState` / `withPlayer` / `canRevealOpponentDecisions` / `revealedDecisions`).
- `buildActionState` had to become exported (it was file-private) so `leagueState.ts` can use it; no other signature changed. Import graph is acyclic: `visibility` -> `leagueState` -> `teamAdmin`/`reminders`/`lifecycle`.
- Internal importers (`cards.ts`, `carAssets.ts`, `decisions.ts`, `qualifyingStore.ts`, `resolution.ts`, `opponentComparison.ts`) now import from the new modules directly instead of re-importing through `lifecycle.ts`; `store.ts`'s external re-export surface is byte-identical in effect.
- Pure move — no logic change. Typecheck, lint, build, and the full suite (380 passed, 7 skipped) green.
