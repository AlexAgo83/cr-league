## req_105_release_balance_gate_and_canal_loop_follow_up - Release balance gate and canal loop follow-up
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Simulation balance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add a small release balance gate so a release candidate fails before shipping obvious simulation outliers.
- Address the known `circuit_canal_loop` gap-spread outlier with a circuit-scoped adjustment only.
- Keep the current chrono/Grand Prix engine alignment intact and avoid new replay interpretation logic.

# Context
- The chrono v2 balance closeout left the repo clean and green, but its final bounded run still showed `circuit_canal_loop` at 43.71s average gap spread and 30.14% gap percentage.
- The other sampled circuits in the same final run were much tighter: `docklands` 15.88s / 12.31%, `harbor` 15.41s / 11.83%, and `left_bank` 10.35s / 8.10%.
- The previous task intentionally avoided circuit catalogue edits, so this follow-up should isolate the circuit correction instead of retuning global simulation behavior.
- Release readiness currently relies on local command memory and broad CI checks; balance evidence should become a repeatable release gate.

# Acceptance criteria
- AC1: A repeatable balance gate command exists and fails on configurable circuit gap percentage or pit-strategy spread thresholds.
- AC2: `circuit_canal_loop` is remeasured with real circuit parameters, and any remaining fix is limited to circuit-scoped data only when the corrected evidence still shows a gap outlier.
- AC3: The change does not alter UI flow, API contracts, storage, release workflow structure, or the shared chrono/Grand Prix engine architecture.
- AC4: Validation covers the balance gate, targeted simulation tests, full typecheck/test/lint/build/e2e, Logics validation, and release status/plan checks before push/release.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `scripts/balance-simulations.ts`
- `packages/shared/src/domain/circuits.ts`
- `packages/shared/src/simulation/chronoRaceEngine.ts`
- `packages/shared/src/simulation/simulateRace.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-release.yml`

# AI Context
- Summary: Draft a bounded request for release balance gate and canal loop follow-up.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- none
- `item_263_release_balance_gate_and_canal_loop_follow_up`
