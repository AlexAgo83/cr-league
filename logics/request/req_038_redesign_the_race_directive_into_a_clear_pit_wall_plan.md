## req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan - Redesign the race directive into a clear pit wall plan
> From version: 0.1.0
> Schema version: 1.0
> Status: Draft
> Understanding: 94
> Confidence: 88
> Complexity: Medium
> Theme: Race directive clarity and immersion
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Transform the current Race directive form into a clear pit wall planning moment that tells the player what they are deciding and why it matters.
- Replace abstract dropdowns with decision controls that expose intent, consequence, and current selection at a glance.
- Make the relationship between the directive, qualifying attempts, the Grand Prix, the circuit traits, weather forecast, and garage card explicit without changing simulation rules.
- Explain the map trait indicators so Grip, Overtaking, and Energy become actionable race briefing inputs instead of unexplained numbers.
- Add an understandable dynamic plan summary so a new player can read back the strategy before locking it.
- Rename and restructure the primary command so the player understands that submitting the directive locks the race plan.
- Improve French and English copy for this surface so the core decision feels immersive and localized.
- Make the start of a Grand Prix day legible as one compact sequence: read the circuit, test a qualifying chrono, adjust the directive, lock the plan, then launch the GP.
- Clarify by replacing scattered explanatory text with current-step framing and state transitions, not by adding another permanent information panel.

# Context
- The current `DirectivePanel` is technically functional but presents the core Grand Prix decision as three generic form fields: Approach, Preparation, and Card.
- The current fields use `<select>` controls plus short hints. This is compact but too abstract for a first playtest: the tester did not understand what to do or what the choices changed.
- The app already computes useful signals that can be reused: selected card fit via `cardFit`, circuit traits via `currentCircuit.traits`, forecast via `forecastPick`, card stat badges, qualifying attempts left, and race state.
- The map already displays Grip, Overtaking, and Energy telemetry, but playtest feedback now shows the values are not self-explanatory: players need qualitative meaning and decision impact near the directive.
- The implementation should preserve existing API contracts and internal values: `approach` remains `prudent | balanced | aggressive`, `preparation` remains `speed | reliability | weather`, and `cardId` remains optional.
- The redesign should not add new race mechanics, new cards, new balance rules, a tutorial system, a component library, or broad routing changes.
- This is a conversion and comprehension fix. The smallest successful result is a richer, more legible decision surface backed by current simulation inputs and existing validation gates.
- The current beginning of a race day does not clearly tell the player where they have landed, what to do first, why chrono attempts matter, when the directive can still be adjusted, or when the plan becomes locked.
- The desired experience is a visible but lightweight flow: `Circuit briefing -> Directive tuning -> Qualifying chrono -> Plan locked -> Grand Prix`, with one current objective instead of several competing help blocks.

# Acceptance criteria
- AC1: The directive surface is renamed and framed as a pit wall race plan, not a generic form, in both English and French.
- AC2: Approach choices are shown as selectable decision cards or segmented controls with plain-language intent and consequence, while preserving existing internal values.
- AC3: Preparation choices are shown as selectable decision cards or segmented controls that explain which race condition they answer: pace, reliability, or weather.
- AC4: Garage card selection is visual and understandable: no card, owned cards, fit status, card stat badges, and a short reason are visible without opening a dropdown.
- AC5: A dynamic plan summary explains the selected approach, preparation, and card in one short race-strategy sentence before the player locks the plan.
- AC6: The primary command and confirmation copy make it clear that the directive locks the Grand Prix plan; qualifying remaining state remains visible before lock.
- AC7: The redesign is localized through `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json` with no new hardcoded user-facing copy in the redesigned surface.
- AC8: Existing create-league, qualifying, submit-directive, launch-GP, and replay flows continue to pass unit/e2e validation.
- AC9: Desktop and mobile layouts keep all directive controls readable, with no text overflow or overlapping controls.
- AC10: Grip, Overtaking, and Energy remain visible on the map, and the race planning surface explains each value's qualitative level, concrete race meaning, and likely directive/card tradeoff.
- AC11: The race-day start communicates the current phase and next action in a compact way covering circuit reading, chrono testing, directive adjustment, plan locking, and GP launch.
- AC12: The implementation reduces visible cognitive load by consolidating or replacing existing explanatory clutter; it does not add a new permanent tutorial panel.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- logics/specs/spec_016_implementation_roadmap.md
- logics/architecture/adr_005_theme_design_system.md
- logics/architecture/adr_006_accessibility.md
- logics/architecture/adr_007_i18n.md
- docs/playtest/private-league-3gp-checklist.md
- apps/web/src/features/DirectivePanel.tsx
- apps/web/src/app/App.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/app/types.ts
- apps/web/src/features/CardStatBadges.tsx
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css
- apps/web/src/app/App.test.tsx
- tests/e2e/private-league.spec.ts
- Playtest feedback: a tester was immediately lost by the current Race directive panel and did not understand what to do, what each choice meant, or why the moment mattered.

# AI Context
- Summary: Redesign the race directive into a clear pit wall plan
- Keywords: request-chain-scaffold, redesign the race directive into a clear pit wall plan, development-ready
- Use when: You need to implement or review the scaffolded workflow for Redesign the race directive into a clear pit wall plan.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_065_map_directive_choices_to_player_facing_race_plan_language`
- `item_066_replace_directive_dropdowns_with_decision_cards`
- `item_067_make_garage_card_selection_readable_inside_the_race_plan`
- `item_068_add_a_dynamic_pit_wall_plan_summary`
- `item_069_validate_directive_clarity_with_tests_and_screenshots`
- `item_070_explain_circuit_traits_as_actionable_race_briefing`
