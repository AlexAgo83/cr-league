## prod_024_result_verdict_pass_product_brief - Result Verdict Pass Product Brief
> Date: 2026-07-20
> Status: Proposed
> Related request: `req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next`
> Related backlog: `item_144_deterministic_verdict_builder`, `item_145_verdict_block_in_the_race_report`
> Related task: `task_061_orchestrate_result_verdict_pass`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Roadmap patch 0.3.14: open every race report with a direct verdict — why the plan worked or failed and what to try next — derived from the data the report already receives, so players understand the outcome in seconds before reading phases, rewards, and key moments.

# Goals
- A player understands their race outcome within seconds of opening the report.
- The verdict is always grounded in the player's actual decisions and events, never generic.
- Verdict and recap cards always tell one coherent story.

# Non-goals
- Do not change the simulation output or adopt RaceResult.report.blocks.
- Do not redesign the report layout beyond inserting the verdict block.
- Do not touch the payoff panel, replay, or plan-screen guidance.
- Do not add per-opponent or league-wide verdicts.

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
- Product back-reference: `req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next`
- Task back-reference: `task_061_orchestrate_result_verdict_pass`
