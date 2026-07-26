## req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons - Replayability and fun analytics: measure outcome variety, strategy dominance and emotional arc across many AI seasons
> From version: 0.4.6
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replayability analytics
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Measure REPLAYABILITY over many AI seasons: outcome variety/divergence run to run, detection of a dominant strategy that always wins, comeback frequency, and per-season title suspense (at which round the champion is effectively decided).
- Measure FUN as a narrative arc, not just a scalar: per-race lead changes, close finishes, and the rate of boring races (no overtakes / no order change), aggregated per season.
- Emit these as analytics reports over existing simulation output (ai-playtest / balance sims), reusing the personas and results rather than changing the engine.
- Make the signals actionable: surface the specific strategies/circuits/rounds that drive dominance or boredom so a designer can target them.

# Context
- This is post-hoc analytics, not an engine or persona change: consume the results already produced by ai-playtest (per-race events, positions, order changes, champions) and the balance sims. Do not alter simulateRace, persona strategies, or the fun/frustration formulas; add aggregation and reporting on top. If the shared playtest brain from req_119 lands, read personas/decisions from there.
- Replayability (D): over N seasons, compute outcome variety (how much finishing orders and champions differ across runs vs converge to the same result), DOMINANT-STRATEGY detection (win rate of each approach/preparation/pit/card cluster — a cluster winning far above chance signals collapsed choice), COMEBACK frequency (large positive position deltas within a race/season), and TITLE SUSPENSE (the earliest round after which the eventual champion is guaranteed or effectively locked). balance-simulations already computes gap % and pit-points spread (scripts/balance-simulations.ts:444) — extend that family, do not duplicate it.
- Fun arc (E): per race, count LEAD CHANGES (changes of P1 across the trace/order changes), CLOSE FINISHES (winning gap under a small threshold), and mark BORING races (no overtakes / no order change among the field); aggregate to a per-season narrative (e.g. share of exciting vs flat races, biggest comeback, closest title). Reuse the race result's events/order-change facts rather than re-deriving from geometry.
- Reporting: write reports under reports/ (same family as reports/playtest) with the aggregate metrics AND drill-down to the drivers — which strategy cluster is dominant, which circuits produce the most boring races, which rounds kill title suspense — so findings are actionable, not just scores. A JSON payload option like the existing tools (ai-playtest --json) is welcome for downstream tooling.
- Determinism and scale: reuse the existing seeded run harness so metrics are reproducible across runs; keep it a fast, non-blocking analytics script (not a CI gate) that can scale seasons/rounds via args like ai-playtest.
- Out of scope: changing the simulation engine, persona strategies, circuit data, or the existing fun/frustration formulas; the browser/visual UX harness (separate request); auto-tuning balance in response to findings (a designer acts on the report); and any live/production analytics — this is offline over simulations.

# Acceptance criteria
- AC1: A replayability report over N AI seasons reports outcome variety/divergence, dominant-strategy detection (win rate per approach/preparation/pit/card cluster vs chance), comeback frequency, and per-season title suspense (round the champion is effectively decided).
- AC2: A fun-arc report reports per-race lead changes, close finishes, and boring-race rate (no overtakes/order change), aggregated into a per-season narrative.
- AC3: Both are computed post-hoc over existing simulation results, with no change to simulateRace, persona strategies, or the fun/frustration formulas.
- AC4: Reports drill down to the drivers (dominant strategy cluster, boring-race circuits, suspense-killing rounds) and offer a JSON output, written under reports/.
- AC5: Wired as npm script(s) reusing the seeded harness, non-blocking in CI, and npm run typecheck, npm test, npm run lint, and npm run logics:validate pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_073_replayability_and_fun_analytics_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/scaffold/browser-driven-ai-playtest.json
- scripts/ai-playtest.ts
- scripts/balance-simulations.ts
- scripts/simulate-playtest.ts
- packages/shared/src/simulation/simulateRace.ts
- We can already run huge headless AI tournaments (scripts/ai-playtest.ts: 14 personas x seasons x rounds) and a balance gate (scripts/balance-simulations.ts), but neither answers 'is the game replayable and fun over time?' — they answer 'is it balanced right now?'. balance-simulations only reports gap % and pit-strategy points spread (scripts/balance-simulations.ts:444-445); ai-playtest reports a per-race scalar funScore/frustrationScore and aggregate wins/podiums, with no view of VARIETY or NARRATIVE. Missing signals: (D, replayability) whether outcomes actually vary run to run or converge; whether a DOMINANT STRATEGY exists (does the same approach/preparation/pit/card set always win, collapsing meaningful choice); how often COMEBACKS happen; and how much TITLE SUSPENSE a season has (at which round the champion is mathematically or effectively decided). (E, fun/emotional arc) beyond the scalar fun score: per-race LEAD CHANGES, CLOSE FINISHES, and the rate of BORING races (zero overtakes / no order change), plus a per-season narrative of how those accumulate. These are pure post-hoc analytics over simulation results the tools already produce; they need aggregation and reporting, not engine changes. The point is to give an AI/designer measured evidence to judge replayability and fun, complementing the visual/friction UX harness which is browser-side.

# AI Context
- Summary: Replayability and fun analytics: measure outcome variety, strategy dominance and emotional arc across many AI seasons
- Keywords: request-chain-scaffold, replayability and fun analytics: measure outcome variety, strategy dominance and emotional arc across many ai seasons, development-ready
- Use when: You need to implement or review the scaffolded workflow for Replayability and fun analytics: measure outcome variety, strategy dominance and emotional arc across many AI seasons.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_298_replayability_metrics_variety_dominant_strategy_detection_comebacks_title_suspense`
- `item_299_fun_arc_metrics_lead_changes_close_finishes_boring_race_rate_per_season`
