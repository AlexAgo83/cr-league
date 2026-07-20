## item_138_split_replayview_and_extract_the_replay_clock - Split ReplayView and extract the replay clock
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 98
> Confidence: 94
> Progress: 100
> Complexity: Low
> Theme: Web architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- ReplayView.tsx is 1071 lines holding several sub-components, a requestAnimationFrame loop, ~10 state hooks, 6 refs, and manual pop-timer arrays in one file.

# Scope
- In:
  - Extract a useReplayClock hook owning the rAF loop, play/pause/seek state, and pop-timer lifecycle.
  - Move the scrubber, timing tower, and stage sub-components into their own files under a replay/ folder.
  - Preserve the pass-4 scrubber interaction fixes (drag-wins, pointer-events, aria-valuetext) unchanged.
  - Keep the existing ReplayView tests passing as the behavioral contract; relocate them alongside the split files.
- Out:
  - Any change to replay visuals, timing math, or the trace format.
  - New replay features.

# Acceptance criteria
- AC1: ReplayView.tsx is a composition file and the rAF/timer logic lives in useReplayClock.
- AC2: Existing replay tests pass unchanged apart from import paths.
- AC3: No file in the replay folder exceeds ~400 lines.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: ReplayView.tsx is a composition file and the rAF/timer logic lives in useReplayClock.
- request-AC9 -> This backlog slice. Proof: AC2: Existing replay tests pass unchanged apart from import paths.
- request-AC4 -> This backlog slice. Evidence needed: The admin token comparison is constant-time and localhost CORS origins are absent from the production origin set, verified by tests or config assertions.
- request-AC5 -> This backlog slice. Evidence needed: App.tsx drops below ~700 lines by extracting domain hooks (league, profile, admin, plan form) and view containers, the rejoin effect has correct dependencies or an explicit mount guard, the rejoin logic exists once, the seven command-clicked booleans collapse into one structure, and all existing web tests still pass.
- request-AC7 -> This backlog slice. Evidence needed: A CI lane runs integration tests against a real Postgres service covering concurrent qualifying submissions, the resolve transition claim, and the credit-guarded card purchase; the unit lane no longer advertises an unused DATABASE_URL.
- request-AC8 -> This backlog slice. Evidence needed: CI gains dependency scanning (Dependabot config plus an npm audit gate), vitest coverage collection surfaced in CI, eslint enforces react-hooks and jsx-a11y rules with the codebase passing, the release workflow fails on a health-version mismatch, package.json declares engines, and the reports/ gitignore policy is consistent.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-20 first implementation wave: useReplayClock now owns the replay clock loop, seek/restart state, live lap/segment updates, and position-pop timer lifecycle. ReplayView.tsx is reduced from 1071 to 1004 lines, and the previous react-hooks exhaustive-deps warnings are gone. Remaining: move scrubber, timing tower, and stage sub-components under replay/ and continue reducing ReplayView toward a composition file.
- 2026-07-20 second implementation wave: ReplayTower and ReplayProgress now live under apps/web/src/features/replay/. The timeline scrubber, lap ticks, weather markers, director markers, and position-delta tower rendering are no longer inline in ReplayView; new replay folder files are 57, 104, and 184 lines. Remaining: extract the replay stage/overlay composition and keep reducing ReplayView.tsx below its current 941 lines.
- 2026-07-20 third implementation wave: ReplayStageOverlay now owns the stage overlay presentation, including map info, moment notification, director/focus panels, playback controls, tower slot, and timeline progress wiring. ReplayView.tsx is reduced to 815 lines; ReplayProgress.tsx, ReplayStageOverlay.tsx, ReplayTower.tsx, and useReplayClock.ts are all below 400 lines. Remaining: slim the remaining derived-data orchestration in ReplayView before marking this slice done.
- 2026-07-20 fourth implementation wave: replayMath.ts, replayDirector.ts, and replayMoment.ts now own the pure replay timing, director, and moment-card helpers. ReplayView.tsx is reduced to 376 lines and remains a composition component while all files under apps/web/src/features/replay stay below 400 lines.

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: Split ReplayView and extract the replay clock
- Keywords: scaffolded-backlog, split replayview and extract the replay clock, implementation-ready
- Use when: Implementing the scaffolded slice for Split ReplayView and extract the replay clock.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-20 closeout proof: AC1 useReplayClock owns the replay rAF playback loop, speed/play state, seek/restart, live lap/segment state, and position-pop timer cleanup; ReplayView delegates stage presentation to ReplayStageOverlay. AC2 ReplayView.test.ts passes unchanged (26 tests), and full suite passes (172 tests). AC3 replay folder files are below 400 lines: ReplayProgress 104, ReplayStageOverlay 283, ReplayTower 57, useReplayClock 184.
- 2026-07-20 fourth implementation wave targeted validation: rtk npm run typecheck, rtk npm run lint, and rtk npm test -- apps/web/src/features/ReplayView.test.ts apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx passed. File sizes: ReplayView 376, replayMath 365, replayDirector 110, replayMoment 37, useReplayClock 184, ReplayProgress 104, ReplayStageOverlay 283, ReplayTower 57.

# Tasks
- `task_059_orchestrate_repo_review_remediation_pass_5`

# Notes
- Task `task_059_orchestrate_repo_review_remediation_pass_5` was finished via `logics-manager flow finish task` on 2026-07-20.
