## item_153_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest - Plan-lock safety: confirm on send, visible locked state, carried-over label
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90
> Confidence: 85
> Progress: 10%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-20 refreshed AI Context to match the groomed plan-lock slice.

# Problem
- The most consequential action in the game — locking the race plan — is one unconfirmed click, while the harmless chrono confirms every time; the 2026-07-20 playtest locked a carried-over plan by accident and could not add the card bought minutes earlier.
- The plan screen gives no visible sign that the plan is locked: options look clickable but are silently disabled.
- The plan (approach, preparation, pit strategy) carries over from the previous Grand Prix with no signal, so a plan tuned for one circuit silently becomes the default for the next.

# Scope
- In:
  - Add a Send plan confirmation modal summarizing approach, preparation, pit strategy, and card, with a warning line when the inventory holds a playable card and none is selected; reuse the existing Modal pattern.
  - Show an explicit locked state on the plan screen (banner plus visually disabled options) once the plan is sent; keep locking irreversible (multiplayer lock-means-ready semantics).
  - Label a carried-over plan with its origin Grand Prix until the player first opens the plan screen for the new GP.
  - Update the App and e2e tests that pin the send-plan flow; add EN and FR strings via the parity-tested i18n files.
- Out:
  - Unlocking or editing a locked plan.
  - Changing what carries over (values stay; only the signaling changes).
  - The replay-return behavior (item_149) and chrono confirmation (item_150).

# Acceptance criteria
- AC1: Sending the plan requires confirming a summary of approach, preparation, pit strategy, and card, with a visible warning when a playable card is left unselected.
- AC2: After locking, the plan screen shows an explicit locked state and options are visibly disabled.
- AC3: A plan carried over from the previous GP is labeled with its origin until first opened.
- AC4: Locking remains irreversible and all existing plan-flow tests pass with the new confirmation step.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Sending the plan requires confirming a summary of approach, preparation, pit strategy, and card, with a visible warning when a playable card is left unselected.
- request-AC8 -> This backlog slice. Proof: AC4: Locking remains irreversible and all existing plan-flow tests pass with the new confirmation step.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest.md`
- Primary task(s): `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# AI Context
- Summary: Plan-lock safety — Send plan confirmation with unused-card warning, visible locked state on the plan screen, carried-over-plan label.
- Keywords: plan-lock, send-plan confirmation, unused card warning, locked state, carried-over plan, first-session UX
- Use when: Implementing or reviewing the plan-lock safety slice of req_062 (send confirmation, locked-state visibility, carry-over labeling).
- Skip when: The change concerns replay gating (item_149), chrono/Enter/intro frictions (item_150), or readability papercuts (item_151).

# Priority
- Priority: High
- Rationale: A playtest-verified trap that wastes purchased cards and locks unintended plans; highest player-frustration finding of the second session.

# Notes
- Hybrid rationale: Derived from request `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest.md`.
- Generated locally by logics-manager.
