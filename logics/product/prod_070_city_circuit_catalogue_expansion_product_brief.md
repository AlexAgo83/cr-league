## prod_070_city_circuit_catalogue_expansion_product_brief - City Circuit Catalogue Expansion Product Brief
> Date: 2026-07-26
> Status: Proposed
> Related request: `req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline`
> Related backlog: `item_289_generate_and_audit_the_20_real_street_route_files_via_the_osm_pipeline`, `item_290_author_identity_rows_with_generated_geometry_speed_profiles_and_balanced_dials`, `item_291_localize_the_new_circuits_and_pass_the_full_catalogue_gates`
> Related task: `task_119_orchestrate_the_twenty_new_circuits_expansion`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The league ships 26 real-street city circuits built through a reproducible OSM pipeline: routes are pulled from OpenStreetMap and audited for drivability, canonical geometry and per-corner speed profiles are generated from the route, and each circuit is balanced and localized. This request grows the catalogue to 46 by adding 20 new landmark loops across Europe, the Americas, Asia, and Oceania — strictly through that same pipeline, so realism and fairness are guaranteed by the existing generators and gates rather than by hand-tuning.

# Goals
- Grow the circuit roster from 26 to 46 with realistic, drivable street loops.
- Reuse the established generation/audit/balance pipeline end to end — no hand-drawn geometry.
- Keep every new circuit balanced, correctly paced, and fully localized.
- Broaden geographic and archetype variety (fast avenues, tight old towns, long waterfronts).

# Non-goals
- Do not change the CityCircuit data model or the circuit generation/audit/balance scripts' rules or thresholds.
- Do not author route points, geometry markers, or speed profiles by hand.
- Do not touch season-rotation logic; new circuits are picked up automatically.
- Do not add circuit artwork/thumbnails beyond the map's route rendering, or add circuits beyond the specified 20.

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
- Product back-reference: `req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline`
- Task back-reference: `task_119_orchestrate_the_twenty_new_circuits_expansion`
