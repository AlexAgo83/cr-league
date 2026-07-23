## spec_006_league_cadence_and_absence_rules - League Cadence and Absence Rules
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 83
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`
> Non-semantic edit: 2026-07-23 corpus grooming note added; spec remains Draft.
> Semantic edit: 2026-07-23 refreshed current status with active owner-team resilience follow-up in `req_099`.

# Purpose
Define how asynchronous leagues advance without stalling.

# Current Status
Keep this spec in Draft. Manual cadence, readiness, missing-player defaults, and league controls exist, and the recent hardening/canonical-track chains are Done. The active `req_099` owner-team resilience item must still ensure admin controls recover if the owner team is removed; automatic deadline resolution, reminders, and real asynchronous absence behavior are not validated yet.

# Cadence Model
Solo:

- player launches races manually;
- no waiting;
- bots submit instantly.

Private multiplayer:

- each Grand Prix has a preparation window;
- race resolves when all players are ready or the deadline passes;
- default cadence: weekly;
- league creator can choose faster cadences later.

# V1 League Settings
Expose only:

- league name;
- season length;
- cadence;
- bot fill on/off.

Hide advanced simulation parameters.

# Deadlines
Default:

- preparation opens after previous race report;
- deadline is next scheduled race time;
- all-ready state can resolve early if league setting allows it.

Recommendation:

- V1 multiplayer default should allow early resolution when all players are ready.
- Weekly leagues should still have a clear deadline to avoid waiting forever.

# Absence Rule
If a human player misses the deadline:

- use Balanced approach;
- use Reliability preparation;
- play no card;
- mark plan as defaulted;
- keep player eligible for normal points and credits;
- mention default in report privately or lightly in league activity.

Do not block the league.

Public league activity should use neutral wording, for example "Standard plan applied for Volt Union." The player's own report can explain the default in more detail.

# Joining And Leaving
V1 recommendation:

- players join before season start;
- late joiners can be added only between seasons;
- bots fill empty slots.

Later:

- allow replacement of bot by human mid-season if needed;
- allow a bot to cover an inactive human only after repeated absences, starting after two consecutive missed Grand Prix if beta leagues stall.

# Pause
V1 can skip pause controls if cadence is manual in early multiplayer tests.

If pause exists:

- league creator can pause next deadline;
- no race resolves while paused;
- pause reason is visible.

# Non-goals
- No public matchmaking.
- No complex commissioner tools.
- No notification system requirement in V1.
- No live synchronized race watch requirement.
- No mid-race intervention.

# Open Questions
- Should a league creator be able to force resolve manually?
- Should pause be needed for beta operations, or is force-resolve enough?
