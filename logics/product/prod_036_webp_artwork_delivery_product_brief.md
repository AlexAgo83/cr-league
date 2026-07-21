## prod_036_webp_artwork_delivery_product_brief - WebP Artwork Delivery Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_072_serve_large_web_artwork_as_webp`
> Related backlog: `item_170_convert_largest_artwork_assets_to_webp`
> Related task: `task_073_orchestrate_webp_artwork_conversion`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Serve CR League's largest remaining artwork in a lighter browser-native format so rich visuals remain without carrying avoidable PNG transfer cost.

# Goals
- Cut remaining large artwork payload without changing UI design.
- Use the existing public asset pipeline.
- Target only assets where WebP gives meaningful savings.
- Keep the implementation simple enough to maintain manually.

# Non-goals
- Do not introduce a full image CDN, responsive image service, or build-time image processing pipeline.
- Do not convert tiny sprites, flags, fonts, or car assets unless measurements justify it.
- Do not regenerate artwork content.
- Do not change layout, copy, or interaction behavior.

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `req_072_serve_large_web_artwork_as_webp`
- Task back-reference: `task_073_orchestrate_webp_artwork_conversion`
