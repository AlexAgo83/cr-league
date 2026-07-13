## spec_010_data_model_and_api_contract_v0 - Data Model and API Contract V0
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 85%
> Confidence: 75%
> Related request: `req_004_define_cr_league_implementation_contracts_v0`
> Related backlog: `item_010_define_cr_league_implementation_contracts_v0`
> Related task: `task_005_define_cr_league_implementation_contracts_v0`
> Related architecture: `adr_001_cr_league_v1_static_pwa_api_architecture`

# Purpose
Define the minimum database and API contract for the first CR League implementation wave.

This contract is solo-first but multiplayer-compatible.

# Database Target
- PostgreSQL.
- Prisma.
- Dedicated schema: `cr_league`.
- CUID or UUID string ids.
- Store race input and output clearly enough to replay and debug without re-running simulation.

# Entities
## Player
Represents a human or local prototype identity.

Fields:

- `id`
- `displayName`
- `kind`: `HUMAN` or `BOT`
- `createdAt`
- `updatedAt`

V0 note: no full auth fields yet.

## Team
The player's racing identity.

Fields:

- `id`
- `playerId`
- `name`
- `primaryColor`
- `secondaryColor`
- `credits`
- `createdAt`
- `updatedAt`

Constraints:

- team belongs to one player;
- team name unique per league later, not globally in V0.

## League
Championship container.

Fields:

- `id`
- `name`
- `mode`: `SOLO` or `PRIVATE`
- `inviteCode`
- `status`: `DRAFT`, `ACTIVE`, `COMPLETED`
- `cadence`: `MANUAL`, `DAILY`, `WEEKLY`
- `createdAt`
- `updatedAt`

V0:

- solo league only needs `MANUAL`;
- invite code can be nullable for solo.

## LeagueMember
Connects teams to leagues.

Fields:

- `id`
- `leagueId`
- `teamId`
- `slot`
- `role`: `OWNER`, `MEMBER`, `BOT`
- `createdAt`

Constraints:

- unique `(leagueId, teamId)`;
- unique `(leagueId, slot)`.

## Season
Fields:

- `id`
- `leagueId`
- `number`
- `status`: `ACTIVE`, `COMPLETED`
- `createdAt`
- `updatedAt`

V0 can create one season per league.

## GrandPrix
Fields:

- `id`
- `seasonId`
- `round`
- `name`
- `circuitKey`
- `primaryTrait`
- `secondaryTrait`
- `forecastJson`
- `scheduledAt`
- `status`: `SCHEDULED`, `LOCKED`, `RESOLVING`, `RESOLVED`
- `seed`
- `createdAt`
- `updatedAt`

Constraints:

- unique `(seasonId, round)`.

## RaceDecision
Fields:

- `id`
- `grandPrixId`
- `teamId`
- `approach`: `PRUDENT`, `BALANCED`, `AGGRESSIVE`
- `preparation`: `SPEED`, `RELIABILITY`, `WEATHER`
- `cardInventoryItemId`
- `rivalTeamId`
- `defaulted`
- `submittedAt`

Constraints:

- unique `(grandPrixId, teamId)`.

## RaceResult
One per Grand Prix.

Fields:

- `id`
- `grandPrixId`
- `seed`
- `resolvedWeatherJson`
- `classificationJson`
- `standingsAfterJson`
- `reportJson`
- `replayJson`
- `resolvedAt`

Constraints:

- unique `grandPrixId`.

## RaceEvent
Normalized event timeline row.

Fields:

- `id`
- `grandPrixId`
- `order`
- `segment`
- `lap`
- `type`
- `teamId`
- `relatedTeamId`
- `cardId`
- `severity`
- `positionDelta`
- `tagsJson`
- `replayText`
- `reportText`

Constraints:

- unique `(grandPrixId, order)`.

## CardDefinition
Static card catalogue persisted or seeded.

Fields:

- `id`
- `name`
- `family`
- `description`
- `price`
- `consumable`
- `enabled`

## CardInventoryItem
Fields:

- `id`
- `teamId`
- `cardDefinitionId`
- `status`: `AVAILABLE`, `RESERVED`, `CONSUMED`
- `acquiredAt`
- `consumedAt`

# API V0
All endpoints are under `/api`.

## POST /api/solo/championships
Creates a player, team, solo league, bots, season, calendar, starter cards, and initial standings.

Request:

```json
{
  "playerName": "Alice",
  "teamName": "Alice Racing",
  "primaryColor": "#e11d48",
  "secondaryColor": "#facc15"
}
```

Response:

```json
{
  "playerId": "player_...",
  "teamId": "team_...",
  "leagueId": "league_...",
  "seasonId": "season_...",
  "nextGrandPrixId": "gp_..."
}
```

## GET /api/leagues/:leagueId
Returns dashboard state.

Includes:

- league;
- teams;
- current standings;
- next Grand Prix;
- resolved recent result if any.

## GET /api/races/:grandPrixId/briefing
Returns player-facing race briefing.

Includes:

- circuit traits;
- forecast;
- standings;
- rival suggestion;
- available cards;
- existing decision if submitted.

## PUT /api/races/:grandPrixId/decision
Submits or replaces a decision before resolution.

Request:

```json
{
  "teamId": "team_...",
  "approach": "AGGRESSIVE",
  "preparation": "WEATHER",
  "cardInventoryItemId": "inv_...",
  "rivalTeamId": "team_rival"
}
```

Rules:

- reject if race is resolved;
- reject card not owned or unavailable;
- reserve selected card if needed;
- one decision per team per race.

## POST /api/races/:grandPrixId/resolve
Resolves a race idempotently.

Rules:

- if already resolved, return stored result;
- apply default decisions for missing teams;
- consume played cards only once;
- update credits and standings only once.

Response:

```json
{
  "grandPrixId": "gp_...",
  "resultId": "result_...",
  "classification": [],
  "events": [],
  "report": {},
  "standings": []
}
```

## GET /api/races/:grandPrixId/result
Returns stored race result and events.

## GET /api/teams/:teamId/inventory
Returns available cards and credits.

# Error Shape
Use a simple JSON error:

```json
{
  "error": "race_already_resolved",
  "message": "This Grand Prix has already been resolved."
}
```

# Idempotency
Race resolution must be transactionally safe.

Minimum approach:

- race status moves from `SCHEDULED` to `RESOLVING` inside a transaction;
- unique `RaceResult.grandPrixId` prevents duplicate results;
- card consumption checks status before update;
- credit/standing updates happen with result creation.

# Non-goals
- No full auth in V0.
- No private multiplayer join endpoints in the first slice.
- No admin endpoints.
- No public matchmaking.
- No complete Prisma schema tuning before first scaffold.

# Open Questions
- Should event rows be fully normalized or stored as JSON in `RaceResult` for the first scaffold?
- Should credits be a balance on `Team` or a ledger from day one?
- Should card definitions live only in shared code and be seeded to DB at startup?
