## req_028_improve_race_recap_readability - Improve race recap readability
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: After guidance and garage improvements, the resolved GP screen should better explain the player's result: what changed the race, how the submitted directive relates to the outcome, and what to consider before the next GP.
> Confidence: high
> Complexity: Medium
> Theme: Playtest UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the resolved GP screen explain the player's race more clearly: what mattered, what directive was played, and what to learn for the next GP.
- Keep the slice frontend-only and derived from existing race result, event, and decision data.

# Context
- Previous slices improved pre-GP guidance and between-GP garage comprehension.
- The remaining playtest weakness is post-GP understanding: the result screen needs to connect decisions, race moments, and next-step learning without building a visual replay engine yet.

# Acceptance criteria
- AC1: The resolved GP screen includes a race recap panel for the player.
- AC2: The recap explains the key difference, the player's directive, and a next-GP takeaway.
- AC3: The replay timeline prioritizes player and major events before ambience.
- AC4: Events visibly distinguish key events from track notes.
- AC5: English/French copy and tests cover the updated recap flow.

# AC Traceability
- AC1 -> `task_029_improve_race_recap_readability`. Proof: `recap-panel` in `apps/web/src/app/App.tsx`.
- AC2 -> `task_029_improve_race_recap_readability`. Proof: `result_difference`, `result_your_directive`, and `result_next_lesson` sections.
- AC3 -> `task_029_improve_race_recap_readability`. Proof: result timeline combines `playerEvents`, `majorEvents`, then `ambienceEvents`.
- AC4 -> `task_029_improve_race_recap_readability`. Proof: `event_major`/`event_ambience` labels and `player-event` styling.
- AC5 -> `task_029_improve_race_recap_readability`. Proof: EN/FR keys, Vitest assertions, and Playwright assertions.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Draft a bounded request for improve race recap readability.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Scope boundaries
- In: race recap panel, directive summary, next-GP lesson copy, prioritized timeline ordering, key/ambience labels, tests, docs.
- Out: new simulation events, backend report schema changes, visual circuit replay, deep analytics.

# Backlog
- `item_034_improve_race_recap_readability`
