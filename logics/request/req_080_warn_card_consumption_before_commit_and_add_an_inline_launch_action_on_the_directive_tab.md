## req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab - Warn card consumption before commit and add an inline launch action on the directive tab
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Low
> Theme: Plan commit clarity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Needs
- Tell the player, at the moment a card is attached to the race plan, that playing the card will consume it if the race is launched.
- Add a contextual launch/send action on the directive tab so the player can commit without switching tabs, reusing the existing primaryCommand.
- Keep a single source of truth for the launch action; do not duplicate or fork launch logic or create a second competing launch button.
- Support EN/FR copy and keep the plan UI compact.
- Change no simulation behavior, no card consumption rules, and no API contract.

# Context
- Cards are banked and consumed only when played; today that consumption is communicated only after the race in the garage summary, so a player can think cards are reusable equipment (audit cause).
- The plan screen has Plan / Chrono / GP subtabs; the directive tab (DirectivePanel) shows only the choice cards and has no launch button, while primaryCommand resolves the correct action (submit plan / launch GP / next GP) on the Stand view.
- This is a small readability and navigation fix with no model change; it is a post-0.3 gameplay/legibility carry-over, not part of the 0.4 performance theme.
- Care is needed not to multiply launch buttons or diverge from the existing primaryCommand behavior and gating.

# Acceptance criteria
- AC1: When a card is selected for the race plan, the plan UI states that the card will be consumed if the race is launched, before the player commits.
- AC2: The directive tab exposes a contextual launch/send action that calls the existing primaryCommand action and label, with no duplicated launch logic.
- AC3: The inline action respects the same enabled/locked/loading gating as the existing primary command; it does not create a divergent or second competing launch path.
- AC4: EN/FR copy is present for the consumption warning and the inline action.
- AC5: No simulation behavior, card consumption rule, reward, or API contract changes.
- AC6: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# AC Traceability
- AC1 -> `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`. Proof: the selected-card section renders `directive_card_consumption_warning` before plan commit, and the focused component test asserts the Rain Grip warning.
- AC2 -> `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`. Proof: `PlanView` threads the existing `primaryCommand` into `DirectivePanel`; the inline button calls the provided action and renders the provided label.
- AC3 -> `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`. Proof: the inline button reads `primaryCommand.disabled`, and tests assert the disabled state is preserved.
- AC4 -> `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`. Proof: `directive_card_consumption_warning` exists in `en.json` and `fr.json`; inline action labels reuse existing localized primary-command copy.
- AC5 -> `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`. Proof: no shared model, simulation, reward, consumption-rule, or API files changed.
- AC6 -> `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`. Proof: typecheck, lint, full unit tests, build, Playwright e2e, and Logics validation passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_044_plan_commit_clarity_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- docs/audits/AUDIT_CR_LEAGUE.md
- apps/web/src/features/PlanView.tsx
- apps/web/src/features/DirectivePanel.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/app/App.tsx
- apps/web/src/app/DriveView.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- Current diagnostic: card consumption is only surfaced after the race, in the garage summary (GarageView.tsx:189-191, garage_consumed / garage_no_card_consumed); nothing in the plan card selector warns that committing a card to the race consumes it.
- Current diagnostic: the directive editing tab renders DirectivePanel, which never receives primaryCommand, so there is no launch/send button on that tab; the primary action lives on the Stand (DriveView) view and the plan GP subtab, forcing a tab switch to act.
- Product decision (audit TICKET-05): warn before commit that a played card is consumed, and add a contextual launch/send action on the directive tab, reusing the existing primaryCommand rather than duplicating launch logic.

# AI Context
- Summary: Warn card consumption before commit and add an inline launch action on the directive tab
- Keywords: request-chain-scaffold, warn card consumption before commit and add an inline launch action on the directive tab, development-ready
- Use when: You need to implement or review the scaffolded workflow for Warn card consumption before commit and add an inline launch action on the directive tab.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`
