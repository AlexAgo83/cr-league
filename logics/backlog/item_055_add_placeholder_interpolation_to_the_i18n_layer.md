## item_055_add_placeholder_interpolation_to_the_i18n_layer - Add placeholder interpolation to the i18n layer
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Localization plumbing
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- t() in apps/web/src/i18n/index.ts is a plain catalog lookup; copy cannot embed real values (segments, deltas, circuit names), which forces fixed generic sentences.

# Scope
- In:
  - Extend t()/tt with {placeholder} substitution from a params object; unknown placeholders render harmlessly (leave the token or empty) and are unit-tested.
  - Keep the TranslationKey type mechanism and existing call sites unchanged; params are an optional trailing argument.
  - Add a unit test covering substitution, missing params, and untouched legacy keys.
- Out:
  - Pluralization, gender, ICU MessageFormat, or a library.
  - Migrating existing keys that need no parameters.

# Acceptance criteria
- AC1: tt('key', {x: 1}) substitutes {x} in both locales; existing keys without placeholders behave exactly as before.
- AC2: The behavior is unit-tested including the missing-param edge.
- AC3: Typecheck and lint pass with the optional-params signature.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: tt('key', {x: 1}) substitutes {x} in both locales; existing keys without placeholders behave exactly as before.
- request-AC8 -> This backlog slice. Proof: AC2: The behavior is unit-tested including the missing-param edge.
- request-AC10 -> This backlog slice. Proof: AC3: Typecheck and lint pass with the optional-params signature.
- request-AC4 -> This backlog slice. Evidence needed: The 'difference' recap card shows the player's most impactful event (largest absolute positionDelta among the player's own events, with sensible fallbacks: player card trigger, then field-level weather shift with segment and new weather, then headline), phrased with the event's real data.
- request-AC5 -> This backlog slice. Evidence needed: The 'directive' recap card adds a computed verdict: preparation judged against resolved weather across segments, played card judged against its triggered events and their deltas, approach judged against final positionChange — each verdict phrased from parameterized templates in EN and FR.
- request-AC6 -> This backlog slice. Evidence needed: The 'next GP' lesson names the actual next round's circuit and its dominant trait or likely weather (via the deterministic rotation) and ties it to the main cause of the player's result this race; the card-attribution bug (rival cards counted via relatedTeamId) is fixed.
- request-AC7 -> This backlog slice. Evidence needed: Template variety: each recap card draws from at least three parameterized variants per outcome family, and the same variant does not repeat on consecutive GPs for the same card when alternatives exist.
- request-AC9 -> This backlog slice. Evidence needed: Unit tests cover the new recap helpers (difference selection, directive verdict, next-GP lesson) with fixture race results; affected existing tests are re-derived, not weakened.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_005_personalized_race_recap_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_034_personalized_race_recap`
- Primary task(s): `task_035_orchestrate_personalized_race_recap`

# AI Context
- Summary: Add placeholder interpolation to the i18n layer
- Keywords: scaffolded-backlog, add placeholder interpolation to the i18n layer, implementation-ready
- Use when: Implementing the scaffolded slice for Add placeholder interpolation to the i18n layer.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_035_orchestrate_personalized_race_recap`

# Notes
- Task `task_035_orchestrate_personalized_race_recap` was finished via `logics-manager flow finish task` on 2026-07-15.
