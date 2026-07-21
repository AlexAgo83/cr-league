## item_183_make_circuit_traits_force_distinct_setup_tradeoffs - Make circuit traits force distinct setup tradeoffs
> From version: 0.3.26
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: Circuit identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current stat model does not make circuit identity strong enough to force different player configurations.
- If setups do not diverge by circuit, card economy tuning will rebalance around the wrong game.

# Scope
- In:
  - Adjust simulation trait weighting so Grip, Attack, and Endurance create distinct setup pressures.
  - Add representative deterministic tests around circuit trait extremes and pit strategy outcomes.
  - Update Plan risk/readability derivation if the changed stat pressures make existing hints inaccurate.
- Out:
  - Changing card prices or card effects.
  - Adding new stats.
  - Changing replay choreography except where test expectations follow changed race outcomes.

# Acceptance criteria
- AC1: Tests demonstrate distinct winners or expected advantages across Grip, Attack, and Endurance circuit scenarios.
- AC2: The same seed remains deterministic after stat weighting changes.
- AC3: Plan risk/readability still points at the relevant setup pressure.
- AC4: Balance smoke and full gates pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Tests demonstrate distinct winners or expected advantages across Grip, Attack, and Endurance circuit scenarios.
- request-AC2 -> This backlog slice. Proof: AC2: The same seed remains deterministic after stat weighting changes.
- request-AC4 -> This backlog slice. Proof: AC3: Plan risk/readability still points at the relevant setup pressure.
- request-AC5 -> This backlog slice. Proof: AC4: Balance smoke and full gates pass.
- request-AC6 -> This backlog slice. Proof: AC4: Balance smoke and full gates pass.
- request-AC8 -> This backlog slice. Proof: AC4: Balance smoke and full gates pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_048_circuit_stat_differentiation_and_bot_strategy_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`
- Primary task(s): `task_085_orchestrate_circuit_stat_differentiation_and_bot_strategy`

# AI Context
- Summary: Make circuit traits force distinct setup tradeoffs
- Keywords: scaffolded-backlog, make circuit traits force distinct setup tradeoffs, implementation-ready
- Use when: Implementing the scaffolded slice for Make circuit traits force distinct setup tradeoffs.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
