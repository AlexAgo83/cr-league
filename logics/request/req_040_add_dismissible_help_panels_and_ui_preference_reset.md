## req_040_add_dismissible_help_panels_and_ui_preference_reset - Add dismissible help panels and UI preference reset
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Dismissible contextual help and preference reset
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let players close recurring contextual explanation panels when they no longer need them.
- Persist dismissed help panels locally so closed panels remain hidden after reload.
- Add a Profile menu action to reset UI preferences and bring dismissed help panels back.
- Define a safe boundary between UI preferences and durable player/profile/league data.
- Keep language, replay speed, replay focus, and season recap seen flags in the reset policy only if the implementation deliberately documents that choice.
- Keep the Race prep and Race replay surfaces clear, accessible, localized, and stable on desktop and mobile.

# Context
- `App.tsx` currently renders the Race prep contextual panel as `.race-context-panel` with `drive_context_title` and `drive_context_explainer`.
- `ReplayView.tsx` currently renders the Race replay contextual panel as `.race-context-panel.replay-copy-panel` with `result_replay_title` and `result_replay_explainer` by default.
- `App.tsx` already owns the Profile menu and destructive profile reset flow through `forgetProfile`; the new preference reset must be a separate non-destructive action.
- Current localStorage keys include durable profile/session data: `cr-league-player-claims`, `cr-league-active-player-claim`, and `cr-league-profile-session`. These must not be removed by preference reset.
- Current localStorage keys also include UI-ish preferences or seen state: `cr-league-language`, `cr-league-replay-speed`, `cr-league-replay-focus`, and dynamic `cr-league-season-recap:*` keys.
- New dismissed-panel keys should be explicit and stable, for example `cr-league-dismissed-race-prep-help` and `cr-league-dismissed-replay-help`.
- The reset should be implemented with an explicit allowlist or narrowly-scoped prefix handling, not broad `localStorage.clear()` or substring deletion.
- The smallest successful result is two dismissible help panels, one safe Profile menu reset action, localized copy, and tests proving profile data survives the reset.

# Acceptance criteria
- AC1: The Race prep contextual panel has an accessible close control that hides the panel without disrupting the map, directive, or cockpit layout.
- AC2: The Race replay contextual panel has an accessible close control that hides the panel without disrupting replay controls, map, tower, or timeline layout.
- AC3: Dismissing each panel is persisted in localStorage and the same panel remains hidden after page reload.
- AC4: The Profile menu includes a non-destructive Reset UI preferences action with localized EN/FR copy.
- AC5: Reset UI preferences clears dismissed help panel state and re-shows the Race prep and Race replay panels on the next render or reload.
- AC6: Reset UI preferences handles existing replay preferences and season recap seen flags according to an explicit documented allowlist.
- AC7: Reset UI preferences never removes `cr-league-profile-session`, `cr-league-player-claims`, `cr-league-active-player-claim`, league progress, player identity, or recovery code data.
- AC8: Language reset behavior is an explicit product decision: either preserved during UI reset or intentionally reset with visible copy making that clear.
- AC9: Close buttons and reset action are keyboard accessible, have clear accessible names, and do not rely on hardcoded visible copy.
- AC10: Unit/e2e tests cover panel dismissal persistence, reset re-show behavior, replay preference reset behavior, and preservation of durable profile/session data.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/product/prod_003_race_cockpit_redesign_v0_product_brief.md
- logics/product/prod_009_pit_wall_race_plan_product_brief.md
- logics/product/prod_010_full_width_replay_moment_notifications_product_brief.md
- logics/architecture/adr_005_theme_design_system.md
- logics/architecture/adr_006_accessibility.md
- logics/architecture/adr_007_i18n.md
- apps/web/src/app/App.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css
- apps/web/src/app/App.test.tsx
- tests/e2e/private-league.spec.ts
- Current UX issue: contextual panels such as Race prep and Race replay remain visible forever even after the player understands them.
- Desired direction: add small close controls to these panels, remember the dismissal locally, and add a Profile menu action that resets UI preferences without deleting the player profile or league state.

# AI Context
- Summary: Add dismissible help panels and UI preference reset
- Keywords: request-chain-scaffold, add dismissible help panels and ui preference reset, development-ready
- Use when: You need to implement or review the scaffolded workflow for Add dismissible help panels and UI preference reset.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_075_define_the_ui_preference_storage_boundary`
- `item_076_make_contextual_help_panels_dismissible`
- `item_077_add_reset_ui_preferences_to_the_profile_menu`
- `item_078_validate_preference_reset_and_panel_behavior`
