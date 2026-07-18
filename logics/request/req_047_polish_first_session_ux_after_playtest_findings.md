## req_047_polish_first_session_ux_after_playtest_findings - Polish first-session UX after playtest findings
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: First-session UX polish
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Remove stale and contradictory notifications so the UI never says an old loading action is still happening after a later success.
- Keep operational feedback visible without covering race controls, replay timeline, mobile guidance, or garage cards.
- Make mobile race guidance readable without shrinking the circuit into a dense dashboard.
- Make repeated qualifying attempts faster by showing a compact result state first and keeping full lap replay as an explicit option.
- Make the replay start read like a race start, with a short staged grid/launch moment before cars collapse into normal race spacing.
- Make the first-session flow sell the racing-league fantasy before asking for profile mechanics, while preserving recovery and saved-league behavior.
- Keep the work development-ready for another AI: scoped files, acceptance criteria, validation gates, and playtest proof.

# Context
- `apps/web/src/app/App.tsx` owns `notifications`, `pushNotification`, `showStatus`, and the shared `run` wrapper used by profile, league, directive, qualifying, resolve, garage, and settings actions.
- Notifications currently live in `.notification-stack` and each notification auto-dismisses after a fixed timeout, but pending and success messages are independent entries instead of replacing each other.
- `SetupShell` and the authenticated app both render the same notification stack, so notification placement affects onboarding, setup, race, garage, replay, and modal states.
- `RaceView` content inside `App.tsx` renders the map workflow panel, race-day step labels, qualifying panel, primary commands, and mobile-bottom dense controls.
- Qualifying currently uses `qualifyingConfirmModal`, `startQualifyingRun`, `qualifyingResult`, inline `ReplayView` for `currentQualifyingResult`, and the `action_qualifying_history` button.
- `ReplayView.tsx` now builds deterministic replay plans and moves replay cars from trace/facts, but the initial field still appears visually crowded around the start line.
- The product uses React, SVG, CSS, and existing tests; no new UI framework, toast library, animation engine, or physics system is needed.
- Copy is localized through `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`, so new user-facing text must update both locales and pass i18n validation.
- The desired result is a more polished first session, not a wholesale redesign of the app shell, garage, race algorithm, or replay architecture.

# Acceptance criteria
- AC1: Notifications use a clear lifecycle: one pending notification per command is replaced by success or error, stale pending messages never remain after success, success messages auto-dismiss, and errors remain dismissible until the user closes them.
- AC2: Notification placement and stacking no longer obscure primary race controls, replay timeline, mobile step guidance, modal actions, or garage card rows on desktop and mobile.
- AC3: The mobile Race screen presents the active step title and instruction without truncating essential copy, using a compact expandable/bottom-sheet pattern or another equally readable mobile pattern.
- AC4: After a qualifying lap, the default state is a compact result summary with best time/rank/attempt context and primary actions for another attempt, replay, or lock plan; full lap replay opens only when explicitly requested.
- AC5: Replay has a deterministic staged grid-start phase: cars begin in readable grid positions, a short launch beat separates the field, and the existing replay order/final classification remain unchanged.
- AC6: The first-session onboarding frames the player goal before profile mechanics: starting a league is the primary path, recovery stays available, and the profile/recovery requirement is explained as saving access rather than as the product headline.
- AC7: Existing accessibility basics remain intact: notifications use appropriate live regions, modals remain labelled and focusable, mobile expandable guidance is reachable by keyboard/screen reader, and duplicated button labels in modals do not create ambiguous accessible actions.
- AC8: Tests cover notification lifecycle replacement, mobile guidance readability, qualifying compact-result flow, replay grid-start determinism, and onboarding path copy/CTA behavior.
- AC9: Existing gates still pass: typecheck, lint, unit tests, build, e2e private-league/replay checks, i18n validation, and Logics validation.
- AC10: Playtest proof is recorded with desktop and mobile screenshots or scripted e2e observations for onboarding, Race mobile, qualifying result, replay start, and garage with notifications active.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/product/prod_002_visual_replay_v0_product_brief.md
- logics/product/prod_010_full_width_replay_moment_notifications_product_brief.md
- logics/product/prod_017_coherent_race_replay_and_simulation_realism_product_brief.md
- logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md
- logics/specs/spec_004_race_report_and_replay_ux.md
- logics/specs/spec_016_implementation_roadmap.md
- apps/web/src/app/App.tsx
- apps/web/src/app/App.test.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/DirectivePanel.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css
- tests/e2e/private-league.spec.ts
- Playtest diagnostic: stale progress toasts such as `Creating profile...`, `Creating league...`, `Locking race plan...`, and `Resolving Grand Prix...` remain visible after success and stack over primary content.
- Playtest diagnostic: on desktop, stacked notifications cover race step copy, garage cards, and replay controls; on mobile they consume a large bottom band.
- Playtest diagnostic: mobile Race keeps the circuit impressive, but the bottom step instruction truncates to text such as `Check the tra...`.
- Playtest diagnostic: running a qualifying lap opens the full lap replay immediately, which is attractive once but slows down repeated 3-attempt chrono play.
- Playtest diagnostic: replay starts with cars visually clustered under the start line instead of a readable staged grid start.
- Playtest diagnostic: onboarding is visually clean but starts with profile/account mechanics before the user sees the racing-league promise.

# AI Context
- Summary: Polish first-session UX after playtest findings
- Keywords: request-chain-scaffold, polish first-session ux after playtest findings, development-ready
- Use when: You need to implement or review the scaffolded workflow for Polish first-session UX after playtest findings.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback`
- `item_109_make_mobile_race_guidance_readable_without_shrinking_the_circuit`
- `item_110_replace_automatic_chrono_replay_with_a_compact_qualifying_result_flow`
- `item_111_add_a_readable_staged_grid_start_beat_to_race_replay`
- `item_112_lead_onboarding_with_the_league_promise_before_profile_mechanics`
