## req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs - Aggressive mini-pack balance diagnostic: verify and correct win concentration without blind nerfs
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Balance diagnostics
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Validate whether the apparent aggressive + mini_pack win concentration is a true balance issue or an artifact of the current replayability sample, circuit mix, starter cards, or AI persona composition.
- Add enough grouped evidence to the offline reports to compare approach, preparation, pit strategy, card, and profile performance without reading raw JSON by hand.
- If the evidence confirms a meaningful skew, make the smallest targeted tuning change that preserves comeback rate, close finishes, title suspense, and strategy variety.
- Keep the workflow deterministic and offline: this is a simulation/balance pass, not a UI, production telemetry, or live analytics change.

# Context
- The replayability analytics script already computes cluster win rates and fun-arc metrics. It is enough to reveal concentration, but not enough to explain whether the source is approach, pit strategy, card effect, profile inventory, grid behavior, or circuit mix.
- The balance runner already sweeps strategy combinations and has pit-strategy summaries, card summaries, gap checks, and JSON output. Prefer extending or reusing these existing tools over adding a third balance system.
- The current report does not show a hard dominant strategy: every cluster is below the configured 25% dominance threshold. The risk is softer: aggressive + mini_pack may be overrepresented among wins while prudent/heavy or balanced/standard lanes still provide less championship pressure.
- Any implementation change should be evidence-led. First add or run grouped diagnostics over approach, pit strategy, card, and profile. Only retune if the diagnostics show a stable skew across larger samples or the balance gate.
- Out of scope: redesigning pit strategy rules, adding tire management, changing player UX copy, changing circuit data wholesale, or auto-tuning from report output.

# Acceptance criteria
- AC1: A reproducible diagnostic report shows grouped performance by approach, preparation, pit strategy, card, and playtest profile, including win share, podium/share or points, and comparison to overall chance.
- AC2: The report explains whether aggressive + mini_pack concentration is confirmed, inconclusive, or sample-driven, with references to larger deterministic runs.
- AC3: If tuning is applied, it is the smallest scoped change to existing balance constants or decision effects and is covered by focused tests or balance gates.
- AC4: Replayability/fun regressions are checked after the pass: champion variety, finishing-order variety, comeback rate, close-finish rate, boring-race rate, and title suspense remain acceptable.
- AC5: No simulation engine architecture, persona strategy rewrite, live telemetry, or UI flow is introduced.
- AC6: npm run typecheck, npm test, npm run lint, npm run build, npm run playtest:replayability, and npm run logics:validate pass before closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_075_aggressive_mini_pack_balance_diagnostic_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/scaffold/replayability-fun-analytics.json
- scripts/replayability-analytics.ts
- scripts/balance-simulations.ts
- scripts/playtestBrain.ts
- packages/shared/src/domain/decisionDeltas.ts
- packages/shared/src/simulation/simulateRace.ts
- reports/playtest/replayability-analytics.md
- The latest replayability sample (12 seasons x 6 GP x 14 agents) shows no dominant cluster above the 25% threshold, but wins concentrate around aggressive/speed or aggressive/weather with mini_pack and pace cards. The top two clusters are aggressive/speed/mini_pack/soft_tires at 16.67% and aggressive/weather/mini_pack/soft_tires at 15.28%, with 0% boring races, 27.78% close finishes, and titles usually decided in round 6. Treat this as a diagnostic and tuning request, not an automatic nerf.

# AI Context
- Summary: Aggressive mini-pack balance diagnostic: verify and correct win concentration without blind nerfs
- Keywords: request-chain-scaffold, aggressive mini-pack balance diagnostic: verify and correct win concentration without blind nerfs, development-ready
- Use when: You need to implement or review the scaffolded workflow for Aggressive mini-pack balance diagnostic: verify and correct win concentration without blind nerfs.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_306_group_replayability_and_balance_diagnostics_by_strategy_axes`
- `item_307_apply_minimal_balance_tuning_only_if_diagnostics_confirm_skew`
