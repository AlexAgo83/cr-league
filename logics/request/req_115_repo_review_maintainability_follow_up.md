## req_115_repo_review_maintainability_follow_up - Repo review maintainability follow-up
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Medium
> Theme: Maintainability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: closeout traceability proof.

# Needs
- Collapse the repeated per-handler error/guard/404 boilerplate in leagues/routes.ts into one shared route helper, preserving each route's specific 400 message and the exact status codes clients see today.
- Continue breaking down apps/api/src/features/leagues/storeCore.ts so no single hand-written file stays above ~800 lines, without changing behavior or the public import surface.
- Split apps/web/src/app/App.tsx so the top-level component delegates each screen concern to a focused child, keeping rendered output and behavior identical.
- Raise branch coverage toward the line-coverage level by adding targeted tests over the currently-uncovered error and rule-violation branches, with no weakened assertions.

# Context
- This is a TypeScript monorepo: apps/api (Fastify + Prisma), apps/web (React 19), packages/shared (domain + seeded simulation).
- No new dependencies are wanted; every item is an internal reorganization or added test.
- The repo convention exposes a module's public API as named exports and keeps store.ts/storeCore.ts as barrels so consumers and tests import from a stable path.
- routes.ts today returns route-specific 400 messages (e.g. 'Expected a team id and card id'); those must survive the refactor.
- Behavior-critical race-integrity logic (in-transaction re-checks, row locks, LeagueRuleError messages) must be preserved verbatim.

# Acceptance criteria
- AC1: leagues/routes.ts routes go through one shared helper that centralizes the LeagueRuleError catch, the null->404, and the 400 guard, while each route still returns its own specific bad-request message; the file shrinks with no change to status codes or response bodies.
- AC2: storeCore.ts is split so no resulting hand-written source file exceeds ~800 lines, the public import surface (symbols imported by routes.ts, admin/store.ts, and tests) is unchanged, and behavior is preserved verbatim.
- AC3: App.tsx delegates each screen concern to a focused child component with identical rendered output and behavior, and no single web component file remains an 800+ line grab-bag.
- AC4: Overall branch coverage rises meaningfully toward line coverage by covering previously-uncovered error and rule-violation branches, with no assertions weakened or tests skipped to inflate the number.
- AC5: Typecheck, lint, and the full unit test suite pass unchanged (315+ passing), and the CI gates (audit, balance:gate, logics:validate) stay green.
- AC6: The duplicated object-shape preamble in the leagues/routes.ts body guards is extracted into one shared helper used by all 14 guards, with their field checks and accepted/rejected inputs unchanged.
- AC7: The inlined per-view second-formatting (lap/best times and gaps) is centralized in one web helper, with rendered text byte-identical to today.

# AC Traceability
- AC1 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: item_273 delivered the shared leagues route helper; API tests passed.
- AC2 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: item_274 split storeCore.ts into focused modules; storeCore.ts is 27 lines and the largest league store file is 687 lines.
- AC3 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: item_275 extracted HomeSplash, modal state, and preference constants; App.tsx is 796 lines with focused App tests passing.
- AC4 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: item_276 added rule-violation tests; branch coverage moved 80.52% -> 80.62% overall.
- AC5 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: npm run typecheck, npm run lint, npm test, npm test -- --coverage, npm run balance:gate, logics lint, and logics audit passed.
- AC6 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: item_277 delivered asRecord(value) for leagues route body guards; API tests passed.
- AC7 -> `task_116_orchestrate_repo_review_maintainability_follow_up`. Proof: item_278 delivered formatSeconds(value, decimals); web tests passed with byte-identical text.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/storeCore.ts
- apps/api/src/features/admin/routes.ts
- apps/web/src/app/App.tsx
- coverage/coverage-summary.json
- Current diagnostic: apps/api/src/features/leagues/routes.ts (509 lines) repeats the same try/catch (LeagueRuleError -> sendLeagueRuleError) / 400-guard / 404-on-null / re-throw block across ~15 handlers, each differing only by its body guard, its store call, and its bad-request message.
- Current diagnostic: apps/api/src/features/leagues/storeCore.ts is 1312 lines, the largest hand-written source file in the repo, still mixing multiple lifecycles despite the earlier store->barrel split.
- Current diagnostic: apps/web/src/app/App.tsx is 841 lines, the largest web component, concentrating view routing and multiple screen concerns.
- Current diagnostic: coverage/coverage-summary.json reports 61.92% branch coverage overall while lines sit at 71.45%; the gap is concentrated in error and rule-violation branches of the leagues store and simulation.
- Current baseline: 315 unit tests passing, lint clean, tsc strict with noUncheckedIndexedAccess; CI runs npm audit, lint, typecheck, balance:gate and logics:validate.

# AI Context
- Summary: Repo review maintainability follow-up
- Keywords: request-chain-scaffold, repo review maintainability follow-up, development-ready
- Use when: You need to implement or review the scaffolded workflow for Repo review maintainability follow-up.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_273_centralize_leagues_route_error_guard_404_handling_behind_one_helper`
- `item_274_split_storecore_ts_below_the_size_ceiling`
- `item_275_decompose_app_tsx_into_focused_screen_components`
- `item_276_close_the_branch_coverage_gap_on_error_and_rule_violation_paths`
- `item_277_extract_shared_body_guard_preamble_in_leagues_routes_into_asrecord`
- `item_278_centralize_web_lap_time_and_gap_second_formatting_in_one_helper`
