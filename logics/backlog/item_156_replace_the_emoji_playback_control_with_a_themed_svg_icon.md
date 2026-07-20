## item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon - Replace the emoji playback control with a themed SVG icon
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
- ReplayStageOverlay.tsx renders the emoji ⏸/▶, whose glyph and color vary by client/OS and clash with the app theme.

# Scope
- In:
  - Replace the emoji with two inline SVG icons (pause bars / play triangle) using currentColor so the orange theme applies.
  - Preserve the existing aria-label, title, and playing/paused class toggle.
  - Add a render assertion that an svg (not emoji text) appears in both states.
- Out:
  - A shared icon component or icon set for the rest of the app.
  - Changing playback behavior or the clock.

# Acceptance criteria
- AC3: The control renders a themed SVG icon via currentColor with accessibility and state preserved.
- AC4: A render test asserts the svg in both playback states.

# Implementation notes
- 2026-07-20: ReplayStageOverlay.tsx now renders inline SVG pause/play icons with `currentColor` styling via `.replay-playback-icon`, while preserving aria-label, title, and playing/paused classes.
- Targeted proof: `rtk npm test -- apps/web/src/features/Modal.test.tsx apps/web/src/app/App.test.tsx` passed with assertions for SVG icons and empty emoji text in both states.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC3: The control renders a themed SVG icon via currentColor with accessibility and state preserved.
- request-AC4 -> This backlog slice. Proof: AC4: A render test asserts the svg in both playback states.
- request-AC5 -> This backlog slice. Proof: AC4: A render test asserts the svg in both playback states.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_028_mobile_modal_hygiene_and_playback_icons_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_064_mobile_modal_hygiene_and_real_playback_icons`
- Primary task(s): `task_065_orchestrate_mobile_modal_hygiene_and_playback_icons`

# AI Context
- Summary: Replace the emoji playback control with a themed SVG icon
- Keywords: scaffolded-backlog, replace the emoji playback control with a themed svg icon, implementation-ready
- Use when: Implementing the scaffolded slice for Replace the emoji playback control with a themed SVG icon.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
