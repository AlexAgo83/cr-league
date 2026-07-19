# 20 Player Simulated Playtest

- Date: 2026-07-19T01:27:11.782Z
- Players simulated: 20
- Leagues: 2
- Grand Prix per league: 3
- Browser coverage: not included; this is API workflow pressure only.

## Result
- PASS: all simulated players joined, qualified, submitted a plan, resolved races, bought cards when affordable, and advanced through the configured GP count.
- PASS: no backend rule error blocked the 20-player flow split across the product limit of 16 players per league.

## League Runs

### Auto Playtest 1784424422043 1
- Code: 8F04F1
- Human teams: 16
- Final leader: Night Shift (43 pts, 360 credits)
- Final tail: Late Apex (0 pts, 340 credits), Turbo Mail (0 pts, 360 credits), Volt Union (0 pts, 310 credits)

| GP | Winner | Podium | Decisions | Qualifying runs | Cards bought after GP |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Delta Box | Delta Box, Red Sector, Pole Room | 16 | 80 | 16 |
| 2 | Clean Air | Clean Air, Night Shift, Grip Plus | 16 | 81 | 16 |
| 3 | Night Shift | Night Shift, Sector Zero, Fast Bureau | 16 | 79 | 0 |

### Auto Playtest 1784424422133 2
- Code: 97CC1A
- Human teams: 4
- Final leader: Soft Wall (62 pts, 345 credits)
- Final tail: Hard Relay (52 pts, 310 credits), Urban Brake (51 pts, 315 credits), Plan Fix (45 pts, 340 credits)

| GP | Winner | Podium | Decisions | Qualifying runs | Cards bought after GP |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Hard Relay | Hard Relay, Plan Fix, Urban Brake | 4 | 21 | 4 |
| 2 | Soft Wall | Soft Wall, Urban Brake, Hard Relay | 4 | 19 | 4 |
| 3 | Soft Wall | Soft Wall, Urban Brake, Plan Fix | 4 | 20 | 0 |

## Follow-Up
- Run the browser checklist for visual-only items: animated highlights, report/replay shortcuts, empty-state images, and layout polish.
- Keep 20-player simulation split across multiple leagues unless the product limit changes above 16.
