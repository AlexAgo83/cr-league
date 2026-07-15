## item_055_add_placeholder_interpolation_to_the_i18n_layer - Add placeholder interpolation to the i18n layer
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 50%
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
