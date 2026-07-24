## req_109_polish_gp_report_placeholders_and_replay_classification_focus - Polish GP report placeholders and replay classification focus
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay interaction clarity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Keep the pre-GP report free of the previously hidden Rewards placeholder.
- Let replay users switch focused drivers from the classification badges.
- Draw subtle visual links from classification badges to their cars.

# Context
- `PlanView` still rendered a Rewards placeholder before the GP.
- Replay car clicks already change focus, but the classification badges were non-interactive.
- The classification and track can be visually far apart on wide layouts, making car identification slower.

# Acceptance criteria
- AC1: `Plan > GP` does not render the Rewards placeholder before the race.
- AC2: In replay focus mode, clicking a classification badge changes the focused driver.
- AC3: Each classification badge has a subtle livery-colored connector to its live car, above the map and below controls.
- AC4: Keyboard labels, focused state, tests, and desktop/mobile rendering remain valid.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/features/PlanView.tsx`
- `apps/web/src/features/ReplayView.tsx`
- `apps/web/src/features/replay/ReplayTower.tsx`
- `apps/web/src/features/replay/ReplayStageOverlay.tsx`

# AI Context
- Summary: Draft a bounded request for polish gp report placeholders and replay classification focus.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_267_polish_gp_report_placeholders_and_replay_classification_focus`
