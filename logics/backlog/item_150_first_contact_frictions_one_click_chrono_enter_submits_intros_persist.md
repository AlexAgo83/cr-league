## item_150_first_contact_frictions_one_click_chrono_enter_submits_intros_persist - First-contact frictions: one-click chrono, Enter submits, intros persist
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Progress: 100%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The first game action takes two identical NEW LAP TIME clicks; Enter does nothing in the setup forms; the three quick-start intros reopen every reload until a checkbox is found and ticked.

# Scope
- In:
  - Run the chrono directly from the desk CTA when attempts remain, keeping the attempts-left count visible; keep a confirmation only for the last attempt.
  - Make profile create, profile recover, and league create/join submit on Enter via proper form semantics.
  - Persist intro dismissal per league on first close through the existing UI-preferences storage; keep the checkbox semantics as never-show-again and the help reopen affordance.
  - Update the App and e2e tests that pin the confirm-modal flow.
- Out:
  - The single-recommended-CTA highlight rule (req_059 item_141).
  - Rewriting intro content.

# Acceptance criteria
- AC1: First chrono is one click with attempts-left visible; last attempt still confirms.
- AC2: Enter submits each filled setup form.
- AC3: A dismissed intro stays dismissed for that league across reloads.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: First chrono is one click with attempts-left visible; last attempt still confirms.
- request-AC3 -> This backlog slice. Proof: AC2: Enter submits each filled setup form.
- request-AC4 -> This backlog slice. Proof: AC3: A dismissed intro stays dismissed for that league across reloads.
- request-AC8 -> This backlog slice. Proof: AC3: A dismissed intro stays dismissed for that league across reloads.
- request-AC5 -> This backlog slice. Evidence needed: Chrono attempts are ranked without race-position P labels in both locales, and the report's key moments never show duplicate identical lines for the same lap and event type, with entries preferring variety across the five slots.
- request-AC6 -> This backlog slice. Evidence needed: Send plan opens a confirmation summarizing approach, preparation, pit strategy, and card, warning when the inventory holds a playable card and none is selected; the plan screen shows an explicit locked state with visually disabled options; a carried-over plan is labeled with its origin GP until first opened; locking stays irreversible.
- request-AC7 -> This backlog slice. Evidence needed: Returning to a finished Grand Prix lands on the summary (classification and actions), not an auto-playing replay; the replay remains one click away and its exit control carries a visible label, not only an aria-label.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Implementation Notes
- Wave 2: `openQualifyingRun` now runs chrono directly while more than one attempt remains, and keeps the confirmation for the final available attempt.
- Wave 2: profile create/recover and league create/join panels now use native form submit semantics, so Enter submits filled forms without custom key handlers.
- Wave 2: league quick-start intros now persist on plain close with league-scoped localStorage keys; profile-code help keeps the previous explicit opt-out behavior. UI preference reset removes both static and league-scoped intro keys.
- Validation wave 2: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts` passed with 44 tests.

# Links
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Primary task(s): `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# AI Context
- Summary: First-contact frictions: one-click chrono, Enter submits, intros persist
- Keywords: scaffolded-backlog, first-contact frictions: one-click chrono, enter submits, intros persist, implementation-ready
- Use when: Implementing the scaffolded slice for First-contact frictions: one-click chrono, Enter submits, intros persist.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# Notes
- Task `task_063_orchestrate_replay_suspense_and_first_contact_polish` was finished via `logics-manager flow finish task` on 2026-07-20.
