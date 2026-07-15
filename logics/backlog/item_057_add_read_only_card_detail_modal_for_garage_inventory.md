## item_057_add_read_only_card_detail_modal_for_garage_inventory - Add read-only card detail modal for garage inventory
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Garage card UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Inventory cards currently show only a compact row with badges and count.
- Players can inspect shop cards through a rich modal, but owned cards do not have the same consultation affordance.
- This creates inconsistent card understanding between cards the player can buy and cards the player already owns.

# Scope
- In:
  - Update `GarageView` so inventory card entries are rendered as clickable buttons when the player owns cards.
  - Track selected inventory card state separately from, or safely alongside, the current pending shop purchase state.
  - Reuse the existing shop-modal visual structure for card name, hint, fit, and stat badges.
  - Add a readonly modal mode or small helper inside `GarageView`; keep the change local unless extraction clearly reduces duplication.
  - Ensure inventory modal copy and aria labels are localized in EN and FR.
  - Add or update React tests in `App.test.tsx` to cover inventory consultation and shop purchase modal separation.
- Out:
  - Selling or consuming cards from inventory.
  - Changing card selection for directives.
  - Changing card recommendations or shop offer generation.
  - Changing the API, Prisma schema, or shared card economy constants.
  - Adding a global modal abstraction.

# Acceptance criteria
- AC1: Given the Garage inventory contains at least one owned card, clicking that card opens a modal with the localized card name and hint.
- AC2: The inventory modal contains the same stat badges used by the inventory row/shop modal.
- AC3: The inventory modal has a close control and closes through the overlay or close button.
- AC4: The inventory modal does not contain the buy confirmation button, price, or missing-credit copy.
- AC5: Clicking a shop card still opens the purchase modal with price and buy confirmation behavior.
- AC6: Empty inventory still renders the existing empty message and no card-detail modal trigger.
- AC7: `npm run typecheck` and `npm test -- apps/web/src/app/App.test.tsx` pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Given the Garage inventory contains at least one owned card, clicking that card opens a modal with the localized card name and hint.
- request-AC2 -> This backlog slice. Proof: AC2: The inventory modal contains the same stat badges used by the inventory row/shop modal.
- request-AC3 -> This backlog slice. Proof: AC3: The inventory modal has a close control and closes through the overlay or close button.
- request-AC4 -> This backlog slice. Proof: AC4: The inventory modal does not contain the buy confirmation button, price, or missing-credit copy.
- request-AC5 -> This backlog slice. Proof: AC5: Clicking a shop card still opens the purchase modal with price and buy confirmation behavior.
- request-AC6 -> This backlog slice. Proof: AC6: Empty inventory still renders the existing empty message and no card-detail modal trigger.
- request-AC7 -> This backlog slice. Proof: AC7: `npm run typecheck` and `npm test -- apps/web/src/app/App.test.tsx` pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_006_garage_inventory_card_consultation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_035_make_garage_inventory_cards_open_the_card_detail_modal`
- Primary task(s): `task_036_orchestrate_garage_inventory_card_consultation`

# AI Context
- Summary: Add read-only card detail modal for garage inventory
- Keywords: scaffolded-backlog, add read-only card detail modal for garage inventory, implementation-ready
- Use when: Implementing the scaffolded slice for Add read-only card detail modal for garage inventory.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
