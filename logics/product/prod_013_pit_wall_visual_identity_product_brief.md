## prod_013_pit_wall_visual_identity_product_brief - Pit Wall Visual Identity Product Brief
> Date: 2026-07-17
> Status: Proposed
> Related request: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
> Related backlog: `item_085_pit_wall_foundation_tokens_self_hosted_type_chamfer_utility`, `item_086_asphalt_pass_live_surfaces_cockpit_buttons_circuit_route`, `item_087_chalk_paper_pass_standings_race_report_garage_sheets`
> Related task: `task_043_orchestrate_the_pit_wall_visual_identity_rollout`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The Pit Wall identity replaces the recognizable AI-dashboard look with a night-racing visual language of its own: asphalt and chalk materials, one signal-orange accent, road-signage condensed type, and chamfered panel shapes. The identity makes the two worlds of the game legible at a glance — the live race on asphalt, the team paperwork on chalk paper — while keeping player team liveries as the only other source of color.

# Goals
- Give CR League a distinctive, ownable visual identity that no longer reads as a generic SaaS dashboard.
- Make the game's two modes — live racing and team paperwork — instantly distinguishable through material (asphalt vs chalk paper).
- Concentrate color meaning: one brand accent (signal orange), semantic green/blue only, team liveries as the sole free color input.
- Ship the identity as a CSS-first refactor with self-hosted open-license fonts and no new runtime dependencies.
- Keep the dark OSM city map as the hero of the live screens and stage it better with the new route treatment.

# Non-goals
- Do not redesign screen layouts, information architecture, or navigation.
- Do not restructure React components or introduce a styling framework.
- Do not change game rules, balance, API, or persistence.
- Do not add a light/dark theme toggle; the identity commits to its two fixed materials.
- Do not rebrand the name, logo mark beyond the type treatment, or produce marketing assets.

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
- Product back-reference: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
- Task back-reference: `task_043_orchestrate_the_pit_wall_visual_identity_rollout`
