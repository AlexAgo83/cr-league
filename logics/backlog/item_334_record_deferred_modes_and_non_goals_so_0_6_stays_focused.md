## item_334_record_deferred_modes_and_non_goals_so_0_6_stays_focused - Record deferred modes and non-goals so 0.6 stays focused
> From version: 0.5.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Roadmap discipline
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: Added deferred-idea reopen triggers from owner follow-up; no status or implementation scope change.

# Problem
- Several ideas are valuable but explicitly not for the first 0.6 pass.
- Without a written defer list, future implementation agents may accidentally scope-creep the beta lifecycle corpus.
- The roadmap should preserve the user's direction for later arcade, quick play, objectives, onboarding, replay, and automation ideas.

# Scope
- In:
  - Update the roadmap and task closeout with explicit deferred concepts and reopen triggers.
  - Keep optional secondary objectives as a later non-mandatory idea.
  - Keep arcade solo and quick play matchmaking as later mode ideas, not public league work.
  - Keep automatic reminders, polling/SSE, compact replay/highlights, and tutorial rewrite out of this corpus unless the user changes direction.
  - Record the explicit reopen triggers for each deferred idea so future agents know what evidence is required before scaffolding it.
- Out:
  - Implementing any deferred mode.
  - Opening 1.0 hardening.
  - Changing release automation.

# Acceptance criteria
- AC1: Roadmap text names the deferred ideas and their reopen triggers.
- AC2: The 0.6 task report states which ideas were intentionally not implemented.
- AC3: Logics validation passes after the roadmap/doc update.

# Deferred Ideas and Reopen Triggers
- Optional secondary objectives: reopen only after beta players say non-winning success still lacks meaning after rival/action-feedback work.
- Arcade solo and quick play matchmaking: reopen only as separate modes after private beta proves the core loop and the user explicitly chooses a mode strategy.
- Onboarding/tutorial rewrite: reopen only if cold-start or beta observation shows the optimized current flow still fails.
- Compact replay/highlights: keep closed for now because the user rejected it; reopen only after repeated beta evidence that replay length blocks completion.
- Automatic reminders: keep closed; current direction is manual commissioner reminders only. Reopen only if manual reminders do not solve return behavior.
- Polling/SSE: reopen only if beta leagues repeatedly suffer stale readiness state that manual refresh/current freshness cannot cover.
- Bot replacement: reopen only if beta leagues stall from repeated absences after visible defaults and commissioner controls exist.
- 1.0 hardening: keep post-beta until the 0.6 season produces concrete release blockers.

# AC Traceability
- request-AC12 -> This backlog slice. Proof: AC1: Roadmap text names the deferred ideas and their reopen triggers.
- request-AC13 -> This backlog slice. Proof: AC2: The 0.6 task report states which ideas were intentionally not implemented.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Record deferred modes and non-goals so 0.6 stays focused
- Keywords: scaffolded-backlog, record deferred modes and non-goals so 0.6 stays focused, implementation-ready
- Use when: Implementing the scaffolded slice for Record deferred modes and non-goals so 0.6 stays focused.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
