## req_068_non_winning_success_feedback - Non-winning success feedback
> From version: 0.3.11
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Outcome comprehension beyond winning
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make non-winning races feel understandable and sometimes successful when the player executed a defensive, economy, or weather plan well.
- Detect and name meaningful non-winning outcomes such as preserved position, minimized loss in bad weather, converted card value, saved credits, or gained future option value.
- Surface this feedback in result/report copy and, where applicable, replay/report summary moments without changing rewards or standings.
- Keep the feedback honest: do not call a poor result successful unless the data supports a concrete saved-risk or future-value reason.
- Support EN/FR copy and keep the UI compact.

# Context
- Reports currently explain outcomes and rewards, but a player who does not win can still miss why their plan was useful.
- This request should derive labels from existing result, decision, card, weather, and classification data. It should not invent hidden objectives or grant extra rewards.
- Dynamic race objectives (0.3.12) may later add explicit missions. This request should work without selected objectives and remain compatible with them later.
- Reuse existing report/replay/result surfaces rather than creating a new results page.

# Acceptance criteria
- AC1: Result/report surfaces can show a non-winning success verdict when a concrete defensive, economy, weather, or future-value outcome is detected.
- AC2: At least three deterministic non-winning patterns are supported: position preserved/limited loss, weather/card plan value, and economy/future-option value.
- AC3: A clearly poor non-winning result does not receive a success verdict; it still receives useful failure/try-next guidance.
- AC4: Feedback changes no simulation, standings, rewards, or persisted result shape unless an additive derived view model is used only in the web app.
- AC5: EN/FR copy is present for labels and explanations.
- AC6: Unit tests cover positive and negative derivations; existing report/replay/result e2e flow still passes.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_032_non_winning_success_feedback_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next.md
- apps/web/src/features/ReportView.tsx
- apps/web/src/features/ResultView.tsx
- apps/web/src/features/replay/ReplayStageOverlay.tsx
- apps/web/src/app/raceFlow.ts
- apps/web/src/app/useRaceDerivations.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- tests/e2e/private-league.spec.ts
- Roadmap 0.3.15: make defensive, economy, and weather plans visibly rewarding when they save risk, preserve a target position, amortize bad weather, or turn credits into future options even without a win.

# AI Context
- Summary: Non-winning success feedback
- Keywords: request-chain-scaffold, non-winning success feedback, development-ready
- Use when: You need to implement or review the scaffolded workflow for Non-winning success feedback.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_163_derive_non_winning_success_verdicts`
- `item_164_surface_non_winning_feedback_in_reports`
