## spec_010_data_model_and_api_contract_v0 - Data Model and API Contract V0
> From version: 1.0.0
> Schema version: 1.0
> Status: Settled
> Understanding: 90
> Confidence: 92
> Related request: `req_004_define_cr_league_implementation_contracts_v0`
> Related backlog: `item_010_define_cr_league_implementation_contracts_v0`
> Related task: `task_005_define_cr_league_implementation_contracts_v0`
> Related architecture: `adr_001_cr_league_v1_static_pwa_api_architecture`

# Purpose
Define the minimum database and API contract for the first CR League implementation wave.

This contract is solo-first but multiplayer-compatible.

Current implementation note: the prototype has moved from the original solo endpoint sketch to a league-first API without an `/api` prefix. The Prisma schema also keeps some structures intentionally compact as JSON (`Team.cards`, `Team.livery`, `GrandPrix.forecast`, `GrandPrix.qualifyingRuns`, `GrandPrix.result`) instead of normalizing every V1 concept.

# Database Target
- PostgreSQL.
- Prisma.
- Dedicated schema: `cr_league`.
- CUID or UUID string ids.
- Store race input and output clearly enough to replay and debug without re-running simulation.

# Entities
## Profile
Represents a lightweight recoverable human account reference.

Fields:

- `id`
- `email`
- `recoveryCodeHash`
- `createdAt`
- `updatedAt`

V0 note: this is not full auth. The prototype uses a unique email and one recovery code so a player can recover the local account reference on another device.

## Team
A profile's racing identity inside one league.

Fields:

- `id`
- `leagueId`
- `profileId`, nullable for bots or legacy teams
- `name`
- `primaryColor`
- `secondaryColor`
- `credits`
- `createdAt`
- `updatedAt`

Constraints:

- a human team can belong to one profile;
- team name unique per league;
- team names are 3 to 32 readable characters.

## League
Championship container.

Fields:

- `id`
- `name`
- `code`
- `status`
- `cadence`
- `maxPlayers`
- `fillWithBots`
- `qualifyingAttemptLimit`
- `maxGrandPrixPerSeason`
- `preparationDeadlineAt`
- `createdAt`
- `updatedAt`

V0:

- solo league only needs `MANUAL`;
- invite code can be nullable for solo.

V0 does not have a separate `LeagueMember` or `Season` table. Team membership is represented by `Team.leagueId`; season number is stored on each `GrandPrix`.

## GrandPrix
Fields:

- `id`
- `leagueId`
- `season`
- `round`
- `name`
- `primaryTrait`
- `secondaryTrait`
- `forecast`
- `qualifyingRuns`
- `status`
- `result`
- `seed`
- `createdAt`
- `updatedAt`

Constraints:

- unique `(leagueId, season, round)`.

## RaceDecision
Fields:

- `id`
- `grandPrixId`
- `teamId`
- `approach`: `PRUDENT`, `BALANCED`, `AGGRESSIVE`
- `preparation`: `SPEED`, `RELIABILITY`, `WEATHER`
- `cardId`
- `rivalTeamId`
- `defaulted`
- `submittedAt`

Constraints:

- unique `(grandPrixId, teamId)`.

## Race Result, Events, Cards, And Livery
The current prototype stores these as JSON instead of separate tables:

- `GrandPrix.result`: classification, events, report, consumed cards, replay trace, rewards;
- `GrandPrix.qualifyingRuns`: lap-tagged qualifying attempts and replay data;
- `Team.cards`: owned card id array;
- `Team.livery`: primary/secondary colors.

This keeps the prototype small. Normalize later only if querying, auditing, or admin tooling needs it.

# API V0
The initial prototype currently exposes endpoints without an `/api` prefix.

## POST /profiles
Creates a lightweight profile and returns the one-time recovery code to save locally.

Request:

```json
{
  "email": "pilot@example.test"
}
```

Response:

```json
{
  "profile": {
    "id": "profile_...",
    "email": "pilot@example.test"
  },
  "recoveryCode": "ABCD1234",
  "teams": []
}
```

## POST /profiles/recover
Recovers the profile and returns its joined teams.

Request:

```json
{
  "email": "pilot@example.test",
  "recoveryCode": "ABCD1234"
}
```

Response:

```json
{
  "profile": {
    "id": "profile_...",
    "email": "pilot@example.test"
  },
  "teams": [
    {
      "leagueId": "league_...",
      "leagueName": "Office League",
      "leagueCode": "ABC123",
      "teamId": "team_...",
      "teamName": "Volt Union",
      "claimCode": "CLAIM123"
    }
  ]
}
```

## POST /leagues
Creates a league, the player's team, optional bots, the first Grand Prix, starter cards, and initial state.

Request:

```json
{
  "name": "Office League",
  "teamName": "Alice Racing",
  "profileId": "profile_...",
  "maxPlayers": 8,
  "fillWithBots": true,
  "qualifyingAttemptLimit": 3,
  "maxGrandPrixPerSeason": 6
}
```

Response: current `LeagueState`.

## POST /leagues/join
Joins an active league by code and creates a human team.

## POST /leagues/rejoin
Rejoins a saved team by `teamId` and `claimCode`.

## GET /leagues/:leagueId
Returns dashboard state.

Includes:

- league;
- teams;
- current standings;
- current Grand Prix;
- resolved recent result if any.
- card shop;
- action state.

## POST /leagues/:leagueId/settings
Updates cadence/deadline settings.

## POST /leagues/:leagueId/cards/buy
Buys one card for a team using credits.

## POST /leagues/:leagueId/teams/livery
Updates a team's livery colors.

## POST /leagues/:leagueId/teams/name
Updates a team name.

## POST /leagues/:leagueId/decisions
Submits a decision before resolution.

Request:

```json
{
  "teamId": "team_...",
  "approach": "aggressive",
  "preparation": "weather",
  "cardId": "rain_grip",
  "rivalTeamId": "team_rival"
}
```

Rules:

- reject if race is resolved;
- reject card not owned;
- one decision per team per race.
- reject further directive edits after lock.

## POST /leagues/:leagueId/qualifying
Runs one qualifying attempt with the current directive choices.

Rules:

- reject if directive is already submitted;
- reject if attempt limit is reached;
- qualifying cards can lock the card choice after use;
- returns updated `LeagueState`, the run, and whether it is the player's best.

## POST /leagues/:leagueId/resolve
Resolves the current Grand Prix idempotently.

Rules:

- if already resolved, return stored result;
- apply default decisions for missing teams;
- bots run at least one qualifying attempt before the race;
- consume played cards only once;
- update credits and standings only once.

Response: updated `LeagueState`.

## POST /leagues/:leagueId/next-grand-prix
Creates the next Grand Prix. If the current round reaches `maxGrandPrixPerSeason`, the next GP starts the next season at round 1.

## POST /leagues/:leagueId/restart
Resets the playtest league to season 1 / round 1 while keeping teams and profiles.

Rules:

- reject names outside 3 to 32 readable characters;
- reject duplicate names in the same league;
- return the updated league state.

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

- current Grand Prix status/result guards prevent duplicate resolution;
- unique `(leagueId, season, round)` prevents duplicate GP creation;
- card consumption checks the stored result path before update;
- credit/standing updates happen with result storage.

# Non-goals
- No password, OAuth, session-cookie, or permission model in V0.
- No admin endpoints.
- No public matchmaking.
- No complete normalization of replay/events/cards before playtest feedback proves the need.

# Resolved Questions
- `GrandPrix.result` JSON is enough for the prototype; event-row normalization waits for beta/support needs.
- Credits remain a `Team` balance for now; ledger support is deferred.
- Card definitions remain shared-code constants for the prototype.
- `GrandPrix.season` is enough for the current season rollover model.
