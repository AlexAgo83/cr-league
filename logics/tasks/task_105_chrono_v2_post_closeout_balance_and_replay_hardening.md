## task_105_chrono_v2_post_closeout_balance_and_replay_hardening - Chrono v2 post-closeout balance and replay hardening
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_262_chrono_v2_post_closeout_balance_and_replay_hardening`

# Acceptance criteria
- AC1: Balance simulation reporting captures the pre/post evidence for card, pit strategy, upset, duration, and gap spread behavior.
- AC2: Clear outliers from the larger bounded run are adjusted with small chrono tuning changes only; no UI/API/storage/release/circuit catalogue changes.
- AC3: Replay integrity remains valid after tuning: monotonic trace, bounded speed changes, pit/overtake/defense coherence, and final classification alignment.
- AC4: Validation includes targeted simulation tests, full typecheck/test/lint/build/e2e, bounded balance rerun, and Logics validation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_105_chrono_v2_post_closeout_balance_and_replay_hardening.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_105_chrono_v2_post_closeout_balance_and_replay_hardening.md` after implementation.
- 2026-07-23 validation: targeted chrono/replay tests passed (4 files, 44 tests); package shared typecheck passed; replay inspection passed with 37-point chrono traces and coherent race phases; full typecheck passed; full unit test suite passed (30 passed, 1 skipped; 297 tests passed, 7 skipped); lint passed; build passed; Playwright e2e passed (4 tests). Bounded balance rerun used npm run balance:sim -- --runs 5 --circuits 4 --limit 8 --json /tmp/cr-league-chrono-v2-balance-r5c4-final.json.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- 2026-07-23 final balance evidence: pre-run outliers were aggressive/reliability/mini_pack/adjustable_wing at 18.75 avg points, 95% podium, 55% upset from 5.25 avg grid; defensive_order at 3.32 avg points and 1.11% podium; economy_mode at 4.32 avg points; heavy_pack at 5.97 avg points; circuit_canal_loop gap spread at 43.51s. Final run: top strategy is aggressive/reliability/standard/final_surge at 18.4 avg points, 100% podium, 60% upset; pit summaries are close (standard 8.48 avg points, heavy_pack 8.17, mini_pack 7.59); adjusted card summaries are adjustable_wing 8.93, defensive_order 8.75, economy_mode 7.20, no_card 5.64. Gap percentage reporting was added; canal_loop remains a visible circuit outlier at 43.71s and 30.14% gap spread and is left as follow-up because this slice intentionally avoids circuit catalogue changes.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_262_chrono_v2_post_closeout_balance_and_replay_hardening`
- Related request(s): `req_104_chrono_v2_post_closeout_balance_and_replay_hardening`

# AI Context
- Summary: Implement chrono v2 post-closeout balance and replay hardening.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_104_chrono_v2_post_closeout_balance_and_replay_hardening`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `scripts/balance-simulations.ts` now reports `avgGapPct`, and the task report records the pre-run `/tmp/cr-league-chrono-v2-balance-r5c4.json` findings plus the final `/tmp/cr-league-chrono-v2-balance-r5c4-final.json` card, pit, upset, duration, gap, and gap percentage evidence.
- request-AC2 -> This task. Proof: tuning stayed scoped to `decisionDeltas.ts`, `chronoRaceEngine.ts`, `simulateRace.ts`, card descriptor/test alignment, and balance reporting; no UI flow, API, storage, release, or circuit catalogue files were changed.
- request-AC3 -> This task. Proof: targeted replay/simulation tests passed and `npm run replay:inspect` passed after tuning with coherent race phases and 37-point chrono traces.
- request-AC4 -> This task. Proof: targeted tests, shared typecheck, replay inspection, bounded balance rerun, full typecheck, unit tests, lint, build, Playwright e2e, and Logics validation are recorded in this task's validation notes.
