## req_035_make_garage_inventory_cards_open_the_card_detail_modal - Make garage inventory cards open the card detail modal
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90
> Confidence: 85
> Complexity: Low
> Theme: Garage card UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make owned inventory cards clickable so players can inspect what a card does without going to the shop.
- Reuse the existing shop card detail modal presentation so card understanding is consistent between inventory and shop.
- Remove purchase-specific controls from the inventory consultation flow while preserving the shop purchase confirmation flow.
- Keep the implementation small: no new modal system, no new card data model, no new economy rules.

# Context
- `GarageView` currently renders inventory cards as list items with name, fit label, stat badges, and count.
- `GarageView` already has shop buttons that open a card detail purchase modal through `pendingBuyCardId`.
- The modal already shows card name, hint, price, fit, stat badges, affordability text, buy action, and close action.
- The desired change is a read-only version of that same modal for inventory cards: same card explanation and badges, no price/affordability/buy action.
- The implementation should preserve the existing Inventory/Shop segmented control and current card buying behavior.
- All visible copy must remain routed through the existing EN/FR i18n catalogs.
- Sequencing with sibling chains: coordinate with req_033 (over-engineering cleanup) — its item_053 extracts a LiveryPlate component in GarageView, so both chains edit GarageView.tsx; prefer running req_033 first. req_033 also explicitly rejected a generic Modal wrapper: this request must reuse the existing shop card modal pattern in place, not introduce a modal abstraction.

# Acceptance criteria
- AC1: In Garage Inventory, each owned card row/card is keyboard- and pointer-clickable and opens a card detail modal.
- AC2: The inventory detail modal reuses the same card explanation structure as the shop modal: card name, localized hint, fit label when available, and `CardStatBadges`.
- AC3: The inventory modal does not show price, missing-credit copy, purchase confirmation copy, or a buy button.
- AC4: The Shop modal keeps its current purchase behavior, including price display, affordability guard, buy confirmation action, close action, and loading disabled state.
- AC5: Empty inventory remains a non-clickable empty state.
- AC6: EN/FR visible copy is covered by existing keys or new catalog keys in both locales.
- AC7: Tests cover opening an inventory card modal and verify that no purchase action is shown there, while the shop modal still shows purchase controls.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_006_garage_inventory_card_consultation_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/specs/spec_002_card_set_v1.md
- logics/specs/spec_005_economy_v1.md
- logics/specs/spec_016_implementation_roadmap.md
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/CardStatBadges.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/app/App.test.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css
- User request: in Garage, inventory cards should be clickable for consultation with the same modal as shop cards, without the purchase section.

# AI Context
- Summary: Make garage inventory cards open the card detail modal
- Keywords: request-chain-scaffold, make garage inventory cards open the card detail modal, development-ready
- Use when: You need to implement or review the scaffolded workflow for Make garage inventory cards open the card detail modal.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_057_add_read_only_card_detail_modal_for_garage_inventory`
