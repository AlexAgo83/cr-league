## req_019_harden_current_grand_prix_state_rules - Harden current Grand Prix state rules
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Gameplay rules
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Harden the current Grand Prix flow so invalid player actions cannot mutate state.
- Return clear API conflicts for resolving without a human directive, submitting after resolution, or resolving twice.
- Keep this focused on current-GP guards; no new league/inventory/season feature is introduced.

# Context
- The persisted league API and playable web flow already work on the happy path.
- Real PostgreSQL smoke testing exposed a previous empty-body issue, so state rules should also be verified in smoke.

# Acceptance criteria
- AC1: API rejects resolving the current Grand Prix before a human team submits a directive.
- AC2: API rejects submitting or replacing a directive after the Grand Prix is resolved.
- AC3: API rejects resolving the same Grand Prix twice.
- AC4: API returns clear 409 Conflict messages for rule violations.
- AC5: Web disables invalid submit/resolve actions based on current state and displays API error messages.
- AC6: API and web tests cover the guards.
- AC7: Real PostgreSQL smoke flow covers the happy path and post-resolution guards.
- AC8: Validation passes.
- AC9: No new league join, inventory, auth, or season feature is introduced.

# AC Traceability
- AC1 -> `task_020_harden_current_grand_prix_state_rules`. Proof: `resolveCurrentGrandPrix` requires a human decision.
- AC2 -> `task_020_harden_current_grand_prix_state_rules`. Proof: `submitDecision` rejects resolved Grand Prix.
- AC3 -> `task_020_harden_current_grand_prix_state_rules`. Proof: `resolveCurrentGrandPrix` rejects resolved Grand Prix.
- AC4 -> `task_020_harden_current_grand_prix_state_rules`. Proof: league routes map `LeagueRuleError` to 409 responses.
- AC5 -> `task_020_harden_current_grand_prix_state_rules`. Proof: `App.tsx` disables invalid actions and displays API messages.
- AC6 -> `task_020_harden_current_grand_prix_state_rules`. Proof: API and web tests updated.
- AC7 -> `task_020_harden_current_grand_prix_state_rules`. Proof: `smoke:league` passed against temporary PostgreSQL.
- AC8 -> `task_020_harden_current_grand_prix_state_rules`. Proof: validation commands passed.
- AC9 -> `task_020_harden_current_grand_prix_state_rules`. Proof: no new product feature added.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `task_016_add_minimal_league_persistence_api`
- `task_017_add_playable_demo_league_web_flow`
- `scripts/smoke-league-flow.ts`

# AI Context
- Summary: Harden current Grand Prix state transitions for persisted gameplay.
- Keywords: grand-prix, state-rules, conflict, smoke-test, persisted-flow
- Use when: Reviewing current GP submit/resolve guards.
- Skip when: Adding league join, inventory, auth, or multi-round season features.

# Backlog
- `item_025_harden_current_grand_prix_state_rules`
