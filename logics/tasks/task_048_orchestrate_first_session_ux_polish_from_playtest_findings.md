## task_048_orchestrate_first_session_ux_polish_from_playtest_findings - Orchestrate first-session UX polish from playtest findings
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read `App.tsx`, notification CSS, Race mobile layout CSS, qualifying state flow, `ReplayView.tsx`, onboarding copy, i18n files, and current App/e2e tests before editing.
- [ ] 2. Fix notification lifecycle and placement first, because stale stacked toasts distort every other playtest screen.
- [ ] 3. Polish mobile Race guidance once notification overlap is removed, keeping the circuit prominent while making step instructions readable.
- [ ] 4. Replace automatic qualifying replay with the compact result flow, then keep explicit replay review working.
- [ ] 5. Add the deterministic replay grid-start beat in the existing replay presentation layer without changing simulation truth.
- [ ] 6. Update onboarding copy/CTA hierarchy while preserving profile recovery and saved-league flows.
- [ ] 7. Run focused tests after each wave, then the full gate: typecheck, lint, unit tests, build, e2e, i18n validation, and Logics validation.
- [ ] 8. Record playtest proof with desktop/mobile screenshots or e2e observations for the five user-facing fixes.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback`
- `item_109_make_mobile_race_guidance_readable_without_shrinking_the_circuit`
- `item_110_replace_automatic_chrono_replay_with_a_compact_qualifying_result_flow`
- `item_111_add_a_readable_staged_grid_start_beat_to_race_replay`
- `item_112_lead_onboarding_with_the_league_promise_before_profile_mechanics`

# Definition of Done (DoD)
- [ ] Notification lifecycle replacement is implemented and verified before other UX polish work.
- [ ] Mobile Race guidance is readable and accessible at 390px width.
- [ ] Qualifying runs land on a compact result state by default and still support explicit replay review.
- [ ] Replay starts with a deterministic readable grid-start beat without changing race truth.
- [ ] Onboarding leads with the racing-league promise while preserving profile recovery and saved-league flows.
- [ ] Playtest proof covers desktop and mobile for the five user-facing fixes.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof deferred until notification lifecycle replacement is implemented and verified.
- request-AC2 -> This task. Proof deferred until notification placement no longer obscures controls/content in desktop and mobile screenshots or e2e observations.
- request-AC3 -> This task. Proof deferred until mobile Race guidance is readable and tested at 390px width.
- request-AC4 -> This task. Proof deferred until qualifying runs show compact result state by default and explicit replay remains available.
- request-AC5 -> This task. Proof deferred until replay grid-start staging is deterministic and tested.
- request-AC6 -> This task. Proof deferred until onboarding copy/CTA hierarchy is updated while preserving recovery/saved-league behavior.
- request-AC7 -> This task. Proof deferred until accessibility checks for notifications, modals, mobile guidance, and duplicate labels are recorded.
- request-AC8 -> This task. Proof deferred until focused tests cover the five UX changes.
- request-AC9 -> This task. Proof deferred until full validation gate passes.
- request-AC10 -> This task. Proof deferred until playtest proof is recorded with screenshots or scripted e2e observations.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Run `logics-manager i18n validate`.
- Run `npm run logics:validate`.

# Report
- Not started. This task is ready for an implementation agent.

# AI Context
- Summary: Orchestrate first-session UX polish from playtest findings
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_047_polish_first_session_ux_after_playtest_findings`
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)
