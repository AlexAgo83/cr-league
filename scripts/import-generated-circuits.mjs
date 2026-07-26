#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = parseArgs(process.argv.slice(2));
const routesDir = args.routesDir ?? "apps/web/src/app/circuitRoutes";
const routeIndexPath = args.routeIndex ?? "apps/web/src/app/circuitRoutes/data.ts";
const identitiesPath = args.identities ?? "packages/shared/src/domain/circuits.ts";
const enPath = args.en ?? "apps/web/src/i18n/en.json";
const frPath = args.fr ?? "apps/web/src/i18n/fr.json";
const specs = readSpecs();

if (!specs.length) {
  die("Usage: node scripts/import-generated-circuits.mjs --spec circuits.json OR --json '[...]'");
}

let routeIndexSource = readFileSync(routeIndexPath, "utf8");
let identitiesSource = readFileSync(identitiesPath, "utf8");
const enMessages = JSON.parse(readFileSync(enPath, "utf8"));
const frMessages = JSON.parse(readFileSync(frPath, "utf8"));

for (const spec of specs) {
  validateSpec(spec);
  const points = parsePoints(readFileSync(join(routesDir, `${spec.layoutKey}.ts`), "utf8"));
  const markers = markersForRoute(points);
  const laps = Number(spec.laps ?? Math.max(3, Math.round(50_300 / markers.lengthMeters)));
  const identity = {
    city: spec.city,
    country: spec.country,
    layoutKey: spec.layoutKey,
    laps,
    trackLengthMeters: markers.lengthMeters,
    routeLengthMeters: markers.lengthMeters,
    mainStraightStartProgress: markers.mainStraightStartProgress,
    mainStraightEndProgress: markers.mainStraightEndProgress,
    startProgress: markers.startProgress,
    pitLaneProgress: markers.pitLaneProgress,
    traits: spec.traits,
    likelyWeather: spec.likelyWeather
  };

  routeIndexSource = upsertRouteIndex(routeIndexSource, spec.layoutKey);
  identitiesSource = appendIdentity(identitiesSource, identity);
  enMessages[spec.layoutKey] = spec.en;
  frMessages[spec.layoutKey] = spec.fr;

  console.log(`${spec.layoutKey}: ${markers.lengthMeters}m ${points.length}pts ${laps} laps`);
}

writeFileSync(routeIndexPath, routeIndexSource);
writeFileSync(identitiesPath, identitiesSource);
writeFileSync(enPath, `${JSON.stringify(enMessages, null, 2)}\n`);
writeFileSync(frPath, `${JSON.stringify(frMessages, null, 2)}\n`);
execFileSync(process.execPath, ["scripts/generate-circuit-speed-profiles.mjs"], { stdio: "inherit" });

function readSpecs() {
  if (!args.spec && !args.json) return [];
  const value = args.json ?? readFileSync(args.spec, "utf8");
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function validateSpec(spec) {
  const required = ["city", "country", "layoutKey", "en", "fr", "traits", "likelyWeather"];
  for (const key of required) {
    if (spec[key] === undefined) die(`Missing ${key} in circuit spec`);
  }
  for (const key of ["grip", "overtaking", "energy"]) {
    if (!Number.isFinite(spec.traits[key])) die(`Missing numeric traits.${key} for ${spec.layoutKey}`);
  }
}

function parsePoints(text) {
  const points = [...text.matchAll(/\{\s*lat:\s*(-?\d+(?:\.\d+)?),\s*lng:\s*(-?\d+(?:\.\d+)?)\s*\}/g)].map(([, lat, lng]) => ({
    lat: Number(lat),
    lng: Number(lng)
  }));
  if (points.length < 4) die("Route file has too few points");
  return points;
}

function markersForRoute(points) {
  const cumulative = [0];
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += distanceMeters(points[index - 1], points[index]);
    cumulative.push(length);
  }
  length += distanceMeters(points.at(-1), points[0]);

  const segments = [];
  for (let index = 1; index < points.length; index += 1) {
    segments.push({ length: distanceMeters(points[index - 1], points[index]), start: cumulative[index - 1] });
  }
  segments.push({ length: distanceMeters(points.at(-1), points[0]), start: cumulative.at(-1) });
  const mainStraight = segments.sort((left, right) => right.length - left.length)[0];
  const startProgress = progress((mainStraight.start + mainStraight.length * 0.88) / length);
  const pitLaneProgress = progress((mainStraight.start + mainStraight.length * 0.18) / length - startProgress);

  return {
    lengthMeters: Math.round(length),
    mainStraightStartProgress: progress(mainStraight.start / length),
    mainStraightEndProgress: progress((mainStraight.start + mainStraight.length) / length),
    startProgress,
    pitLaneProgress
  };
}

function upsertRouteIndex(source, layoutKey) {
  if (source.includes(`${layoutKey}:`)) return source;
  const importName = camelRouteName(layoutKey);
  const importLine = `import { route as ${importName} } from "./${layoutKey}.js";`;
  const imports = [...source.matchAll(/^import \{ route as .*$/gm)].map((match) => match[0]);
  const entries = [...source.matchAll(/^ {2}[a-z0-9_]+: .*$/gm)].map((match) => match[0].replace(/,$/, ""));
  imports.push(importLine);
  entries.push(`  ${layoutKey}: ${importName}`);
  return source
    .replace(/^import \{ route as .*$/gm, "")
    .replace(/export const CIRCUIT_ROUTES: Record<string, CircuitRoute> = \{[\s\S]*?\n\};/, `export const CIRCUIT_ROUTES: Record<string, CircuitRoute> = {\n${entries.sort().map((line, index) => `${line}${index === entries.length - 1 ? "" : ","}`).join("\n")}\n};`)
    .replace(/^\n+/, `${imports.sort().join("\n")}\n\n`);
}

function appendIdentity(source, identity) {
  if (source.includes(`layoutKey: "${identity.layoutKey}"`)) return source;
  return source.replace(/\n\] as const satisfies readonly \[/, `,\n  ${formatIdentity(identity)}\n] as const satisfies readonly [`);
}

function formatIdentity(identity) {
  return `{ city: "${identity.city}", country: "${identity.country}", layoutKey: "${identity.layoutKey}", laps: ${identity.laps}, trackLengthMeters: ${identity.trackLengthMeters}, routeLengthMeters: ${identity.routeLengthMeters}, mainStraightStartProgress: ${identity.mainStraightStartProgress}, mainStraightEndProgress: ${identity.mainStraightEndProgress}, startProgress: ${identity.startProgress}, pitLaneProgress: ${identity.pitLaneProgress}, traits: { grip: ${identity.traits.grip}, overtaking: ${identity.traits.overtaking}, energy: ${identity.traits.energy} }, likelyWeather: "${identity.likelyWeather}" }`;
}

function camelRouteName(layoutKey) {
  return layoutKey.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function progress(value) {
  return Number((((value % 1) + 1) % 1).toFixed(6));
}

function distanceMeters(left, right) {
  const radius = 6_371_000;
  const toRadians = (value) => value * Math.PI / 180;
  const dLat = toRadians(right.lat - left.lat);
  const dLng = toRadians(right.lng - left.lng);
  const lat1 = toRadians(left.lat);
  const lat2 = toRadians(right.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;
    parsed[arg.slice(2)] = rawArgs[index + 1];
    index += 1;
  }
  return parsed;
}

function die(message) {
  console.error(message);
  process.exit(1);
}
