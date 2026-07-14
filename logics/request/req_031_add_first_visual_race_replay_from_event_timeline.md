## req_031_add_first_visual_race_replay_from_event_timeline - Add first visual race replay from event timeline
> From version: 0.1.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay readability and race immersion
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add the first visual race replay so a resolved Grand Prix feels less like a report-only outcome.
- Use the stored event timeline and classification data already returned by the simulation; do not add a rendering engine or new race mechanics.
- Make the replay readable on desktop and mobile and keep it consistent with the existing lightweight pit-wall/dashboard visual direction.
- Help testers understand race flow, key events, and decision impact faster than the current text-only timeline.

# Context
- The prototype currently has a playable private-league loop with create/join/rejoin, cadence, restart session, dashboard summary, guided race desk, race recap, event timeline, report, garage, cards, EN/FR switching, and e2e coverage.
- The 2026-07-14 playtest feedback asked for more immersion and more visible race unfolding. Recent slices improved guidance, recap readability, dashboard clarity, and repeatable playtest operation.
- The current replay is a lap-tagged text list under Key moments. It is useful but still does not sell the feeling of watching a race.
- The next slice should be deliberately small: a simple top-down 2D/SVG or HTML/CSS track panel driven by existing event data is enough. Three.js, Pixi, physics, and AI-generated assets are out of scope for this pass.
- The app should still pass the established gates: typecheck, unit tests, lint, build, e2e, i18n validation, and Logics validation.

# Acceptance criteria
- AC1: A resolved Grand Prix shows a visual replay panel derived from existing result data.
- AC2: The replay visualizes the player team, at least one rival or field marker, lap progression, and key race events.
- AC3: The replay highlights player-related or major events without replacing the existing text recap/report.
- AC4: The replay is readable on desktop and mobile with no overlapping labels or inaccessible hover-only controls.
- AC5: The implementation uses existing React/CSS capabilities and does not introduce a rendering engine dependency.
- AC6: EN/FR copy, unit or e2e assertions, visual screenshots, and Logics/docs updates cover the slice.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_002_visual_replay_v0_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_001_cr_league_roadmap.md
- logics/specs/spec_016_implementation_roadmap.md
- docs/playtest/results/2026-07-14-private-league-technical-playtest.md
- apps/web/src/app/App.tsx
- apps/web/src/styles/layout.css
- packages/shared/src/simulation.ts
- tests/e2e/private-league.spec.ts
- Recent commits: eecf2d4 Add playtest reset and league dashboard; ce4f135 Improve race desk immersion; 16f5bb3 Improve race recap readability.

# AI Context
- Summary: Add first visual race replay from event timeline
- Keywords: request-chain-scaffold, add first visual race replay from event timeline, development-ready
- Use when: You need to implement or review the scaffolded workflow for Add first visual race replay from event timeline.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_037_design_visual_replay_v0_contract_and_layout`
- `item_038_implement_visual_replay_panel_in_the_web_app`
- `item_039_capture_replay_v0_playtest_prompts_and_follow_up_risks`
