## prod_048_circuit_stat_differentiation_and_bot_strategy_product_brief - Circuit Stat Differentiation And Bot Strategy Product Brief
> Date: 2026-07-21
> Status: Settled
> Related request: `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`
> Related backlog: `item_183_make_circuit_traits_force_distinct_setup_tradeoffs`, `item_184_make_bot_pit_strategy_react_to_circuit_identity`
> Related task: `task_085_orchestrate_circuit_stat_differentiation_and_bot_strategy`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.
> Confidence: 90

# Overview
Make circuit identity drive real configuration choices: Grip, Attack, and Endurance should change the best setup, bots should react to those traits, and the resulting baseline should unblock card economy work.

```mermaid
flowchart LR
  Traits[Grip Attack Endurance] --> Pressure[Distinct setup pressure]
  Pressure --> Bots[Adaptive deterministic bot plans]
  Bots --> Baseline[Fresh balance and AI baseline]
  Baseline --> Cards[Unblock card economy rebalance]
```

# Goals
- Make configuration changes feel causally meaningful by circuit.
- Make pit strategy choices matter differently on different tracks.
- Give bots enough deterministic variation to make opponent plans worth comparing.
- Create a fresh measured baseline for the blocked card economy rebalance.

# Non-goals
- Do not rebalance card prices or card effects in this request.
- Do not add random non-deterministic bot behavior.
- Do not add new circuit traits or rename the current Grip, Attack, and Endurance vocabulary.
- Do not redesign the Plan UI beyond copy updates needed for honesty.

# Scope and guardrails
- In: simulation trait weighting, deterministic bot setup/pit variation, Plan-risk honesty checks, and new balance/playtest baseline evidence.
- Out: card price/effect rebalance, new card families, non-deterministic bot behavior, and stat renaming.

# Key product decisions
- Force circuit traits to matter enough that changing approach, preparation, and pit strategy has visible value.
- Keep bot strategy simple and deterministic; vary by circuit identity, weather, archetype, and seed instead of adding a planning engine.
- Treat this as the prerequisite for `req_081`, not a parallel tuning branch.

# Success signals
- Tests show different setup families favored on Grip, Attack, and Endurance scenarios.
- AI playtest shows all three pit strategies appearing in bot plans across representative circuits.
- The resulting balance/playtest evidence is strong enough to unblock the card economy rebalance.

# References
- Product back-reference: `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`
- Task back-reference: `task_085_orchestrate_circuit_stat_differentiation_and_bot_strategy`
