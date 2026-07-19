## task_055_fix_current_round_badge_highlight_clipping - Fix current round badge highlight clipping
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_131_fix_current_round_badge_highlight_clipping`

# Acceptance criteria
- AC1: The current-round badge no longer scales beyond its layout box.
- AC2: The highlight no longer relies on an external shadow that can be clipped by the card.
- AC3: The badge remains visually distinct and respects reduced-motion preferences.
- AC4: Focused validation passes.

# Validation
- Passed:
  - `npm run lint`
  - `npm test -- apps/web/src/app/App.test.tsx`
  - `logics-manager lint --require-status`
- Pending:
  - `logics-manager audit --group-by-doc`
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# Report
- Replaced the cropped pulse effect on `.current-round-badge`.
- Removed badge `transform: scale(...)` animation.
- Removed external glow and kept a visible inset accent ring plus brightness pulse.
- Kept the existing `prefers-reduced-motion` override.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_131_fix_current_round_badge_highlight_clipping`
- Related request(s): `req_054_fix_current_round_badge_highlight_clipping`

# AI Context
- Summary: Fix current round badge highlight clipping in Championship Circuits.
- Keywords: CSS, current-round-badge, clipping, championship circuits
- Use when: You need context for this badge styling fix.
- Skip when: The change is unrelated to the badge highlight.

# Links
- Request: `req_054_fix_current_round_badge_highlight_clipping`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `.current-round-badge` no longer uses `transform: scale(...)`.
- request-AC2 -> This task. Proof: the external glow was replaced with an inset accent ring.
- request-AC3 -> This task. Proof: the badge keeps a brightness pulse and the existing `prefers-reduced-motion` override.
- request-AC4 -> This task. Proof: `npm run lint`, `npm test -- apps/web/src/app/App.test.tsx`, and `logics-manager lint --require-status` passed.
