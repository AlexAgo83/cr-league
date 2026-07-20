## req_064_mobile_modal_hygiene_and_real_playback_icons - Mobile modal hygiene and real playback icons
> From version: 0.3.11
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Playtest-ready loop polish
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Opening any Modal must lock scrolling of the page behind it; only the modal's own content may scroll. Restoring on close must not shift the page.
- The launch-Grand-Prix confirmation modal must fit within a phone viewport with no horizontal scroll and no off-screen vertical overflow beyond the modal's own internal scroll.
- The replay pause/play control must use a drawn, theme-consistent icon rather than an emoji whose appearance depends on the client/OS.

# Context
- Modal.tsx (apps/web/src/features/Modal.tsx) renders a fixed .modal-overlay but never locks body scroll; the inner .modal already has overflow:auto (layout.css ~1694). Add a mount/unmount body scroll lock in Modal.tsx so any consumer inherits it; account for concurrent/stacked modals so the last one to close restores scroll, and avoid a layout jump from scrollbar removal on desktop.
- LaunchGpModal (apps/web/src/app/AppModals.tsx ~line 161) stacks a ModalHero (min-height 178px, layout.css ~1708) above the full starting-grid-confirmation block (kicker + circuit traits + a starting-grid-list of grid entries with livery plates and names). On a phone this overflows both axes. Make it compact on small viewports: reduce the hero height, render the starting grid single-column, and apply min-width:0 / controlled overflow on grid rows so long names and livery plates cannot force horizontal scroll. The modal must stay within the viewport with the dialog's own overflow:auto handling any remaining height.
- ReplayStageOverlay.tsx (~line 165) renders the emoji ⏸/▶ inside .replay-playback-button. Replace with two small inline SVG icons (two pause bars / a play triangle) using currentColor so the existing orange theme applies; keep the existing aria-label/title (action_pause/action_play) and the playing/paused class toggle intact.
- This is UI polish in the same first-contact/mobile lineage as req_047 and req_062; it changes no game logic, no API, no i18n keys beyond reuse of existing action_pause/action_play labels.
- Coordination: another agent (Codex) is concurrently decomposing App/UI shell files. Keep each diff small and file-isolated (Modal.tsx, AppModals.tsx, layout.css, ReplayStageOverlay.tsx) and avoid unrelated refactors so the changes rebase cleanly.
- Tests to leave behind: extend the existing Modal test (apps/web/src/features/Modal.test.tsx) to assert body scroll is locked while mounted and restored on unmount; a render assertion that the playback control renders an svg (not emoji text) for both playing and paused states.

# Acceptance criteria
- AC1: While any Modal is open on a mobile viewport, the content behind it does not scroll; scrolling works only inside the modal, and closing it restores the previous scroll position without a visible jump.
- AC2: The launch-Grand-Prix confirmation modal fits within a 360px-wide phone viewport with no horizontal scroll and no vertical overflow beyond the modal's own internal scroll; the starting grid reads as a single column.
- AC3: The replay pause/play control renders a drawn SVG icon (pause bars / play triangle) that follows the orange theme via currentColor, with the existing aria-label, title, and playing/paused state preserved.
- AC4: The Modal test asserts the body scroll lock on mount and restore on unmount, and a render test asserts an svg (not emoji text) in both playback states; existing tests pass unchanged.
- AC5: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_028_mobile_modal_hygiene_and_playback_icons_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest.md
- logics/request/req_047_polish_first_session_ux_after_playtest_findings.md
- apps/web/src/features/Modal.tsx
- apps/web/src/app/AppModals.tsx
- apps/web/src/styles/layout.css
- apps/web/src/features/replay/ReplayStageOverlay.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- Mobile playtest feedback 2026-07-20: (a) opening any modal still lets the page behind it scroll on mobile, so the background drifts under the dialog; scroll should be locked behind the modal and allowed only inside it. (b) The launch-Grand-Prix confirmation modal is too tall and too wide on a phone, producing both vertical and horizontal scroll that runs off-screen; it must be compact and stay within the viewport. (c) The replay pause/play button renders as an emoji (glyph varies by client/OS) instead of a drawn icon that matches the app theme.

# AI Context
- Summary: Mobile modal hygiene and real playback icons
- Keywords: request-chain-scaffold, mobile modal hygiene and real playback icons, development-ready
- Use when: You need to implement or review the scaffolded workflow for Mobile modal hygiene and real playback icons.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_154_lock_background_scroll_behind_modals`
- `item_155_make_the_launch_grand_prix_modal_compact_on_mobile`
- `item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon`
