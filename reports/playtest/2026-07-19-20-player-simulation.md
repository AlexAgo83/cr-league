# 20 Player Simulated Playtest

- Date: 2026-07-19T01:13:44.391Z
- Players simulated: 20
- Leagues: 2
- Grand Prix per league: 3
- Browser coverage: not included; this is API workflow pressure only.

## Result
- PASS: all simulated players joined, qualified, submitted a plan, resolved races, bought cards when affordable, and advanced through the configured GP count.
- PASS: no backend rule error blocked the 20-player flow split across the product limit of 16 players per league.

## League Runs

### Auto Playtest 1784423614755 1
- Code: 055B18
- Human teams: 16
- Final leader: Final Lap (37 pts, 295 credits)

| GP | Winner | Podium | Decisions | Qualifying runs | Cards bought after GP |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Final Lap | Final Lap, Rain Desk, Red Sector | 16 | 80 | 16 |
| 2 | Grip Plus | Grip Plus, Apex Lab, Delta Box | 16 | 81 | 16 |
| 3 | Sector Zero | Sector Zero, Night Shift, Fast Bureau | 16 | 79 | 0 |

### Auto Playtest 1784423614875 2
- Code: 4F7FFD
- Human teams: 4
- Final leader: Urban Brake (62 pts, 345 credits)

| GP | Winner | Podium | Decisions | Qualifying runs | Cards bought after GP |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Urban Brake | Urban Brake, Hard Relay, Plan Fix | 4 | 21 | 4 |
| 2 | Soft Wall | Soft Wall, Plan Fix, Hard Relay | 4 | 19 | 4 |
| 3 | Urban Brake | Urban Brake, Soft Wall, Plan Fix | 4 | 20 | 0 |

## Follow-Up
- Run the browser checklist for visual-only items: animated highlights, report/replay shortcuts, empty-state images, and layout polish.
- Keep 20-player simulation split across multiple leagues unless the product limit changes above 16.
