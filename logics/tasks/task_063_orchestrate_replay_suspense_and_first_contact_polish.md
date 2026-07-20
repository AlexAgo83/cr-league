## task_063_orchestrate_replay_suspense_and_first_contact_polish - Orchestrate replay suspense and first-contact polish
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90
> Confidence: 85
> Progress: 45
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Wave 1 sequencing: req_058/useReplayClock split has landed, so the payoff gate was implemented in current `ReplayView` around the existing clock state and `afterMapContent` boundary. req_060/report verdict is already present; the report shortcut is gated before it can reveal that content mid-replay.

# Plan
- [x] 1. Check the landing order against req_058 (ReplayView split) and req_060 (verdict block); rebase the payoff gating onto useReplayClock if the split has landed, otherwise implement on current ReplayView and note it for the split.
- [x] 2. Implement the payoff completion gate with its skip control and test.
- [x] 3. Land the first-contact fixes (one-click chrono, Enter submit, intro persistence) with their test updates.
- [ ] 4. Fix the attempt labels and key-moment grouping with helper tests.
- [ ] 5. Implement plan-lock safety (item_153): Send plan confirmation with plan summary and unused-card warning, visible locked state on the plan screen, carried-over-plan label, and the finished-GP reopen-on-summary behavior with a labeled replay exit (item_149 extension).
- [ ] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and mark roadmap patch 0.3.18 shipped when released.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_149_gate_the_race_payoff_on_replay_completion`
- `item_150_first_contact_frictions_one_click_chrono_enter_submits_intros_persist`
- `item_151_readability_papercuts_attempt_rank_labels_and_key_moment_variety`
- `item_153_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Wave 1 implementation: gated `ReplayView` payoff content and report shortcut until replay completion or explicit skip; added EN/FR skip/result-locked copy.
- Wave 1 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts`.
- Wave 2 implementation: one-click chrono except final-attempt confirmation, native form submit semantics for setup forms, and league-scoped intro persistence on plain close.
- Wave 2 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`.

# AI Context
- Summary: Orchestrate replay suspense and first-contact polish
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
