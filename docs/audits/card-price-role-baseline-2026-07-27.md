# Card Price and Role Baseline - 2026-07-27

## Evidence
- Fresh replayability run: `npm run playtest:replayability`.
- Safety gate: `npm run balance:gate`.
- Long balance audit source: `docs/audits/balance-latest.json`.

## Replayability Baseline
- Seasons: 12.
- Grand Prix per season: 6.
- Agents: 14.
- Unique champions: 4.
- Unique finishing orders: 72 of 72 races.
- Comeback race rate: 97.22%.
- Close finish rate: 30.56%.
- Boring race rate: 0%.
- Dominance threshold: 25%.
- Top clusters: `aggressive/speed/mini_pack/soft_tires` at 19.44% wins and `aggressive/weather/mini_pack/soft_tires` at 18.06% wins.

Decision: no broad aggressive or mini-pack nerf is justified by this sample.

## Suspect Card Classification
| Card | Win % | Avg points | Next-card % | Avg credit margin | Classification |
| --- | ---: | ---: | ---: | ---: | --- |
| `pit_relay` | 5.07 | 8.09 | 32.19 | -67.28 | Confirmed weak at 180 credits |
| `hard_tires` | 6.17 | 8.16 | 33.98 | -66.66 | Confirmed weak at 180 credits |
| `defensive_order` | 6.39 | 8.43 | 35.20 | -66.21 | Inconclusive: weak long aggregate, strong in some reliability-heavy gate lanes |
| `fleet_sponsorship` | 3.46 | 6.66 | 100.00 | 42.56 | Acceptable economy tradeoff, not a sporting card |
| `soft_tires` | 9.99 | 11.03 | 33.22 | -64.76 | Acceptable situational attack card |
| `rain_mapping` | 9.81 | 10.17 | 34.21 | -65.11 | Acceptable situational weather card |

## Tuning Decision
Apply the smallest price-only fix:

- `pit_relay`: 180 -> 120 credits.
- `hard_tires`: 180 -> 120 credits.

No card effect, simulation formula, shop model, or UI surface changes are included. The two confirmed weak cards keep their current roles and become affordable at the same tier as other situational reliability/economy tools.
