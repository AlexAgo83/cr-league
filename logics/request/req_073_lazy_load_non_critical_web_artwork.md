## req_073_lazy_load_non_critical_web_artwork - Lazy-load non-critical web artwork
> From version: 0.3.26
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Avoid eager decoding/downloading of non-critical artwork that is below the fold, inside modals, or behind secondary workflows.
- Centralize image loading defaults so new artwork gets the correct behavior automatically.
- Keep first-screen hero imagery eager only where it is truly needed for perceived load quality.
- Preserve accessibility and alt behavior for decorative and informative images.

# Context
- The repo has an AssetImage component used by ModalHero and other artwork surfaces.
- Most ModalHero images are decorative and can use empty alt text with async decoding.
- Some first-screen backgrounds are CSS backgrounds and are not affected by img loading attributes.
- The implementation should be a small component-level change, not a new image-loading library.

# Acceptance criteria
- AC1: AssetImage defaults to lazy loading and async decoding for non-critical images.
- AC2: Callers can opt into eager loading for first-screen or priority images without duplicating component code.
- AC3: ModalHero and secondary artwork use lazy loading by default unless explicitly marked as priority.
- AC4: Existing alt text semantics are preserved and lint/a11y rules pass.
- AC5: Typecheck, lint, unit tests, build, and representative app flows pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_037_lazy_artwork_loading_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/features/AssetImage.tsx
- apps/web/src/features/ModalHero.tsx
- apps/web/src/app/OnboardingShell.tsx
- apps/web/src/app/AppModals.tsx
- apps/web/src/app/AppOverlays.tsx
- apps/web/src/features/GarageView.tsx
- Current diagnostic: many artwork images are mounted in modals, onboarding help, garage panels, or secondary views and are not critical to the initial app shell.
- Current diagnostic: lazy loading should be centralized in AssetImage where possible instead of repeating loading attributes at every call site.

# AI Context
- Summary: Lazy-load non-critical web artwork
- Keywords: request-chain-scaffold, lazy-load non-critical web artwork, development-ready
- Use when: You need to implement or review the scaffolded workflow for Lazy-load non-critical web artwork.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_171_add_lazy_defaults_to_assetimage`
