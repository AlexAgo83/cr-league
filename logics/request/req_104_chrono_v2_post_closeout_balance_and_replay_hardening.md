## req_104_chrono_v2_post_closeout_balance_and_replay_hardening - Chrono v2 post-closeout balance and replay hardening
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90%
> Complexity: Medium
> Theme: Simulation balance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Run a larger bounded chrono v2 balance pass after the sampled replay trace migration.
- Fix only clear, measured outliers before live: high-upside aggressive/mini_pack combinations should not dominate from poor grid spots, conservative/economy/defense options should remain viable tradeoffs, and circuit gap spreads should stay reviewable.
- Keep replay integrity checks green while making the smallest tuning changes needed.

# Context
- Baseline validation after chrono v2 passed, but the closeout balance sample was intentionally small.
- A larger bounded run on 2026-07-23 used `npm run balance:sim -- --runs 5 --circuits 4 --limit 8 --json /tmp/cr-league-chrono-v2-balance-r5c4.json`.
- The run covered 4 circuits x 432 strategies x 5 runs. It showed `aggressive/reliability/mini_pack/adjustable_wing` at 18.75 avg points, 95% podium, and 55% upset rate from 5.25 average grid.
- The same run showed weak conservative outcomes: `defensive_order` card summary at 3.32 avg points and 1.11% podium, `economy_mode` at 4.32 avg points, and heavy_pack pit summary at 5.97 avg points.
- `circuit_canal_loop` reported 43.51s average gap spread, far above the other sampled circuits.

# Acceptance criteria
- AC1: Balance simulation reporting captures the pre/post evidence for card, pit strategy, upset, duration, and gap spread behavior.
- AC2: Clear outliers from the larger bounded run are adjusted with small chrono tuning changes only; no UI/API/storage/release/circuit catalogue changes.
- AC3: Replay integrity remains valid after tuning: monotonic trace, bounded speed changes, pit/overtake/defense coherence, and final classification alignment.
- AC4: Validation includes targeted simulation tests, full typecheck/test/lint/build/e2e, bounded balance rerun, and Logics validation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `packages/shared/src/simulation/chronoRaceEngine.ts`
- `packages/shared/src/simulation/simulateRace.ts`
- `packages/shared/src/simulation/simulateRace.test.ts`
- `packages/shared/src/simulation/validateReplayTrace.ts`
- `packages/shared/src/domain/decisionDeltas.ts`
- `scripts/balance-simulations.ts`
- `/tmp/cr-league-chrono-v2-balance-r5c4.json`

# AI Context
- Summary: Draft a bounded request for chrono v2 post-closeout balance and replay hardening.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- none
- `item_262_chrono_v2_post_closeout_balance_and_replay_hardening`
