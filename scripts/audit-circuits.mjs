#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = "apps/web/src/app/circuits.ts";
const args = process.argv.slice(2);
const geojsonPath = valueAfter("--geojson");

const thresholds = {
  closureGapMeters: 120,
  maxSegmentMeters: 250,
  reverseReuseMeters: 30,
  directUturns: 0,
  crossings: 0
};

const circuits = parseCircuits(readFileSync(sourcePath, "utf8"));

if (circuits.length === 0) {
  console.error(`No circuits found in ${sourcePath}`);
  process.exit(1);
}

const reports = circuits.map((circuit) => auditCircuit(circuit));

console.log("Circuit audit");
for (const report of reports) {
  const status = report.failures.length === 0 ? "ok" : "bad";
  console.log(
    [
      status.padEnd(3),
      `${report.city}/${report.layoutKey}`.padEnd(39),
      `${report.pointCount} pts`.padStart(8),
      `${formatMeters(report.lengthMeters)} total`.padStart(13),
      `${Math.round(report.closureGapMeters)}m close`.padStart(12),
      `${Math.round(report.maxSegmentMeters)}m max`.padStart(9),
      `${report.crossings} cross`.padStart(8),
      `${report.directUturns} uturn`.padStart(8),
      `${Math.round(report.reverseReuseMeters)}m reverse`.padStart(11)
    ].join("  ")
  );
  for (const failure of report.failures) {
    console.log(`     - ${failure}`);
  }
}

if (geojsonPath) {
  writeFileSync(geojsonPath, `${JSON.stringify(toGeoJson(reports), null, 2)}\n`);
  console.log(`GeoJSON written to ${geojsonPath}`);
}

if (reports.some((report) => report.failures.length > 0)) {
  process.exit(1);
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function parseCircuits(source) {
  const circuitPattern =
    /\{\s*city:\s*"(?<city>[^"]+)",[\s\S]*?country:\s*"(?<country>[^"]+)",[\s\S]*?layoutKey:\s*"(?<layoutKey>[^"]+)",[\s\S]*?route:\s*\[(?<route>[\s\S]*?)\n\s*\]\s*\}/g;
  return [...source.matchAll(circuitPattern)].map((match) => ({
    city: match.groups.city,
    country: match.groups.country,
    layoutKey: match.groups.layoutKey,
    points: [...match.groups.route.matchAll(/\{\s*lat:\s*(-?\d+(?:\.\d+)?),\s*lng:\s*(-?\d+(?:\.\d+)?)\s*\}/g)].map(
      ([, lat, lng]) => ({ lat: Number(lat), lng: Number(lng) })
    )
  }));
}

function auditCircuit(circuit) {
  const segments = toSegments(circuit.points);
  const crossings = countCrossings(segments);
  const directUturns = countDirectUturns(segments);
  const reverseReuseMeters = measureReverseReuse(segments);
  const segmentLengths = segments.map((segment) => segment.length);
  const lengthMeters = segmentLengths.reduce((sum, length) => sum + length, 0);
  const maxSegmentMeters = Math.max(0, ...segmentLengths);
  const closureGapMeters = distanceMeters(circuit.points[0], circuit.points.at(-1));

  const failures = [];
  if (closureGapMeters > thresholds.closureGapMeters) {
    failures.push(`fermeture trop longue (${Math.round(closureGapMeters)}m)`);
  }
  if (maxSegmentMeters > thresholds.maxSegmentMeters) {
    failures.push(`segment suspect trop long (${Math.round(maxSegmentMeters)}m)`);
  }
  if (crossings > thresholds.crossings) {
    failures.push(`${crossings} croisement(s) detecte(s)`);
  }
  if (directUturns > thresholds.directUturns) {
    failures.push(`${directUturns} demi-tour(s) direct(s) detecte(s)`);
  }
  if (reverseReuseMeters > thresholds.reverseReuseMeters) {
    failures.push(`${Math.round(reverseReuseMeters)}m repris en sens inverse`);
  }

  return {
    ...circuit,
    pointCount: circuit.points.length,
    lengthMeters,
    closureGapMeters,
    maxSegmentMeters,
    crossings,
    directUturns,
    reverseReuseMeters,
    failures
  };
}

function toSegments(points) {
  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const a = project(start);
    const b = project(end);
    return {
      index,
      start,
      end,
      a,
      b,
      length: distanceMeters(start, end),
      angle: Math.atan2(b.y - a.y, b.x - a.x),
      midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    };
  });
}

function countCrossings(segments) {
  let total = 0;
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 2; j < segments.length; j += 1) {
      if (segmentsIntersect(segments[i].a, segments[i].b, segments[j].a, segments[j].b)) {
        total += 1;
      }
    }
  }
  return total;
}

function countDirectUturns(segments) {
  return segments.slice(0, -1).filter((segment, index) => {
    const next = segments[index + 1];
    return segment.length > 12 && next.length > 12 && angleDelta(segment.angle, next.angle) > 2.65;
  }).length;
}

function measureReverseReuse(segments) {
  const reused = new Set();
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 2; j < segments.length; j += 1) {
      const a = segments[i];
      const b = segments[j];
      if (a.length < 8 || b.length < 8) continue;
      if (distanceProjected(a.midpoint, b.midpoint) > 10) continue;
      if (angleDelta(a.angle, b.angle) < 2.55) continue;
      reused.add(i);
      reused.add(j);
    }
  }
  return [...reused].reduce((sum, index) => sum + segments[index].length, 0);
}

function segmentsIntersect(a, b, c, d) {
  const eps = 0.01;
  const det1 = orientation(a, b, c);
  const det2 = orientation(a, b, d);
  const det3 = orientation(c, d, a);
  const det4 = orientation(c, d, b);
  return det1 * det2 < -eps && det3 * det4 < -eps;
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function angleDelta(a, b) {
  const delta = Math.abs(a - b) % (Math.PI * 2);
  return delta > Math.PI ? Math.PI * 2 - delta : delta;
}

function project(point) {
  return {
    x: point.lng * metersPerLng(point.lat),
    y: point.lat * 111_320
  };
}

function distanceMeters(a, b) {
  return Math.hypot((a.lng - b.lng) * metersPerLng((a.lat + b.lat) / 2), (a.lat - b.lat) * 111_320);
}

function distanceProjected(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function metersPerLng(lat) {
  return 111_320 * Math.cos((lat * Math.PI) / 180);
}

function formatMeters(meters) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

function toGeoJson(reports) {
  return {
    type: "FeatureCollection",
    features: reports.map((report) => ({
      type: "Feature",
      properties: {
        city: report.city,
        country: report.country,
        layoutKey: report.layoutKey,
        lengthMeters: Math.round(report.lengthMeters),
        closureGapMeters: Math.round(report.closureGapMeters),
        maxSegmentMeters: Math.round(report.maxSegmentMeters),
        crossings: report.crossings,
        directUturns: report.directUturns,
        reverseReuseMeters: Math.round(report.reverseReuseMeters),
        failures: report.failures
      },
      geometry: {
        type: "LineString",
        coordinates: report.points.map((point) => [point.lng, point.lat])
      }
    }))
  };
}
