## item_184_make_bot_pit_strategy_react_to_circuit_identity - Make bot pit strategy react to circuit identity
> From version: 0.3.26
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: Bot strategy
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Bots currently show limited pit-stop variation because their setup templates are mostly fixed.
- Opponent comparison loses value if bots rarely expose different pit strategies.

# Scope
- In:
  - Derive default bot pit strategy from circuit traits, likely weather, archetype, and deterministic seed.
  - Keep bot choices deterministic and simple.
  - Record AI playtest evidence showing bot pit strategy mix after the change.
- Out:
  - Adding ML or a complex bot planning engine.
  - Making bots optimal or adaptive to hidden player intent.
  - Changing card economy values.

# Acceptance criteria
- AC1: AI playtest or focused tests show all three pit strategies appear in bot decisions across representative circuits.
- AC2: Same league/GP/team seed produces the same bot plan.
- AC3: Opponent configuration comparison remains valid after lock and after race.
- AC4: New baseline evidence is recorded before card economy is unblocked.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: AI playtest or focused tests show all three pit strategies appear in bot decisions across representative circuits.
- request-AC4 -> This backlog slice. Proof: AC2: Same league/GP/team seed produces the same bot plan.
- request-AC5 -> This backlog slice. Proof: AC3: Opponent configuration comparison remains valid after lock and after race.
- request-AC6 -> This backlog slice. Proof: AC4: New baseline evidence is recorded before card economy is unblocked.
- request-AC7 -> This backlog slice. Proof: AC4: New baseline evidence is recorded before card economy is unblocked.
- request-AC8 -> This backlog slice. Proof: AC4: New baseline evidence is recorded before card economy is unblocked.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_048_circuit_stat_differentiation_and_bot_strategy_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`
- Primary task(s): `task_085_orchestrate_circuit_stat_differentiation_and_bot_strategy`

# AI Context
- Summary: Make bot pit strategy react to circuit identity
- Keywords: scaffolded-backlog, make bot pit strategy react to circuit identity, implementation-ready
- Use when: Implementing the scaffolded slice for Make bot pit strategy react to circuit identity.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
