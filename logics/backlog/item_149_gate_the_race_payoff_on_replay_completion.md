## item_149_gate_the_race_payoff_on_replay_completion - Gate the race payoff on replay completion
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Progress: 100%
> Complexity: Low
> Theme: Replay suspense
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-20 updated replay close label wording to match responsive UI.

# Problem
- The payoff banner with the final position, points, and credits renders under the live replay from lap 2, spoiling the outcome the replay exists to dramatize.
- Returning to a finished Grand Prix auto-plays the replay from the start on every visit (re-spoiling included), and the only exit is an unlabeled × whose meaning exists only as an aria-label.

# Scope
- In:
  - Track replay completion in the replay clock state and gate afterMapContent (and any other final-order reveal on the replay tab) on completed-or-skipped.
  - Add an explicit skip-to-result control for players who do not want to watch; skipping counts as completion.
  - Verify the report tab access path does not silently spoil mid-replay, and decide its gating consistently.
  - Coordinate with req_058 item_138: the completion flag belongs in useReplayClock once that split lands.
  - Add a test for hidden-while-playing and visible-after-completion.
  - Once a replay has been completed or skipped, returning to that Grand Prix lands on the finished summary (classification and actions) with the replay one click away, instead of auto-playing it; persist the seen state with the same mechanism as the completion flag.
  - Give the replay exit control a visible desktop label, not only an aria-label.
- Out:
  - Changing the payoff panel's content or styling.
  - Replay pacing or auto-play behavior.

# Acceptance criteria
- AC1: No final classification or payoff is visible while the replay plays.
- AC2: Completion or explicit skip reveals the payoff as today.
- AC3: A test pins the gating.
- AC4: A finished GP reopens on its summary, not an auto-playing replay, and the replay exit has a visible label.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: No final classification or payoff is visible while the replay plays.
- request-AC7 -> This backlog slice. Proof: AC4: A finished GP reopens on its summary, not an auto-playing replay, and the replay exit has a visible label.
- request-AC8 -> This backlog slice. Proof: AC2: Completion or explicit skip reveals the payoff as today.
- request-AC3 -> This backlog slice. Evidence needed: Enter submits the profile create, profile recover, and league create/join forms when their required fields are filled.
- request-AC5 -> This backlog slice. Evidence needed: Chrono attempts are ranked without race-position P labels in both locales, and the report's key moments never show duplicate identical lines for the same lap and event type, with entries preferring variety across the five slots.
- request-AC6 -> This backlog slice. Evidence needed: Send plan opens a confirmation summarizing approach, preparation, pit strategy, and card, warning when the inventory holds a playable card and none is selected; the plan screen shows an explicit locked state with visually disabled options; a carried-over plan is labeled with its origin GP until first opened; locking stays irreversible.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Implementation Notes
- Wave 1: `ReplayView` now keeps the payoff/report path locked while the replay is live. `afterMapContent` renders as a small result gate with an explicit skip button until the replay reaches the end or the player clicks skip.
- Wave 1: the replay report shortcut is hidden until the result is unlocked, so the report cannot spoil the final order mid-replay.
- Wave 1: result unlock resets when the replay seed/title changes, avoiding carry-over between GP or chrono/race modes.
- Validation wave 1: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts` passed with 25 tests.
- Wave 4: normal app entry into an already resolved current GP now opens on the finished summary instead of auto-playing the replay; explicit `/replay/<gp>` routes and the Replay button still open replay. The replay close control now renders the visible Back to race label on desktop and a compact × on mobile.
- Validation wave 4: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts` passed with 44 tests.

# Links
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Primary task(s): `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# AI Context
- Summary: Gate the race payoff on replay completion
- Keywords: scaffolded-backlog, gate the race payoff on replay completion, implementation-ready
- Use when: Implementing the scaffolded slice for Gate the race payoff on replay completion.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# Notes
- Task `task_063_orchestrate_replay_suspense_and_first_contact_polish` was finished via `logics-manager flow finish task` on 2026-07-20.
