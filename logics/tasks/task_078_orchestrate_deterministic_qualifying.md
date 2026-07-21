## task_078_orchestrate_deterministic_qualifying - Orchestrate deterministic qualifying
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Trace createQualifyingRuns in apps/api/src/features/leagues/qualifying.ts and confirm the only non-deterministic inputs are the Math.random() variance (line 62) and the new Date() createdAt (line 66); confirm input.seed availability.
- [ ] 2. Introduce a seeded PRNG via createPrng from packages/shared keyed on seed+teamId+lap for the per-lap variance, keeping a comparable variance magnitude to the previous +/- 1.2s band.
- [ ] 3. Derive createdAt deterministically from state instead of new Date().
- [ ] 4. Add a unit test asserting identical inputs give identical output and different teams/attempts differ.
- [ ] 5. Run typecheck, test, build, lint, and logics:validate; record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_175_seed_qualifying_lap_time_variance_and_timestamp_deterministically`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate deterministic qualifying
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_077_make_qualifying_lap_times_deterministic_from_seed`
- Product brief(s): `prod_041_simulation_determinism_hardening_product_brief`
- Architecture decision(s): (none yet)
