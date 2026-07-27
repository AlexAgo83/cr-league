# Circuit Generation

CR League circuits should be based on real street geometry. Do not hand-draw fake loops when adding production circuits.

## Tools

The repo has two circuit tools:

```bash
npm run generate:circuit -- --place "Montreal" --layoutKey circuit_montreal_island_loop
npm run audit:circuits
npm run review:circuits:water
```

`generate:circuit` uses:

- Nominatim for place geocoding.
- Overpass API for OpenStreetMap street graphs.
- Optional OSRM routing with `--provider osrm`.
- Optional direct OSM way import with `--osmWayId`.

Overpass endpoints are tried in order unless `--overpassUrl` is provided.

## Street Rules

Use real roads, but the game route model is not traffic law:

- Ignore one-way restrictions.
- Allow route direction to be chosen for gameplay readability.
- Do not require roads to be currently open to normal traffic if they are plausible event roads.
- Prefer actual mapped streets, service roads, raceways, bridges, and waterfront roads.
- Do not use pedestrian/cycle/path geometry unless explicitly needed with `--walkways true`.
- Avoid fake straight-line joins. Every segment should follow OSM geometry.

Quality rules:

- Closed loop, closure gap under 120m.
- No self-crossing route unless the real road grade separation is intentional and visually readable.
- No direct U-turns.
- No meaningful repeated segment in the same direction.
- No meaningful reverse reuse.
- No suspicious segment over 250m after compacting points.
- Avoid tiny routes that need excessive laps. Prefer roughly 5km to 8km for new city loops.
- Target race distance should stay near the catalogue band, usually with 5 to 12 laps.
- Update both `laps` and `trackLengthMeters` in `packages/shared/src/domain/circuits.ts`.
- The numeric audit is not enough. Always inspect the route over OSM tiles before accepting it.
- Reject routes that appear to run on water, harbor basins, piers without a mapped road, parks, or building blocks.
- If the generated graph loop hugs coastlines or harbor geometry, reject it even when it technically follows OSM ways. Use a stricter road class or an OSRM driving route through hand-picked urban waypoints.

## Generation Flow

1. Pick a real city area with a plausible loop.
2. Generate candidates from the OSM graph:

```bash
npm run generate:circuit -- \
  --place "Montreal" \
  --layoutKey circuit_montreal_island_loop \
  --targetKm 4.2 \
  --minKm 2.6 \
  --maxKm 8 \
  --candidates 240
```

3. If Overpass struggles, try a smaller radius or another endpoint:

```bash
npm run generate:circuit -- \
  --place "Montreal" \
  --layoutKey circuit_montreal_island_loop \
  --radiusMeters 2400 \
  --overpassUrl https://overpass.kumi.systems/api/interpreter
```

4. If you know the real OSM way, import it directly:

```bash
npm run generate:circuit -- \
  --osmWayId 123456789 \
  --layoutKey circuit_city_real_loop \
  --laps 8
```

5. Write the route only after the console summary is valid:

```bash
npm run generate:circuit -- \
  --place "Montreal" \
  --layoutKey circuit_montreal_island_loop \
  --targetKm 4.2 \
  --laps 12 \
  --write-index 1
```

6. Add or update the circuit identity in `packages/shared/src/domain/circuits.ts` if it is a new layout.
7. Import/export the route module under `apps/web/src/app/circuitRoutes`.
8. Run:

```bash
npm run audit:circuits
npm run review:circuits:water
npm run typecheck
```

`review:circuits:water` creates an OSM screenshot contact sheet in `reports/circuit-water-review.png`. By default it selects water-adjacent or suspicious circuits. Use `-- --all` for the full catalogue, or `-- --only circuit_tokyo_bay_loop,circuit_cape_town_waterfront_loop` for a targeted review.

## Tokyo Reference Fix

Tokyo is the reference failure case. The old Tokyo route was only 2.4km and needed 20 laps, which made it feel like a small fake loop even though the audit thresholds passed.

The replacement was generated around Ariake/Odaiba:

```bash
npm run generate:circuit -- \
  --lat 35.6305 \
  --lng 139.7850 \
  --place "Tokyo Ariake Odaiba" \
  --layoutKey circuit_tokyo_bay_loop \
  --targetKm 6.2 \
  --minKm 5 \
  --maxKm 8 \
  --candidates 80 \
  --radiusMeters 1900 \
  --quiet true
```

Accepted summary:

```text
5.72km 146pts 19turns 0cross 0uturn 0m reverse 0m repeat
```

Then it was written with 9 laps:

```bash
npm run generate:circuit -- \
  --lat 35.6305 \
  --lng 139.7850 \
  --place "Tokyo Ariake Odaiba" \
  --layoutKey circuit_tokyo_bay_loop \
  --targetKm 6.2 \
  --minKm 5 \
  --maxKm 8 \
  --candidates 80 \
  --radiusMeters 1900 \
  --quiet true \
  --write-index 1 \
  --laps 9
```

For similar fixes, reject outputs that pass the audit but still have:

- route length under 4km for a global city circuit;
- more than 14 laps to reach normal GP distance;
- sparse point counts that look like a polygon instead of a street route;
- long straight joins that do not follow visible OSM roads;
- metadata length that no longer matches the generated route.

## Cape Town Reference Fix

Cape Town is the visual-audit failure case. The old routes passed numeric audit, but they were waterfront/coastal loops that visually drifted into water or harbor geometry instead of reading as proper street circuits.

Use an inland city-grid loop:

```bash
npm run generate:circuit -- \
  --lat -33.9250 \
  --lng 18.4190 \
  --place "Cape Town City Centre grid" \
  --layoutKey circuit_cape_town_waterfront_loop \
  --targetKm 5.5 \
  --minKm 4.5 \
  --maxKm 7.5 \
  --candidates 28 \
  --radiusMeters 1050 \
  --quiet true \
  --write-index 1 \
  --laps 9
```

Reject any candidate that still uses Beach Road or any coastal/waterfront edge as the main circuit boundary.

Accepted replacement:

```text
5.37km 175pts 17turns 0cross 0uturn 0m reverse 0m repeat
```

Metadata:

```text
trackLengthMeters: 5373
laps: 9
```

Visual acceptance for Cape Town:

- route follows visible urban roads around City Centre, Foreshore, and Bo-Kaap;
- no segment floats in the ocean or harbor basin;
- do not use Beach Road, the promenade, or Waterfront piers as the main loop;
- coastal sections are allowed only if they are short connectors on visible mapped roads.

## 0.5 Extra Circuit Wave

Accepted 2026-07-27 batch:

| Layout | City | Length | Laps |
| --- | --- | ---: | ---: |
| `circuit_kyoto_neon_loop` | Kyoto | 5587m | 9 |
| `circuit_reykjavik_harbor_sprint` | Reykjavik | 4673m | 11 |
| `circuit_marrakech_heat_ring` | Marrakech | 5714m | 9 |
| `circuit_vancouver_rainway` | Vancouver | 5486m | 9 |
| `circuit_lisbon_tramline` | Lisbon | 4951m | 10 |
| `circuit_singapore_dock_nights` | Singapore | 5798m | 9 |
| `circuit_cape_town_coast_run` | Cape Town | 5388m | 9 |
| `circuit_seoul_overpass_gp` | Seoul | 5412m | 9 |
| `circuit_buenos_aires_park` | Buenos Aires | 5508m | 9 |
| `circuit_helsinki_icebreak` | Helsinki | 5093m | 10 |
| `circuit_bastia_citadel_loop` | Bastia | 4773m | 11 |

Bastia needed the major-road graph around south Bastia/Furiani; the old-city center candidates did not produce a valid closed route.

## Africa and Oceania Circuit Wave

Accepted 2026-07-27 batch:

| Layout | City | Region | Length | Laps |
| --- | --- | --- | ---: | ---: |
| `circuit_auckland_viaduct_loop` | Auckland | Oceania | 5700m | 9 |
| `circuit_wellington_waterfront_wind` | Wellington | Oceania | 4437m | 11 |
| `circuit_melbourne_docklands_gp` | Melbourne | Oceania | 5104m | 10 |
| `circuit_brisbane_river_city` | Brisbane | Oceania | 4853m | 10 |
| `circuit_perth_swan_river_loop` | Perth | Oceania | 5731m | 9 |
| `circuit_cairo_nile_corniche` | Cairo | Africa | 5513m | 9 |
| `circuit_nairobi_uhuru_ring` | Nairobi | Africa | 7910m | 6 |
| `circuit_kigali_hillside_technical` | Kigali | Africa | 4916m | 10 |
| `circuit_dakar_corniche_ouest` | Dakar | Africa | 7811m | 6 |
| `circuit_tunis_carthage_coast` | Tunis | Africa | 5177m | 10 |
| `circuit_casablanca_atlantic_boulevard` | Casablanca | Africa | 5282m | 10 |
| `circuit_accra_independence_avenue` | Accra | Africa | 5457m | 9 |
| `circuit_addis_ababa_meskel_square` | Addis Ababa | Africa | 4987m | 10 |
| `circuit_lagos_victoria_island` | Lagos | Africa | 5142m | 10 |
| `circuit_maputo_baixa_waterfront` | Maputo | Africa | 5042m | 10 |

Melbourne, Perth, Kigali, Addis Ababa, and Lagos needed smaller or complete street graphs after broad Overpass attempts timed out. Tunis accepted a city-center route, so the visible name is `Tunis Avenue Sprint` rather than a Carthage coast label.

## Manual Review

After generation, visually inspect the route in the Circuits screen.

Reject the circuit if:

- It looks like a generic polygon instead of city streets.
- It cuts through blocks, water, parks, or buildings.
- The start line lands in an unreadable place.
- The pit marker is off-center or visually disconnected from the route.
- The route bounds are distorted or leave too much empty map space.

For a batch of circuits, export GeoJSON for inspection:

```bash
npm run audit:circuits -- --geojson reports/circuits.geojson
```

For water/coastline review, generate the OSM contact sheet:

```bash
npm run review:circuits:water
npm run review:circuits:water -- --all
```
