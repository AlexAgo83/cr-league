## item_154_lock_background_scroll_behind_modals - Lock background scroll behind modals
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Playtest-ready loop polish
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Modal.tsx renders a fixed overlay but never locks body scroll, so on mobile the page behind the dialog drifts while the modal is open.
- The fix belongs in Modal.tsx so every modal consumer inherits it rather than each modal solving it locally.

# Scope
- In:
  - Add a body scroll lock in Modal.tsx effective for the modal's lifetime (lock on mount, restore on unmount), correct under stacked/concurrent modals.
  - Prevent a desktop layout jump when the scrollbar is removed.
  - Extend Modal.test.tsx to assert lock-on-mount and restore-on-unmount.
- Out:
  - Redesigning the modal component API or focus trap.
  - Per-modal scroll behavior overrides.

# Acceptance criteria
- AC1: Background does not scroll while a modal is open; only modal content scrolls; scroll position restores without a jump on close.
- AC4: Modal.test.tsx covers the lock and restore.

# Implementation notes
- 2026-07-20: Modal.tsx now applies a stack-safe body scroll lock on mount, preserves scrollbar gutter padding, fixes the body at the current scroll offset, and restores styles/scroll position when the last modal closes.
- Targeted proof: `rtk npm test -- apps/web/src/features/Modal.test.tsx apps/web/src/app/App.test.tsx` passed.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Background does not scroll while a modal is open; only modal content scrolls; scroll position restores without a jump on close.
- request-AC4 -> This backlog slice. Proof: AC4: Modal.test.tsx covers the lock and restore.
- request-AC5 -> This backlog slice. Proof: AC4: Modal.test.tsx covers the lock and restore.
- request-AC2 -> This backlog slice. Evidence needed: The launch-Grand-Prix confirmation modal fits within a 360px-wide phone viewport with no horizontal scroll and no vertical overflow beyond the modal's own internal scroll; the starting grid reads as a single column.
- request-AC3 -> This backlog slice. Evidence needed: The replay pause/play control renders a drawn SVG icon (pause bars / play triangle) that follows the orange theme via currentColor, with the existing aria-label, title, and playing/paused state preserved.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_028_mobile_modal_hygiene_and_playback_icons_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_064_mobile_modal_hygiene_and_real_playback_icons`
- Primary task(s): `task_065_orchestrate_mobile_modal_hygiene_and_playback_icons`

# AI Context
- Summary: Lock background scroll behind modals
- Keywords: scaffolded-backlog, lock background scroll behind modals, implementation-ready
- Use when: Implementing the scaffolded slice for Lock background scroll behind modals.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_065_orchestrate_mobile_modal_hygiene_and_playback_icons`

# Notes
- Task `task_065_orchestrate_mobile_modal_hygiene_and_playback_icons` was finished via `logics-manager flow finish task` on 2026-07-20.
