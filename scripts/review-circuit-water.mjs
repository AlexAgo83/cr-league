#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const args = parseArgs(process.argv.slice(2));
const identitiesPath = args.identities ?? "packages/shared/src/domain/circuits.ts";
const routesDir = args.routesDir ?? "apps/web/src/app/circuitRoutes";
const output = args.output ?? "reports/circuit-water-review.png";
const htmlOutput = args.html ?? output.replace(/\.png$/i, ".html");
const mode = args.all === "true" ? "all" : "suspects";
const only = args.only ? new Set(args.only.split(",").map((value) => value.trim()).filter(Boolean)) : null;

const identities = parseIdentities(readFileSync(identitiesPath, "utf8"));
const circuits = identities
  .map((identity) => ({ ...identity, points: parsePoints(readFileSync(join(routesDir, `${identity.layoutKey}.ts`), "utf8")) }))
  .map((circuit) => ({ ...circuit, routeLengthMeters: routeLength(circuit.points), reasons: suspectReasons(circuit) }))
  .filter((circuit) => only?.has(circuit.layoutKey) || only?.has(circuit.city) || (only ? false : mode === "all" || circuit.reasons.length));

if (!circuits.length) {
  console.log("No circuits selected for water review.");
  process.exit(0);
}

mkdirSync(dirname(output), { recursive: true });
mkdirSync(dirname(htmlOutput), { recursive: true });
writeFileSync(htmlOutput, reviewHtml(circuits));

const rows = Math.ceil(circuits.length / 2);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1300, height: Math.max(460, rows * 430 + 20) }, deviceScaleFactor: 1 });
await page.goto(`file://${process.cwd()}/${htmlOutput}`, { waitUntil: "networkidle" });
await page.screenshot({ path: output, fullPage: true });
await browser.close();

console.log(`Circuit water review written to ${output}`);
console.log(`HTML written to ${htmlOutput}`);
for (const circuit of circuits) {
  console.log(`${circuit.city}/${circuit.layoutKey}: ${(circuit.routeLengthMeters / 1000).toFixed(2)}km, ${circuit.laps} laps, ${circuit.reasons.join(", ") || "selected"}`);
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : "true";
    if (parsed[key] === next) index += 1;
  }
  return parsed;
}

function parseIdentities(source) {
  const pattern =
    /\{\s*city:\s*"(?<city>[^"]+)",\s*country:\s*"(?<country>[^"]+)",\s*layoutKey:\s*"(?<layoutKey>[^"]+)",\s*laps:\s*(?<laps>\d+),\s*trackLengthMeters:\s*(?<trackLengthMeters>\d+),[\s\S]*?likelyWeather:\s*"(?<weather>[^"]+)"\s*\}/g;
  return [...source.matchAll(pattern)].map((match) => ({
    city: match.groups.city,
    country: match.groups.country,
    layoutKey: match.groups.layoutKey,
    laps: Number(match.groups.laps),
    trackLengthMeters: Number(match.groups.trackLengthMeters)
  }));
}

function parsePoints(source) {
  return [...source.matchAll(/\{\s*lat:\s*(-?\d+(?:\.\d+)?),\s*lng:\s*(-?\d+(?:\.\d+)?)\s*\}/g)].map(([, lat, lng]) => ({
    lat: Number(lat),
    lng: Number(lng)
  }));
}

function suspectReasons(circuit) {
  const label = `${circuit.city} ${circuit.layoutKey}`.toLowerCase();
  const reasons = [];
  if (/(harbor|harbour|waterfront|dock|bay|canal|thames|bosphorus|island|flamengo|river|tiber|vltava)/.test(label)) reasons.push("water-adjacent name");
  if (circuit.routeLengthMeters < 4_000 && circuit.laps > 12) reasons.push("tiny route / many laps");
  if (circuit.trackLengthMeters && Math.abs(circuit.trackLengthMeters - circuit.routeLengthMeters) / circuit.routeLengthMeters > 0.12) reasons.push("metadata length drift");
  return reasons;
}

function routeLength(points) {
  return points.slice(0, -1).reduce((sum, point, index) => sum + distanceMeters(point, points[index + 1]), 0);
}

function distanceMeters(left, right) {
  const metersPerLng = 111_320 * Math.cos((((left.lat + right.lat) / 2) * Math.PI) / 180);
  return Math.hypot((left.lng - right.lng) * metersPerLng, (left.lat - right.lat) * 111_320);
}

function reviewHtml(circuits) {
  const payload = JSON.stringify(circuits.map((circuit) => ({
    title: `${circuit.city} / ${circuit.layoutKey}`,
    detail: `${(circuit.routeLengthMeters / 1000).toFixed(2)}km route · ${circuit.laps} laps · ${(circuit.routeLengthMeters * circuit.laps / 1000).toFixed(1)}km GP · ${circuit.reasons.join(" · ")}`,
    points: circuit.points.map((point) => [point.lat, point.lng])
  })));
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>CR League circuit water review</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    body { margin: 0; background: #111827; color: #fff; font: 13px system-ui, sans-serif; }
    .grid { display: grid; grid-template-columns: repeat(2, 640px); gap: 10px; padding: 10px; }
    .card { position: relative; width: 640px; height: 420px; background: #0f172a; overflow: hidden; }
    .map { width: 100%; height: 100%; }
    .title { position: absolute; z-index: 999; left: 8px; top: 8px; max-width: 600px; background: #111827; color: #fff; padding: 5px 8px; border-radius: 4px; box-shadow: 0 2px 10px rgb(0 0 0 / 35%); }
    .title strong { display: block; font-size: 13px; }
    .title span { display: block; color: #fde68a; font-size: 12px; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="grid">${circuits.map((_, index) => `<section class="card"><div class="title" id="t${index}"></div><div class="map" id="m${index}"></div></section>`).join("")}</div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const circuits = ${payload};
    circuits.forEach((circuit, index) => {
      document.getElementById("t" + index).innerHTML = "<strong>" + circuit.title + "</strong><span>" + circuit.detail + "</span>";
      const map = L.map("m" + index, { zoomControl: false, attributionControl: false }).fitBounds(circuit.points, { padding: [24, 24] });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.polyline(circuit.points, { color: "#facc15", weight: 5, opacity: 0.95 }).addTo(map);
      L.polyline(circuit.points, { color: "#111827", weight: 1.5, opacity: 0.95 }).addTo(map);
    });
  </script>
</body>
</html>
`;
}
