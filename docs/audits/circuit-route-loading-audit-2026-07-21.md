# Circuit Route Loading Audit - 2026-07-21

## Measurement

Commands:

```sh
du -sk apps/web/src/app/circuitRoutes
wc -c apps/web/src/app/circuitRoutes/*.ts
npx esbuild apps/web/src/main.tsx --bundle --format=esm --splitting --outdir=/tmp/crl-route-measure --metafile=/tmp/crl-route-meta.json --platform=browser --jsx=automatic --loader:.woff=file --loader:.woff2=file --loader:.png=file --loader:.webp=file --loader:.svg=file '--external:/assets/*' --log-level=warning
npm run build -w @cr-league/web -- --sourcemap
```

Results:

- Route source directory: 316 KB on disk.
- Route module source bytes: 272,877 bytes across 25 modules and 7,226 lines.
- esbuild route bytes in JS outputs: 269,329 bytes.
- esbuild route chunk gzip size: 51,084 bytes.
- esbuild route share of JS outputs: 14.43%.
- Vite production index JS: 685,588 bytes, 194.08 KB gzip.
- Vite sourcemap route source share in the main index chunk: 272,877 of 1,257,948 source bytes, or 21.69%.

Largest route modules by source bytes:

- `circuit_vienna_ring_loop.ts`: 21,867 bytes.
- `circuit_mitte_dash.ts`: 19,243 bytes.
- `circuit_ring_sector.ts`: 17,934 bytes.
- `circuit_brussels_grand_place_loop.ts`: 17,594 bytes.
- `circuit_lisbon_baixa_loop.ts`: 17,562 bytes.

## Decision

Defer route lazy loading for now.

Threshold for shipping dynamic route loading: route geometry should exceed either 75 KB gzip in initial JS measurement or 30% of the production main JS sourcemap source share, or the circuit catalog should grow past 40 detailed route modules.

Current measurement is below that threshold. The data is meaningful, but the app still needs the current circuit route synchronously for the first Drive screen, chrono replay, GP replay, report shortcuts, and qualifying trace generation. Lazy-loading routes now would add loading/error state across several race-critical views for an estimated sub-75 KB gzip win.

## Follow-Up Trigger

Reopen lazy route loading when adding a large circuit batch, when the production main chunk grows past the current budget again, or when route geometry crosses the threshold above.
