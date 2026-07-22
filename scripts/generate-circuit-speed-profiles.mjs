#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const routesDir = "apps/web/src/app/circuitRoutes";
const identitiesPath = "packages/shared/src/domain/circuits.ts";
const source = readFileSync(identitiesPath, "utf8");
const identities = parseIdentities(source);
const profiles = Object.fromEntries(
  identities.map((identity) => {
    const route = parsePoints(readFileSync(join(routesDir, `${identity.layoutKey}.ts`), "utf8"));
    return [identity.layoutKey, speedProfileForRoute(route, identity)];
  })
);

writeFileSync(identitiesPath, replaceProfileBlock(source, profiles));
console.log(`Generated ${Object.keys(profiles).length} circuit speed profiles`);

function parseIdentities(text) {
  const pattern =
    /\{\s*city:\s*"(?<city>[^"]+)",\s*country:\s*"(?<country>[^"]+)",\s*layoutKey:\s*"(?<layoutKey>[^"]+)",\s*laps:\s*(?<laps>\d+),[\s\S]*?mainStraightStartProgress:\s*(?<mainStraightStartProgress>\d+(?:\.\d+)?),\s*mainStraightEndProgress:\s*(?<mainStraightEndProgress>\d+(?:\.\d+)?),\s*startProgress:\s*(?<startProgress>\d+(?:\.\d+)?),[\s\S]*?likelyWeather:\s*"(?<weather>[^"]+)"\s*\}/g;
  return [...text.matchAll(pattern)].map((match) => ({
    layoutKey: match.groups.layoutKey,
    mainStraightStartProgress: Number(match.groups.mainStraightStartProgress),
    mainStraightEndProgress: Number(match.groups.mainStraightEndProgress),
    startProgress: Number(match.groups.startProgress)
  }));
}

function parsePoints(text) {
  return [...text.matchAll(/\{\s*lat:\s*(-?\d+(?:\.\d+)?),\s*lng:\s*(-?\d+(?:\.\d+)?)\s*\}/g)].map(([, lat, lng]) => ({
    lat: Number(lat),
    lng: Number(lng)
  }));
}

function speedProfileForRoute(points, identity) {
  const segments = toSegments(points);
  const length = segments.reduce((sum, segment) => sum + segment.length, 0);
  let cursor = 0;
  const candidates = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    cursor += segments[index].length;
    const delta = angleDelta(segments[index].angle, segments[index + 1].angle) * 180 / Math.PI;
    if (delta < 28 || segments[index].length < 10 || segments[index + 1].length < 10) continue;
    const severity = Math.min(1, (delta - 28) / 72);
    candidates.push({
      progress: roundProgress(cursor / Math.max(1, length) - identity.startProgress),
      severity,
      score: delta * Math.min(1, (segments[index].length + segments[index + 1].length) / 120)
    });
  }

  const spans = [
    ...strongestTurns(candidates).flatMap(({ progress, severity }) => cornerSpans(progress, severity)),
    {
      kind: "straight",
      startProgress: roundProgress(identity.mainStraightStartProgress),
      endProgress: roundProgress(identity.mainStraightEndProgress),
      factor: 1.08
    }
  ].sort((left, right) => left.startProgress - right.startProgress || kindOrder(left.kind) - kindOrder(right.kind));

  return spans;
}

function strongestTurns(candidates) {
  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, 7)
    .sort((left, right) => left.progress - right.progress);
}

function cornerSpans(progress, severity) {
  const brakingWidth = 0.014 + 0.016 * severity;
  const cornerWidth = 0.018 + 0.012 * severity;
  const exitWidth = 0.014 + 0.008 * severity;
  return [
    { kind: "braking", startProgress: roundProgress(progress - brakingWidth), endProgress: roundProgress(progress - 0.004), factor: roundFactor(1 - 0.2 * severity) },
    { kind: "corner", startProgress: roundProgress(progress - 0.006), endProgress: roundProgress(progress + cornerWidth), factor: roundFactor(1 - 0.34 * severity) },
    { kind: "exit", startProgress: roundProgress(progress + cornerWidth), endProgress: roundProgress(progress + cornerWidth + exitWidth), factor: roundFactor(1 + 0.07 * (1 - severity)) }
  ];
}

function replaceProfileBlock(text, profiles) {
  const body = Object.entries(profiles)
    .map(([layoutKey, profile]) => `  ${JSON.stringify(layoutKey)}: ${formatProfile(profile)}`)
    .join(",\n");
  const nextBlock = `export const CIRCUIT_SPEED_PROFILES = {\n${body}\n} as const satisfies Record<CityCircuitIdentity["layoutKey"], TrackSpeedProfile>;`;
  return text.replace(/export const CIRCUIT_SPEED_PROFILES = \{[\s\S]*?\} as const satisfies Record<CityCircuitIdentity\["layoutKey"\], TrackSpeedProfile>;/, nextBlock);
}

function formatProfile(profile) {
  return `[\n${profile.map((span) => `    { kind: "${span.kind}", startProgress: ${span.startProgress}, endProgress: ${span.endProgress}, factor: ${span.factor} }`).join(",\n")}\n  ]`;
}

function toSegments(points) {
  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const a = project(start);
    const b = project(end);
    return {
      length: distanceMeters(start, end),
      angle: Math.atan2(b.y - a.y, b.x - a.x)
    };
  });
}

function angleDelta(a, b) {
  const delta = Math.abs(a - b) % (Math.PI * 2);
  return delta > Math.PI ? Math.PI * 2 - delta : delta;
}

function distanceMeters(a, b) {
  return Math.hypot((a.lng - b.lng) * metersPerLng((a.lat + b.lat) / 2), (a.lat - b.lat) * 111_320);
}

function project(point) {
  return {
    x: point.lng * metersPerLng(point.lat),
    y: point.lat * 111_320
  };
}

function metersPerLng(lat) {
  return 111_320 * Math.cos((lat * Math.PI) / 180);
}

function kindOrder(kind) {
  return ["braking", "corner", "exit", "straight"].indexOf(kind);
}

function roundProgress(progress) {
  return Number((((progress % 1) + 1) % 1).toFixed(6));
}

function roundFactor(factor) {
  return Number(Math.max(0.58, Math.min(1.12, factor)).toFixed(2));
}
