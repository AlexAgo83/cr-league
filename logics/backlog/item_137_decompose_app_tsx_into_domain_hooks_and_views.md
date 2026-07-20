## item_137_decompose_app_tsx_into_domain_hooks_and_views - Decompose App.tsx into domain hooks and views
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 96%
> Confidence: 90%
> Progress: 99%
> Complexity: Medium
> Theme: Web architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- App.tsx is 1864 lines with ~55 useState, ~15 useEffect, every API mutation, and ~515 lines of JSX — store, controller, and view in one file.
- The rejoin mount effect uses [] deps while closing over profileSession, savedClaims, run, and tt (stale closures), and the rejoin POST logic is duplicated in two places.
- Seven parallel *CommandClicked booleans track UI-hint state and must be reset in sync.

# Scope
- In:
  - Extract domain hooks (league state and mutations, profile/session, admin actions, plan form) and move the trailing JSX into view container components, keeping the run() error-handling wrapper as the shared spine.
  - Fix the rejoin effect dependencies or add an explicit mount-guard ref with a lint-visible justification, and extract a single rejoin helper used by both call sites.
  - Collapse the command-clicked booleans into one Set or record keyed by command.
  - Replace the window.confirm restart-league prompt with the existing Modal confirm pattern.
  - Delete the empty src/lib and src/ui .gitkeep placeholder directories.
  - Keep all existing App tests green; move or split them alongside the extracted hooks where needed.
- Out:
  - Adding a router, state library, or data-fetching library.
  - Visual or copy changes beyond the confirm-modal swap.
  - New features while files are in motion.

# Acceptance criteria
- AC1: App.tsx is below ~700 lines and no extracted module exceeds ~400 lines.
- AC2: react-hooks lint rules pass with no disabled exhaustive-deps except explicitly justified mount guards.
- AC3: Rejoin logic exists in exactly one place and the restart confirm uses the Modal pattern.
- AC4: The existing web test suite passes without behavioral snapshot changes.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: App.tsx is below ~700 lines and no extracted module exceeds ~400 lines.
- request-AC9 -> This backlog slice. Proof: AC2: react-hooks lint rules pass with no disabled exhaustive-deps except explicitly justified mount guards.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-20 first implementation wave: command-clicked state is now a single typed map with mark/reset helpers, rejoin POST logic is centralized in rejoinClaim, and the automatic saved-claim rejoin uses initial refs to avoid the stale mount-effect closure while preserving mount-only behavior. Remaining: larger domain/view extraction and App.tsx line-count reduction.
- 2026-07-20 second implementation wave: restart league now uses a Modal confirmation instead of window.confirm; SeasonRecapModal and LeagueControlsModal moved to apps/web/src/app/AppModals.tsx; the empty src/lib and src/ui placeholder .gitkeep files were removed. App.tsx is 1791 lines after this slice, so AC1 remains open for further decomposition.
- 2026-07-20 third implementation wave: simple modal JSX moved into AppModals.tsx, covering profile code, profile logout, preferences reset, technical error, directive/qualifying/next-GP confirmations, and admin delete. App.tsx is 1714 lines; AppModals.tsx is 286 lines. AC1 remains open.
- 2026-07-20 fourth implementation wave: DriveView.tsx now owns the drive screen presentation and remains below 400 lines. App.tsx dropped to 1496 lines but AC1 remains open because the target is below ~700 lines; next low-risk extraction is setup/admin/topbar or a domain hook around profile/league mutations.
- 2026-07-20 fifth implementation wave: GameViews.tsx now owns the non-drive view switch for result, plan, championship, garage, admin, and changelog presentation. App.tsx dropped to 1468 lines and GameViews.tsx is 190 lines. AC1 remains open; next low-risk extraction is setup/profile/admin chrome or a domain hook around league/profile mutations.
- 2026-07-20 sixth implementation wave: ResolveGrandPrixConfirmModal moved the launch Grand Prix modal and starting-grid preview into AppModals.tsx. App.tsx is now 1437 lines; AppModals.tsx is 365 lines, still under the extracted-module ceiling. AC1 remains open; next work should extract a larger setup/profile/admin shell or domain mutation hook.
- 2026-07-20 seventh implementation wave: SetupGate.tsx now owns the profile setup and league setup early-return UI. App.tsx is 1410 lines and SetupGate.tsx is 134 lines. AC1 remains open; the next meaningful reduction needs domain hook extraction, not more small modal moves.
- 2026-07-20 eighth implementation wave: leagueMutations.ts now owns the league/team race mutation handlers around settings, resolve, next GP, card inventory, livery/name, and restart state. App.tsx is 1301 lines; leagueMutations.ts is 206 lines. AC1 remains open; the remaining large blocks are profile/admin actions and topbar/profile-menu chrome.
- 2026-07-20 ninth implementation wave: adminActions.ts now owns admin API actions for console refresh, recovery reset, user delete, and inspected league loading. App.tsx is 1237 lines; adminActions.ts is 116 lines. AC1 remains open; the largest remaining reduction is profile/session actions or profile menu/topbar chrome.
- 2026-07-20 tenth implementation wave: profileActions.ts now owns profile creation and recovery. The admin-status probe stayed in App because extracting it introduced a hook dependency that would need extra memoization for no real gain. App.tsx is 1184 lines; profileActions.ts is 95 lines. AC1 remains open; profile menu/topbar chrome and rejoin/local-claim helpers are the remaining obvious reductions.
- 2026-07-20 eleventh implementation wave: AppChrome.tsx now owns language switching, profile menu, setup topbar, and game topbar presentation. App.tsx is 1084 lines; AppChrome.tsx is 181 lines. AC1 remains open; the remaining reduction needs local-claim/rejoin helpers or modal/notification assembly extraction.
- 2026-07-20 twelfth implementation wave: AppOverlays.tsx owns overlay/modal composition and NotificationStack moved to AppChrome.tsx. App.tsx is 1042 lines; AppOverlays.tsx is 166 lines. AC1 remains open; remaining meaningful work is local-claim/rejoin helpers or deeper controller extraction.
- 2026-07-20 thirteenth implementation wave: claimHelpers.ts now owns local player-claim persistence and current-player restoration helpers. App.tsx is 1034 lines; claimHelpers.ts is 22 lines. AC1 remains open; reaching ~700 now needs a deeper controller split rather than more helper extraction.

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: Decompose App.tsx into domain hooks and views
- Keywords: scaffolded-backlog, decompose app.tsx into domain hooks and views, implementation-ready
- Use when: Implementing the scaffolded slice for Decompose App.tsx into domain hooks and views.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-20 thirteenth implementation wave validation: full suite passed after claimHelpers extraction: rtk npm test, rtk npm run build, and rtk npm run logics:validate.
