## prod_035_web_stylesheet_modularization_product_brief - Web Stylesheet Modularization Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_071_modularize_the_large_web_layout_stylesheet`
> Related backlog: `item_169_extract_feature_css_from_layout_css`
> Related task: `task_072_orchestrate_web_stylesheet_modularization`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Split CR League's large monolithic web stylesheet into maintainable feature files while preserving the current UI and preparing the codebase for later route-level CSS loading.

# Goals
- Reduce the blast radius of CSS edits.
- Make feature styles discoverable by area.
- Keep the visual design stable during extraction.
- Create a simple import structure that supports future lazy-loaded CSS.

# Non-goals
- Do not redesign the UI or rename class names unless required for a conflict.
- Do not adopt CSS modules, CSS-in-JS, Sass, Tailwind, or another styling framework.
- Do not chase tiny gzip wins at the cost of risky selectors.
- Do not change user-facing copy or application behavior.

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
- Product back-reference: `req_071_modularize_the_large_web_layout_stylesheet`
- Task back-reference: `task_072_orchestrate_web_stylesheet_modularization`
