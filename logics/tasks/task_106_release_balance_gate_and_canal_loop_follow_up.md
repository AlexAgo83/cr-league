## task_106_release_balance_gate_and_canal_loop_follow_up - Release balance gate and canal loop follow-up
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
- `item_263_release_balance_gate_and_canal_loop_follow_up`

# Acceptance criteria
- AC1: A repeatable balance gate command exists and fails on configurable circuit gap percentage or pit-strategy spread thresholds.
- AC2: `circuit_canal_loop` is remeasured with real circuit parameters, and any remaining fix is limited to circuit-scoped data only when the corrected evidence still shows a gap outlier.
- AC3: The change does not alter UI flow, API contracts, storage, release workflow structure, or the shared chrono/Grand Prix engine architecture.
- AC4: Validation covers the balance gate, targeted simulation tests, full typecheck/test/lint/build/e2e, Logics validation, and release status/plan checks before push/release.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_106_release_balance_gate_and_canal_loop_follow_up.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_106_release_balance_gate_and_canal_loop_follow_up.md` after implementation.
- 2026-07-23 validation: targeted chrono/simulation/card/raceFlow tests passed (6 files, 56 tests); balance gate passed with npm run balance:gate -- --json /tmp/cr-league-balance-gate-final-pass.json; full typecheck passed; full unit suite passed (30 passed, 1 skipped; 297 tests passed, 7 skipped); lint passed; build passed; Playwright e2e passed (4 tests). Release status reported target 0.4.2 configured and blocked only by stale push/CI/release/deployment evidence before this commit is pushed.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- 2026-07-23 implementation: balance runner now passes real circuit track length, laps, pit lane progress, and speed profile into simulateRace; release gate supports max circuit gap percentage and max pit strategy points spread thresholds; CI Quality now runs npm run balance:gate. The measured canal_loop issue was corrected as a runner fidelity problem rather than a circuit catalogue change: final gate has canal_loop at 17.22% gap under the 25% threshold. Pit strategy spread improved from 6.46 points in the pre-gate real-circuit run to 3.05 points under the 3.5 release gate threshold.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_263_release_balance_gate_and_canal_loop_follow_up`
- Related request(s): `req_105_release_balance_gate_and_canal_loop_follow_up`

# AI Context
- Summary: Implement release balance gate and canal loop follow-up.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_105_release_balance_gate_and_canal_loop_follow_up`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `scripts/balance-simulations.ts` accepts `--max-gap-pct` and `--max-pit-points-spread`; `npm run balance:gate` exercises both thresholds and exits non-zero on violations.
- request-AC2 -> This task. Proof: the balance runner now passes track length, laps, pit lane progress, and speed profile into `simulateRace`; the corrected final gate shows `circuit_canal_loop` at 17.22% gap under the 25% threshold, so no circuit catalogue edit was needed.
- request-AC3 -> This task. Proof: the implementation changes only CI, package scripts, the balance runner, and bounded pit timing/tuning values; UI flow, API contracts, storage, release workflow structure, and chrono/Grand Prix engine architecture are unchanged.
- request-AC4 -> This task. Proof: balance gate, targeted tests, full typecheck/test/lint/build/e2e, Logics validation, and release status/plan checks are recorded in this task's validation notes.
