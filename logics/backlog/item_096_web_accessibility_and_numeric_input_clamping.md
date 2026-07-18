## item_096_web_accessibility_and_numeric_input_clamping - Web accessibility and numeric input clamping
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Web accessibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Modals declare role=dialog and aria-modal but never move focus, trap Tab, close on Escape, or restore focus, so keyboard and screen-reader users cannot operate them.
- The replay scrubber is a click-only div marked aria-hidden with click-only seek markers, making seeking impossible without a mouse.
- League-config numeric inputs submit 0 or NaN when a field is cleared because values are read with Number() and never clamped.

# Scope
- In:
  - Create one small shared Modal component (native focus handling: focus dialog on open, Escape to close, Tab trap, restore focus on close) and migrate the existing modals in App.tsx and GarageView.tsx to it.
  - Replace the replay progress div with a native range input bound to the replay position, remove aria-hidden, and make seek markers focusable buttons or ticks on the range.
  - Clamp maxPlayers, qualifyingAttemptLimit, and maxGrandPrixPerSeason to their min/max bounds before submit, rejecting NaN.
  - Add a component test for Escape-close and focus restore, and one for the clamp helper.
- Out:
  - Focus-trap or dialog libraries.
  - A full accessibility audit or redesign beyond the listed fixes.
  - Restyling the replay view.

# Acceptance criteria
- AC1: Every modal closes on Escape, holds focus while open, and returns focus to its trigger on close.
- AC2: The replay scrubber is operable with arrow keys and announced by assistive technology.
- AC3: Clearing a league-config numeric field cannot submit 0 or NaN outside the allowed range.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Every modal closes on Escape, holds focus while open, and returns focus to its trigger on close.
- request-AC7 -> This backlog slice. Proof: AC2: The replay scrubber is operable with arrow keys and announced by assistive technology.
- request-AC3 -> This backlog slice. Evidence needed: Concurrent qualifying submissions cannot lose runs (transactional append), duplicate bot fill cannot 500 (first writer wins, second is a no-op), and startNextGrandPrix claims the transition with a guarded conditional write inside one transaction so double calls and mid-way failures leave consistent state.
- request-AC4 -> This backlog slice. Evidence needed: scripts/balance-simulations.ts compiles and runs against the real shared exports, and npm run typecheck covers scripts/.
- request-AC6 -> This backlog slice. Evidence needed: Unit tests cover PRNG determinism and weighted-pick edge cases, and assert exact credits/points for the sponsorship and economy-mode reward branches.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Primary task(s): `task_045_orchestrate_repo_review_remediation_pass_3`

# AI Context
- Summary: Web accessibility and numeric input clamping
- Keywords: scaffolded-backlog, web accessibility and numeric input clamping, implementation-ready
- Use when: Implementing the scaffolded slice for Web accessibility and numeric input clamping.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_045_orchestrate_repo_review_remediation_pass_3`

# Notes
- Task `task_045_orchestrate_repo_review_remediation_pass_3` was finished via `logics-manager flow finish task` on 2026-07-18.
