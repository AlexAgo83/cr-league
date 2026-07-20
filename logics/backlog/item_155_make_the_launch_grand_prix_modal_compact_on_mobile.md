## item_155_make_the_launch_grand_prix_modal_compact_on_mobile - Make the launch-Grand-Prix modal compact on mobile
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 65%
> Complexity: Low
> Theme: Playtest-ready loop polish
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- LaunchGpModal stacks a tall hero over the full starting-grid confirmation, overflowing both axes on a phone and producing off-screen horizontal and vertical scroll.
- Long team names and livery plates in the starting-grid rows push horizontal width beyond the viewport.

# Scope
- In:
  - Reduce the hero height on small viewports and render the starting grid single-column.
  - Apply min-width:0 and controlled overflow on grid rows so names/plates cannot force horizontal scroll.
  - Keep the modal within the viewport, relying on the dialog's own overflow:auto for residual height.
- Out:
  - Changing what the modal confirms or the starting-grid data.
  - Restyling other modals.

# Acceptance criteria
- AC2: The modal fits a 360px-wide viewport with no horizontal scroll and no vertical overflow beyond its internal scroll; grid is single-column.

# Implementation notes
- 2026-07-20: Launch-GP confirmation now has a dedicated `launch-gp-modal` class, compact mobile hero sizing, tighter spacing, min-width guards, and a literal single-column starting-grid row layout at phone width.
- Targeted proof: `rtk npm test -- apps/web/src/features/Modal.test.tsx apps/web/src/app/App.test.tsx` passed; e2e coverage added for the 360px modal fit/body-lock/grid assertion.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC2: The modal fits a 360px-wide viewport with no horizontal scroll and no vertical overflow beyond its internal scroll; grid is single-column.
- request-AC5 -> This backlog slice. Proof: AC2: The modal fits a 360px-wide viewport with no horizontal scroll and no vertical overflow beyond its internal scroll; grid is single-column.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_028_mobile_modal_hygiene_and_playback_icons_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_064_mobile_modal_hygiene_and_real_playback_icons`
- Primary task(s): `task_065_orchestrate_mobile_modal_hygiene_and_playback_icons`

# AI Context
- Summary: Make the launch-Grand-Prix modal compact on mobile
- Keywords: scaffolded-backlog, make the launch-grand-prix modal compact on mobile, implementation-ready
- Use when: Implementing the scaffolded slice for Make the launch-Grand-Prix modal compact on mobile.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
