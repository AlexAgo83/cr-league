## item_131_fix_current_round_badge_highlight_clipping - Fix current round badge highlight clipping
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The current-round badge highlight is visually cropped because the effect grows outside the badge while the circuit card clips overflow.

# Scope
- In:
  - Update `.current-round-badge` styling to avoid transform scaling.
  - Replace the external glow with an internal highlight.
  - Keep the reduced-motion override.
- Out:
  - Redesigning the circuit cards.
  - Changing the current-round badge markup.
  - Reworking the Championship navigation.

# Acceptance criteria
- AC1: The current-round badge no longer scales beyond its layout box.
- AC2: The highlight no longer relies on an external shadow that can be clipped by the card.
- AC3: The badge remains visually distinct and respects reduced-motion preferences.
- AC4: Focused validation passes.

# AC Traceability
- request-AC1 -> AC1.
- request-AC2 -> AC2.
- request-AC3 -> AC3.
- request-AC4 -> AC4.
- request-AC1 -> This backlog slice. Proof: `.current-round-badge` no longer uses `transform: scale(...)`.
- request-AC2 -> This backlog slice. Proof: the external glow was replaced with an inset accent ring.
- request-AC3 -> This backlog slice. Proof: the badge keeps a brightness pulse and the existing `prefers-reduced-motion` override.
- request-AC4 -> This backlog slice. Proof: `npm run lint`, `npm test -- apps/web/src/app/App.test.tsx`, and `logics-manager lint --require-status` passed.

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
- Request: `logics/request/req_054_fix_current_round_badge_highlight_clipping.md`
- Primary task(s): `task_055_fix_current_round_badge_highlight_clipping`

# AI Context
- Summary: Fix current round badge highlight clipping
- Keywords: backlog-groom, request, fix current round badge highlight clipping, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Fix current round badge highlight clipping.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Small visible polish regression in the Championship Circuits grid.

# Notes
- Hybrid rationale: Derived from request `req_054_fix_current_round_badge_highlight_clipping` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_054_fix_current_round_badge_highlight_clipping.md`.
- Generated locally by logics-manager.
- Task `task_055_fix_current_round_badge_highlight_clipping` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_055_fix_current_round_badge_highlight_clipping`
