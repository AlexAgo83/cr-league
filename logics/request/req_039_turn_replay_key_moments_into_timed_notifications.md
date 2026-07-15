## req_039_turn_replay_key_moments_into_timed_notifications - Turn replay key moments into timed notifications
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay immersion and key moment presentation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the replay map the dominant full-width stage in the Result replay tab.
- Remove the permanent Key moments side panel from the replay layout so the player watches the race instead of reading a dashboard list.
- Show key moments as timed overlay notifications during playback, synchronized with replay time and seek behavior.
- Keep existing progress-bar markers so players can jump back to important moments without the permanent panel.
- Preserve the written analysis and durable key moment review in the Report tab rather than duplicating it in Replay.
- Keep replay controls, tower, map status, trait chips, speed menu, focus mode, and timeline markers readable on desktop and mobile.

# Context
- The current `ReplayView` renders a `.replay-main-grid` containing a content column with the map and a permanent `.replay-moments-panel` list.
- The current e2e layout test asserts that `.replay-moments-panel` sits to the right of the copy panel and has the same width as the directive panel. That test must be redesigned because the desired layout removes that panel.
- The replay already computes `keyMoments`, `markers`, `momentCard`, `raceTimeAtProgress`, `clock`, `live`, and `seek`. These should be reused for notification timing and marker seeking.
- The progress bar already renders `.replay-marker` dots with titles and `seek(marker.time)` handlers. These markers should remain as the compact persistent navigation surface.
- The change should not alter simulation output, race result data, replay trace math, card effects, report content, or API contracts.
- The smallest successful result is a full-width replay map with one transient moment notification at the relevant time, plus unchanged marker seeking and report access.

# Acceptance criteria
- AC1: The Replay tab no longer renders the permanent `.replay-moments-panel` or equivalent side list of key moments.
- AC2: The replay map area spans the available replay content width on desktop, while keeping replay copy/status information readable above or over the map.
- AC3: Key moments appear as timed overlay notifications during playback, using the same event selection and text semantics as the current key moment list.
- AC4: Seeking via progress-bar markers updates the visible notification or notification timing consistently with the selected moment.
- AC5: The progress bar keeps visible marker dots for key/player moments and remains clickable for seeking.
- AC6: Replay controls remain accessible and visually stable: play/pause, restart, focus driver, custom speed menu, tower, map status, and progress bar still work.
- AC7: The Report tab remains the durable place for post-race explanation and written recap; no report content is removed.
- AC8: Desktop and mobile layouts show no overlapping notification, tower, controls, map status, or progress bar text.
- AC9: Updated unit/e2e tests verify the full-width replay layout, absence of the permanent key moments panel, timed notification behavior, marker seeking, and unchanged report access.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/product/prod_003_race_cockpit_redesign_v0_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- logics/specs/spec_016_implementation_roadmap.md
- logics/architecture/adr_005_theme_design_system.md
- logics/architecture/adr_006_accessibility.md
- logics/architecture/adr_007_i18n.md
- apps/web/src/features/ReplayView.tsx
- apps/web/src/styles/layout.css
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/app/App.test.tsx
- tests/e2e/private-league.spec.ts
- Current replay issue: the permanent Key moments panel competes with the map and makes the replay feel like a dashboard instead of the main race spectacle.
- Desired direction: remove the permanent Key moments panel from the replay view, let the map use the full replay width, surface key moments as timed replay notifications, and keep progress-bar markers for seeking.

# AI Context
- Summary: Turn replay key moments into timed notifications
- Keywords: request-chain-scaffold, turn replay key moments into timed notifications, development-ready
- Use when: You need to implement or review the scaffolded workflow for Turn replay key moments into timed notifications.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_071_remove_the_permanent_replay_key_moments_panel`
- `item_072_add_timed_replay_moment_notifications`
- `item_073_preserve_marker_seeking_as_the_compact_replay_index`
- `item_074_update_replay_layout_qa_and_tests`
