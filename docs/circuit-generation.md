# Circuit Generation

CR League circuits should be based on real street geometry. Do not hand-draw fake loops when adding production circuits.

## Tools

The repo has two circuit tools:

```bash
npm run generate:circuit -- --place "Montreal" --layoutKey circuit_montreal_island_loop
npm run audit:circuits
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
npm run typecheck
```

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
