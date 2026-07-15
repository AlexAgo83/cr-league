## task_040_orchestrate_full_width_replay_moment_notifications - Orchestrate full-width replay moment notifications
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 94
> Confidence: 89
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Inspect `ReplayView.tsx`, `layout.css`, `App.test.tsx`, and `tests/e2e/private-league.spec.ts` before editing.
- [x] 2. Remove the permanent replay key moments panel and simplify the replay grid so the map spans the available content width.
- [x] 3. Derive the active replay moment notification from existing `keyMoments`, marker timing, `clock`, and `seek` behavior.
- [x] 4. Add local replay notification markup and CSS, keeping it clear of controls, tower, map status, and progress bar.
- [x] 5. Preserve progress-bar marker dots and marker click-to-seek behavior.
- [x] 6. Update unit and e2e tests for the new replay layout and notification behavior.
- [x] 7. Run focused replay checks first, then the full local validation gate required by the request.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_071_remove_the_permanent_replay_key_moments_panel`
- `item_072_add_timed_replay_moment_notifications`
- `item_073_preserve_marker_seeking_as_the_compact_replay_index`
- `item_074_update_replay_layout_qa_and_tests`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `ReplayView.tsx` no longer renders `.replay-moments-panel`.
- request-AC2 -> This task. Proof: `layout.css` sets `.replay-main-grid` to one column and E2E verifies the replay map width matches the copy panel.
- request-AC3 -> This task. Proof: `ReplayView.tsx` renders `.replay-moment-notification` from existing `keyMoments` and `momentCard` data.
- request-AC4 -> This task. Proof: marker click calls `seek(marker.time)` and unit/E2E tests verify the notification and live state update after marker seeking.
- request-AC5 -> This task. Proof: `.replay-marker` dots remain rendered on the progress bar and clickable.
- request-AC6 -> This task. Proof: existing replay controls, tower, trait panel, focus, speed menu, and progress tests still pass.
- request-AC7 -> This task. Proof: Report tab assertions still verify race phases, report key moments, rewards, and headline content.
- request-AC8 -> This task. Proof: Playwright checks desktop and mobile replay layout with no permanent side panel and no map overflow.
- request-AC9 -> This task. Proof: `App.test.tsx` and `private-league.spec.ts` cover no permanent panel, notification on marker seek, marker presence, report access, and full replay layout.

# Validation
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test -- apps/web` passed.
- `npm run test:e2e -- --project=chromium` passed.
- `npm run build` passed.
- Implemented full-width replay map layout, removed permanent key moments panel, added timed local replay notifications, preserved progress markers, and updated unit/E2E coverage. Validation passed: npm run typecheck; npm run lint; npm test -- apps/web; npm run test:e2e -- --project=chromium; npm run build.
- Finish workflow executed on 2026-07-16.
- Linked backlog/request close verification passed.

# Report
- Implemented full-width replay map layout, removed the permanent key moments panel, added timed local replay notifications, preserved progress markers, and updated unit/E2E coverage.
- Finished on 2026-07-16.
- Linked backlog item(s): `item_071_remove_the_permanent_replay_key_moments_panel`, `item_072_add_timed_replay_moment_notifications`, `item_073_preserve_marker_seeking_as_the_compact_replay_index`, `item_074_update_replay_layout_qa_and_tests`
- Related request(s): `req_039_turn_replay_key_moments_into_timed_notifications`

# AI Context
- Summary: Orchestrate full-width replay moment notifications
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_039_turn_replay_key_moments_into_timed_notifications`
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)
