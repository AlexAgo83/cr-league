## item_180_add_api_gated_opponent_config_reveal_and_a_comparison_view - Add API-gated opponent config reveal and a comparison view
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Competitive comparison
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Opponent setups are only abstract dot markers and never comparable numerically (audit cause C).
- The only opponent comparison is the winner's setup in the report; players cannot see what setups produced what results across the field.
- Revealing opponent plans naively would break pre-race uncertainty and must be enforced server-side, not just hidden in the client.

# Scope
- In:
  - Expose opponent configurations and results through the API only after the player's plan is locked and after the race, enforced at the trust boundary.
  - Build a readable side-by-side comparison view reachable from qualifying (post-lock) and the report (post-race).
  - Keep the view descriptive, legible without color alone, with EN/FR copy.
  - Add unit tests for the reveal-timing rule and the comparison view model.
- Out:
  - Revealing opponent plans before lock.
  - Any recommendation, best-setup ranking, or counter-strategy suggestion.
  - Any simulation, reward, or economy change.

# Acceptance criteria
- AC1: Opponent configs and results are viewable in a comparison after lock and after the race, and blocked before lock (API-enforced), covered by tests.
- AC2: The comparison is descriptive only, legible without color alone, with EN/FR copy.
- AC3: No simulation, reward, or economy change; existing flows still pass.
- AC4: Typecheck, test, build, lint, e2e, and logics:validate pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Opponent configs and results are viewable in a comparison after lock and after the race, and blocked before lock (API-enforced), covered by tests.
- request-AC2 -> This backlog slice. Proof: AC2: The comparison is descriptive only, legible without color alone, with EN/FR copy.
- request-AC3 -> This backlog slice. Proof: AC3: No simulation, reward, or economy change; existing flows still pass.
- request-AC4 -> This backlog slice. Proof: AC4: Typecheck, test, build, lint, e2e, and logics:validate pass.
- request-AC5 -> This backlog slice. Proof: AC4: Typecheck, test, build, lint, e2e, and logics:validate pass.
- request-AC6 -> This backlog slice. Proof: AC4: Typecheck, test, build, lint, e2e, and logics:validate pass.
- request-AC7 -> This backlog slice. Proof: AC4: Typecheck, test, build, lint, e2e, and logics:validate pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_046_opponent_configuration_comparison_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`
- Primary task(s): `task_083_orchestrate_opponent_config_comparison`

# AI Context
- Summary: Add API-gated opponent config reveal and a comparison view
- Keywords: scaffolded-backlog, add api-gated opponent config reveal and a comparison view, implementation-ready
- Use when: Implementing the scaffolded slice for Add API-gated opponent config reveal and a comparison view.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
