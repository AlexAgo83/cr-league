## prod_086_solo_arcade_product_brief - Solo Arcade Product Brief
> Date: 2026-07-29
> Status: Proposed
> Related request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
> Related backlog: `item_356_produce_the_arcade_board_icons_and_hero`, `item_357_split_solo_into_campaign_and_arcade`, `item_358_enter_and_keep_the_destiny_wheel_participants`, `item_359_race_the_destiny_wheel_draw_and_show_the_order`
> Related task: `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Give Solo a second door: beside the campaign season, a catalogue of short games that use the racing the game already has for something other than a championship. The first one turns a race into a way to settle who goes first.

# Goals
- Name the existing solo play Campaign, and put it beside a second sub-mode rather than under it.
- Make the Arcade catalogue a place a second game can be added to cheaply.
- Turn the race into a draw between people, set up in seconds.
- Reuse the simulation and the replay as they are, rather than forking them.

# Non-goals
- No spinning wheel animation: the race is the draw.
- No colour or car picker per participant in this slice.
- No history of past draws, no scores, no arcade progression.
- No change to the campaign, to multiplayer, or to the race simulation itself.

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
- Product back-reference: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Task back-reference: `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`
