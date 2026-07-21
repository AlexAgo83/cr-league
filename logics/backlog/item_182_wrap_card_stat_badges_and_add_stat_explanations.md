## item_182_wrap_card_stat_badges_and_add_stat_explanations - Wrap card stat badges and add stat explanations
> From version: 0.3.26
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 37%
> Complexity: Low
> Theme: Card readability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Card stat badges can feel squeezed in card cells and are not laid out with a default two-line allowance.
- A badge such as +Attack or -Endurance does not explain what the stat changes for the player.

# Scope
- In:
  - Adjust shared badge CSS so card badges wrap naturally and reserve two rows on Plan and Garage card cells.
  - Add native hover/focus explanatory text in CardStatBadges for Grip, Attack, and Endurance using existing i18n hints.
  - Keep the badge component shared across plan, inventory, shop, and detail surfaces.
- Out:
  - Building a custom tooltip component.
  - Changing card descriptors, strength bands, prices, or effects.
  - Changing non-card trait panels unless needed for consistency.

# Acceptance criteria
- AC1: Badge containers wrap to multiple rows without overflowing card cells.
- AC2: Plan and Garage card cells have enough reserved space for at least two badge rows.
- AC3: Trait badges expose the localized stat hint on hover and focus.
- AC4: Focused component or UI tests cover the new badge explanatory text.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Badge containers wrap to multiple rows without overflowing card cells.
- request-AC5 -> This backlog slice. Proof: AC2: Plan and Garage card cells have enough reserved space for at least two badge rows.
- request-AC6 -> This backlog slice. Proof: AC3: Trait badges expose the localized stat hint on hover and focus.
- request-AC7 -> This backlog slice. Proof: AC4: Focused component or UI tests cover the new badge explanatory text.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_047_race_weather_and_card_stat_readability_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`
- Primary task(s): `task_084_orchestrate_weather_and_card_stat_readability`

# AI Context
- Summary: Wrap card stat badges and add stat explanations
- Keywords: scaffolded-backlog, wrap card stat badges and add stat explanations, implementation-ready
- Use when: Implementing the scaffolded slice for Wrap card stat badges and add stat explanations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
