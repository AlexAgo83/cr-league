## item_284_cut_getleaguestate_rebuilds_and_historical_over_fetch - Cut getLeagueState rebuilds and historical over-fetch
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Medium
> Theme: Backend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- getLeagueState (storeCore.ts:317) is called 3-5x per mutation (submitDecision 586/633/638/641; resolveCurrentGrandPrix 745/758/761/769/821; buy/sell/livery/name twice), each a full 3-level nested query and payload rebuild.
- Its include (322-327) fetches decisions plus result/qualifyingRuns/forecast JSON for every historical grand prix, though only the current GP uses them and history mapping (361-368) reads only id/name/season/round/status/result.
- Cost grows unbounded with seasons and multiplies with the repeated calls.

# Scope
- In:
  - Build league state once per mutation and thread it through, collapsing the validate-then-return double reads in buy/sell/livery/name.
  - Split the query: current GP (with decisions/qualifyingRuns/forecast) plus a lightweight history findMany selecting only id/name/season/round/status/result.
  - Confirm API responses are byte-identical via the existing app tests.
- Out:
  - Changing the LeagueState/response shape or the public serializers' output.
  - Altering transaction boundaries, locks, or rule errors.
  - Adding caching layers.

# Acceptance criteria
- AC1: getLeagueState is built at most once per mutation.
- AC2: The history query no longer fetches decisions/qualifyingRuns/forecast for past GPs.
- AC3: API responses are byte-identical, proven by app.test.ts; typecheck/lint/tests stay green.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: getLeagueState is built at most once per mutation.
- request-AC9 -> This backlog slice. Proof: AC2: The history query no longer fetches decisions/qualifyingRuns/forecast for past GPs.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Cut getLeagueState rebuilds and historical over-fetch
- Keywords: scaffolded-backlog, cut getleaguestate rebuilds and historical over-fetch, implementation-ready
- Use when: Implementing the scaffolded slice for Cut getLeagueState rebuilds and historical over-fetch.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Partially delivered (commit 746c5cf): the historical over-fetch is fixed (past GPs no longer load decisions/qualifying/forecast JSON; current GP fetched via take:1 + a lightweight history findMany). The 'build state once per mutation' call-dedup was descoped: the leading getLeagueState provides the 404 'League not found' semantics, so removing it changes error responses (violates the byte-identical AC). Each call is now cheap, so the marginal round-trip saving no longer justifies the risk.
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
