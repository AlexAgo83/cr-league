## item_171_add_lazy_defaults_to_assetimage - Add lazy defaults to AssetImage
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Image loading performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Artwork inside modals and secondary screens can be decoded or downloaded earlier than needed.
- If loading attributes are added manually per image, future call sites can easily miss the convention.
- A component-level default is the smallest maintainable fix.

# Scope
- In:
  - Inspect AssetImage props and all call sites before editing.
  - Add loading and decoding defaults to AssetImage.
  - Add a minimal priority/eager escape hatch if current first-screen images use AssetImage.
  - Update only call sites that must remain eager.
  - Add or update the smallest relevant test if the component has coverage.
- Out:
  - Adding a lazy-load polyfill.
  - Changing CSS background image behavior.
  - Converting images to WebP or resizing assets.

# Acceptance criteria
- AC1: Rendered non-priority AssetImage elements include loading="lazy" and decoding="async".
- AC2: Priority call sites can render loading="eager" when needed.
- AC3: Tests and build pass.

# Implementation notes
- `apps/web/src/features/AssetImage.tsx` defaults `loading` to `lazy` and `decoding` to `async` while preserving caller overrides.
- `apps/web/src/app/AppChrome.tsx` marks topbar brand images as eager because they are first-screen shell imagery.
- Existing decorative alt semantics are unchanged; ModalHero and secondary artwork keep inheriting `alt=""`.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Rendered non-priority AssetImage elements include loading="lazy" and decoding="async".
- request-AC2 -> This backlog slice. Proof: AC2: Priority call sites can render loading="eager" when needed.
- request-AC3 -> This backlog slice. Proof: AC3: Tests and build pass.
- request-AC4 -> This backlog slice. Proof: AC3: Tests and build pass.
- request-AC5 -> This backlog slice. Proof: AC3: Tests and build pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_037_lazy_artwork_loading_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_073_lazy_load_non_critical_web_artwork`
- Primary task(s): `task_074_orchestrate_lazy_artwork_loading`

# AI Context
- Summary: Add lazy defaults to AssetImage
- Keywords: scaffolded-backlog, add lazy defaults to assetimage, implementation-ready
- Use when: Implementing the scaffolded slice for Add lazy defaults to AssetImage.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_074_orchestrate_lazy_artwork_loading` was finished via `logics-manager flow finish task` on 2026-07-21.
