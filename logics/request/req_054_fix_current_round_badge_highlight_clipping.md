## req_054_fix_current_round_badge_highlight_clipping - Fix current round badge highlight clipping
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Fix the current-round badge highlight in the Championship Circuits grid because the visual effect is clipped/cropped inside the circuit card.

# Context
- The previous effect used `transform: scale(...)` and an external glow on `.current-round-badge`.
- Circuit cards clip overflow, so growing the badge or drawing outside its box creates a cropped visual.
- The fix should keep the "current round" signal without changing the grid structure.

# Acceptance criteria
- AC1: The current-round badge no longer scales beyond its layout box.
- AC2: The highlight no longer relies on an external shadow that can be clipped by the card.
- AC3: The badge remains visually distinct and respects reduced-motion preferences.
- AC4: Focused validation passes.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Fix the cropped current-round badge highlight in the Championship Circuits grid.
- Keywords: championship, circuits, current-round-badge, CSS, clipping
- Use when: You need context for current round badge styling.
- Skip when: The work is unrelated to Championship Circuits styling.

# Backlog
- none
- `item_131_fix_current_round_badge_highlight_clipping`
