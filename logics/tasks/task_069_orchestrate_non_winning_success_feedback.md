## task_069_orchestrate_non_winning_success_feedback - Orchestrate non-winning success feedback
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the non-winning success feedback request chain and keep sibling implementation slices linked.
- Implementation derives feedback from the existing race result, player decision, weather, card events, points, and credits without changing simulation or persisted result data.

# Plan
- [x] 1. Inspect report/result derivations and identify existing data available for non-winning feedback.
- [x] 2. Implement a pure verdict derivation helper with positive and negative tests.
- [x] 3. Render feedback in existing result/report surfaces with compact copy.
- [x] 4. Add EN/FR i18n keys and targeted render/e2e coverage.
- [x] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_163_derive_non_winning_success_verdicts`
- `item_164_surface_non_winning_feedback_in_reports`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `deriveNonWinningFeedback` returns a compact success verdict for concrete non-winning outcomes and `ReportView` renders it under the race verdict.
- request-AC2 -> Deterministic branches cover preserved/limited loss, weather/card mitigation, and economy/future-option value.
- request-AC3 -> Poor zero-point losses return `tone: "miss"` with try-next guidance instead of success copy.
- request-AC4 -> Only web-derived view model, UI, styles, i18n, and tests changed; simulation, rewards, standings, and persisted result shape were untouched.
- request-AC5 -> EN/FR keys were added for the label, success titles/bodies, and miss title/body.
- request-AC6 -> Unit tests cover positive and negative helper derivations; ReportView render test covers the visible feedback panel; e2e still passes.
- request-AC7 -> Proof: typecheck, tests, build, lint, e2e, and Logics validation pass.

# Validation
- `npm run typecheck` passed.
- `npx vitest run apps/web/src/app/helpers.test.ts apps/web/src/features/ReportView.test.tsx apps/web/src/i18n/index.test.ts` passed: 3 files, 27 tests.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 222 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run test:e2e` passed: 4 Playwright tests.
- `npm run logics:validate` passed after workflow closeout; remaining warnings are unrelated open-doc Mermaid/traceability warnings.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Added `deriveNonWinningFeedback` as a pure web helper.
- Added compact non-winning feedback to `ReportView`.
- Added EN/FR copy and focused helper/render tests.
- No simulation, reward, standings, or persisted result behavior changed.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_163_derive_non_winning_success_verdicts`, `item_164_surface_non_winning_feedback_in_reports`
- Related request(s): `req_068_non_winning_success_feedback`

# AI Context
- Summary: Orchestrate non-winning success feedback
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_068_non_winning_success_feedback`
- Product brief(s): `prod_032_non_winning_success_feedback_product_brief`
- Architecture decision(s): (none yet)
