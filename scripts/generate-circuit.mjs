#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));
const sourcePath = args.source ?? "apps/web/src/app/circuits.ts";
const routesDir = args.routesDir ?? "apps/web/src/app/circuitRoutes";
const identitiesPath = args.identities ?? "packages/shared/src/domain/circuits.ts";
const candidates = Number(args.candidates ?? 160);
const targetKm = Number(args.targetKm ?? 6.2);
const minKm = Number(args.minKm ?? 2.6);
const maxKm = Number(args.maxKm ?? 14);
const place = args.place;
const overpassEndpoints = args.overpassUrl
  ? [args.overpassUrl]
  : [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.osm.ch/api/interpreter",
      "https://overpass.private.coffee/api/interpreter"
    ];

if (!place && (!args.lat || !args.lng)) {
  die('Usage: node scripts/generate-circuit.mjs --place "Monaco" [--lat 43.73 --lng 7.42] [--write-index 11] [--layout-key circuit_x]');
}

const center = args.lat && args.lng ? { lat: Number(args.lat), lng: Number(args.lng), label: place ?? `${args.lat},${args.lng}` } : await geocode(place);
const seed = hash(`${place ?? ""}:${args.seed ?? ""}:${args.layoutKey ?? ""}`);
const attempts = candidateRings(center, seed, candidates);
const graph = args.provider === "osrm" ? null : await fetchStreetGraph(center, Number(args.radiusMeters ?? 3200));
const reports = [];

for (const attempt of attempts) {
  const generatedRoutes = args.provider === "osrm" ? await routeOsrmLoops(attempt) : routeGraphCycles(graph, attempt);
  if (graph) {
    const fallback = routeWaypointLoop(graph, attempt);
    if (fallback) generatedRoutes.push(fallback);
  }
  if (!generatedRoutes.length) {
    reports.push({ ...attempt, failures: ["no street cycle found"] });
    continue;
  }
  for (const generated of generatedRoutes) {
    const points = compactPoints(generated.points, Number(args.minPointGapMeters ?? 10));
    const report = auditPoints(points);
    const lengthKm = report.lengthMeters / 1000;
    const lengthPenalty = Math.abs(lengthKm - targetKm) * 18;
    const shapePenalty = report.turns * 0.35 + report.twistiness / 120;
    const failurePenalty = report.failures.length * 1000;
    reports.push({ ...attempt, ...report, points, score: failurePenalty + lengthPenalty + shapePenalty });
  }
}

const valid = reports
  .filter((report) => report.failures.length === 0 && report.lengthMeters >= minKm * 1000 && report.lengthMeters <= maxKm * 1000)
  .sort((left, right) => left.score - right.score);

const selected = valid[0];
if (!selected) {
  console.error(`No valid circuit found around ${center.label}. Best rejected candidates:`);
  for (const report of reports.sort((left, right) => (left.failures?.length ?? 99) - (right.failures?.length ?? 99)).slice(0, 8)) {
    console.error(summary(report));
    for (const failure of report.failures ?? []) console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(summary(selected));
if (args.quiet !== "true") console.log(routeModuleBlock(selected.points));

if (args.writeIndex) {
  if (args.layoutKey) {
    writeFileSync(`${routesDir}/${args.layoutKey}.ts`, routeModuleBlock(selected.points));
  } else {
    const index = Number(args.writeIndex);
    let source = readFileSync(sourcePath, "utf8");
    source = replaceRouteBlock(source, index, legacyRouteBlock(index, selected.points));
    writeFileSync(sourcePath, source);
  }
}

if (args.laps && args.layoutKey) {
  let identities = readFileSync(identitiesPath, "utf8");
  identities = identities.replace(new RegExp(`(layoutKey: "${escapeRegExp(args.layoutKey)}", laps: )\\d+`), `$1${Number(args.laps)}`);
  writeFileSync(identitiesPath, identities);
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { "User-Agent": "cr-league-circuit-generator/1.0" } });
  if (!response.ok) die(`Nominatim failed: ${response.status}`);
  const body = await response.json();
  if (!body.length) die(`Place not found: ${query}`);
  return { lat: Number(body[0].lat), lng: Number(body[0].lon), label: body[0].display_name };
}

async function routeOsrmLoops(attempt) {
  const ring = attempt.waypoints.slice(0, -1);
  const maxWaypoints = 8;
  const step = Math.max(1, Math.floor(ring.length / maxWaypoints));
  const waypoints = [];
  for (let index = 0; index < ring.length && waypoints.length < maxWaypoints; index += step) {
    waypoints.push(ring[index]);
  }
  waypoints.push(waypoints[0]);
  const coordinates = waypoints.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&continue_straight=false`;
  try {
    const response = await fetch(url, { headers: { "User-Agent": "cr-league-circuit-generator/1.0" } });
    if (!response.ok) return [];
    const body = await response.json();
    const geometry = body.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(geometry) || geometry.length < 4) return [];
    return [{ points: geometry.map(([lng, lat]) => ({ lat: round(lat), lng: round(lng) })) }];
  } catch {
    return [];
  }
}

async function fetchStreetGraph(center, radiusMeters) {
  const south = center.lat - radiusMeters / 111_320;
  const north = center.lat + radiusMeters / 111_320;
  const west = center.lng - radiusMeters / metersPerLng(center.lat);
  const east = center.lng + radiusMeters / metersPerLng(center.lat);
  const highwayTypes = selectedHighwayTypes();
  const query = `
[out:json][timeout:${Number(args.overpassTimeout ?? 25)}];
(
  way["highway"~"^(${highwayTypes.join("|")})$"](${south},${west},${north},${east});
);
out skel qt;
>;
out skel qt;`;
  return fetchOverpassGraph(query, center);
}

async function fetchOverpassGraph(query, center) {
  const errors = [];
  for (const endpoint of overpassEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "User-Agent": "cr-league-circuit-generator/1.0" },
        body: `data=${encodeURIComponent(query)}`
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return graphFromOverpass(await response.json(), center);
    } catch (error) {
      errors.push(`${endpoint}: ${error.message}`);
    }
  }
  throw new Error(`Overpass failed on every endpoint:\n${errors.join("\n")}`);
}

function selectedHighwayTypes() {
  const major = [
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "trunk_link",
    "primary_link",
    "secondary_link",
    "tertiary_link"
  ];
  if (args.highways === "major") return major;
  return [
    "motorway",
    ...major,
    "residential",
    "living_street",
    "service",
    "road",
    "motorway_link",
    ...(args.walkways === "true" ? ["pedestrian", "cycleway", "path", "footway"] : [])
  ];
}

function graphFromOverpass(body, center) {
  const nodes = new Map();
  const ways = [];
  for (const element of body.elements) {
    if (element.type === "node") nodes.set(element.id, { id: element.id, lat: round(element.lat), lng: round(element.lon) });
    if (element.type === "way") ways.push(element);
  }
  const adjacency = new Map();
  for (const way of ways) {
    for (let index = 0; index < way.nodes.length - 1; index += 1) {
      const left = nodes.get(way.nodes[index]);
      const right = nodes.get(way.nodes[index + 1]);
      if (!left || !right) continue;
      const length = distanceMeters(left, right);
      if (length < 1 || length > 260) continue;
      addEdge(adjacency, left, right, length);
      addEdge(adjacency, right, left, length);
    }
  }
  const connectedIds = largestComponent(adjacency);
  const connectedNodes = [...nodes.values()].filter((node) => connectedIds.has(node.id));
  if (connectedNodes.length < 50) throw new Error(`Not enough OSM street nodes around ${center.label}`);
  return { nodes: new Map(connectedNodes.map((node) => [node.id, node])), adjacency, center };
}

function addEdge(adjacency, from, to, length) {
  const edges = adjacency.get(from.id) ?? [];
  edges.push({ to: to.id, length });
  adjacency.set(from.id, edges);
}

function largestComponent(adjacency) {
  const seen = new Set();
  let largest = new Set();
  for (const start of adjacency.keys()) {
    if (seen.has(start)) continue;
    const component = new Set();
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const current = stack.pop();
      component.add(current);
      for (const edge of adjacency.get(current) ?? []) {
        if (!seen.has(edge.to)) {
          seen.add(edge.to);
          stack.push(edge.to);
        }
      }
    }
    if (component.size > largest.size) largest = component;
  }
  return largest;
}

function candidateRings(center, seed, count) {
  const rings = [];
  const pointCounts = [18, 22, 26, 30];
  const radii = args.candidateRadii
    ? args.candidateRadii.split(",").map(Number).filter((value) => Number.isFinite(value) && value > 0)
    : [700, 900, 1150, 1450, 1800, 2300, 2900];
  const aspects = [
    [1, 0.68],
    [1, 0.82],
    [1, 1],
    [0.76, 1],
    [1.24, 0.7]
  ];
  for (let index = 0; rings.length < count; index += 1) {
    const radius = radii[(seed + index) % radii.length];
    const pointCount = pointCounts[(seed + index * 3) % pointCounts.length];
    const [aspectX, aspectY] = aspects[(seed + index * 5) % aspects.length];
    const rotation = ((seed % 360) + index * 23) * Math.PI / 180;
    const wobble = 0.12 + ((seed + index * 17) % 16) / 100;
    const waypoints = [];
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
      const angle = rotation + pointIndex / pointCount * Math.PI * 2;
      const wave = 1 + Math.sin(pointIndex * 1.7 + seed) * wobble;
      const east = Math.cos(angle) * radius * aspectX * wave;
      const north = Math.sin(angle) * radius * aspectY * wave;
      waypoints.push(offset(center, east, north));
    }
    waypoints.push(waypoints[0]);
    rings.push({ waypoints, radius, pointCount });
  }
  return rings;
}

function routeGraphCycles(graph, attempt) {
  const allowed = annulusNodeIds(graph, attempt.radius * 0.32, attempt.radius * 2.1);
  const ring = attempt.waypoints.slice(0, -1);
  const variants = [];
  const seen = new Set();
  const offsets = [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87];
  const spans = [0.42, 0.5, 0.58];
  for (const offset of offsets) {
    for (const span of spans) {
      const startIndex = Math.floor(ring.length * offset) % ring.length;
      const endIndex = Math.floor(startIndex + ring.length * span) % ring.length;
      const start = nearestNode(graph.nodes, ring[startIndex], allowed)?.id;
      const end = nearestNode(graph.nodes, ring[endIndex], allowed)?.id;
      if (!start || !end || start === end) continue;
      const signature = `${start}:${end}`;
      if (seen.has(signature)) continue;
      seen.add(signature);
      const usedEdges = new Set();
      const outbound = shortestPath(graph, start, end, usedEdges, allowed);
      if (!outbound || outbound.length < 2) continue;
      for (let index = 0; index < outbound.length - 1; index += 1) usedEdges.add(edgeKey(outbound[index], outbound[index + 1]));
      const inbound = shortestPath(graph, end, start, usedEdges, allowed, true);
      if (!inbound || inbound.length < 2) continue;
      const routeIds = [...outbound, ...inbound.slice(1)];
      variants.push({ points: routeIds.map((id) => graph.nodes.get(id)).filter(Boolean) });
    }
  }
  return variants;
}

function routeWaypointLoop(graph, attempt) {
  const allowed = annulusNodeIds(graph, attempt.radius * 0.2, attempt.radius * 2.25);
  const ring = attempt.waypoints.slice(0, -1);
  const step = Math.max(1, Math.floor(ring.length / 10));
  const targetIds = [];
  for (let index = 0; index < ring.length; index += step) {
    const node = nearestNode(graph.nodes, ring[index], allowed);
    if (node && targetIds.at(-1) !== node.id) targetIds.push(node.id);
  }
  if (targetIds.length < 4) return null;
  if (targetIds[0] !== targetIds.at(-1)) targetIds.push(targetIds[0]);

  const usedEdges = new Set();
  const routeIds = [];
  for (let index = 0; index < targetIds.length - 1; index += 1) {
    const segment = shortestPath(graph, targetIds[index], targetIds[index + 1], usedEdges, allowed);
    if (!segment || segment.length < 2) return null;
    for (let pointIndex = 0; pointIndex < segment.length - 1; pointIndex += 1) {
      usedEdges.add(edgeKey(segment[pointIndex], segment[pointIndex + 1]));
    }
    routeIds.push(...(routeIds.length ? segment.slice(1) : segment));
  }
  return { points: routeIds.map((id) => graph.nodes.get(id)).filter(Boolean) };
}

function annulusNodeIds(graph, minMeters, maxMeters) {
  const ids = new Set();
  for (const node of graph.nodes.values()) {
    const distance = distanceMeters(node, graph.center);
    if (distance >= minMeters && distance <= maxMeters) ids.add(node.id);
  }
  return ids.size > 30 ? ids : new Set(graph.nodes.keys());
}

function nearestNode(nodes, target, allowed) {
  let best;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const node of nodes.values()) {
    if (allowed && !allowed.has(node.id)) continue;
    const distance = distanceMeters(node, target);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }
  return best;
}

function shortestPath(graph, start, end, usedEdges, allowed, forbidUsed = false) {
  const distances = new Map([[start, 0]]);
  const previous = new Map();
  const queue = new Set([start]);
  while (queue.size) {
    let current;
    let currentDistance = Number.POSITIVE_INFINITY;
    for (const id of queue) {
      const distance = distances.get(id) ?? Number.POSITIVE_INFINITY;
      if (distance < currentDistance) {
        current = id;
        currentDistance = distance;
      }
    }
    if (current === undefined) break;
    queue.delete(current);
    if (current === end) break;
    for (const edge of graph.adjacency.get(current) ?? []) {
      if (allowed && !allowed.has(edge.to) && edge.to !== end) continue;
      if (forbidUsed && usedEdges.has(edgeKey(current, edge.to))) continue;
      const reusePenalty = usedEdges.has(edgeKey(current, edge.to)) ? 80 : 0;
      const nextDistance = currentDistance + edge.length + reusePenalty;
      if (nextDistance < (distances.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(edge.to, nextDistance);
        previous.set(edge.to, current);
        queue.add(edge.to);
      }
    }
  }
  if (!previous.has(end) && start !== end) return null;
  const path = [end];
  while (path[0] !== start) {
    const prev = previous.get(path[0]);
    if (prev === undefined) return null;
    path.unshift(prev);
  }
  return path;
}

function edgeKey(left, right) {
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

function auditPoints(points) {
  const segments = toSegments(points);
  const crossings = countCrossings(segments);
  const directUturns = countDirectUturns(segments);
  const { turns, twistiness } = measureTurns(segments);
  const { reverseReuseMeters, sameDirectionReuseMeters } = measureReuse(segments);
  const lengthMeters = segments.reduce((sum, segment) => sum + segment.length, 0);
  const maxSegmentMeters = Math.max(0, ...segments.map((segment) => segment.length));
  const closureGapMeters = distanceMeters(points[0], points.at(-1));
  const failures = [];
  if (closureGapMeters > 120) failures.push(`closure gap ${Math.round(closureGapMeters)}m`);
  if (maxSegmentMeters > 250) failures.push(`segment ${Math.round(maxSegmentMeters)}m`);
  if (crossings > 0) failures.push(`${crossings} crossing(s)`);
  if (directUturns > 0) failures.push(`${directUturns} u-turn(s)`);
  if (reverseReuseMeters > 30) failures.push(`${Math.round(reverseReuseMeters)}m reverse reuse`);
  if (sameDirectionReuseMeters > 30) failures.push(`${Math.round(sameDirectionReuseMeters)}m repeated route`);
  return { lengthMeters, maxSegmentMeters, closureGapMeters, crossings, directUturns, turns, twistiness, reverseReuseMeters, sameDirectionReuseMeters, failures };
}

function compactPoints(points, minGapMeters) {
  const compact = [];
  for (const point of points) {
    if (!compact.length || distanceMeters(compact.at(-1), point) >= minGapMeters) compact.push(point);
  }
  const last = points.at(-1);
  if (last && distanceMeters(compact.at(-1), last) > 1) compact.push(last);
  return compact;
}

function replaceRouteBlock(source, index, block) {
  const marker = `    ...CITY_CIRCUIT_IDENTITIES[${index}],`;
  const markerPos = source.indexOf(marker);
  if (markerPos === -1) throw new Error(`Circuit block not found for index ${index}`);
  const blockStart = source.lastIndexOf("  {", markerPos);
  const nextMarker = `    ...CITY_CIRCUIT_IDENTITIES[${index + 1}],`;
  const nextMarkerPos = source.indexOf(nextMarker, markerPos + marker.length);
  const blockEnd = nextMarkerPos === -1 ? source.indexOf("\n];", markerPos) : source.lastIndexOf("  {", nextMarkerPos);
  const comma = nextMarkerPos === -1 ? "" : ",";
  return `${source.slice(0, blockStart)}${block}${comma}\n${source.slice(blockEnd)}`;
}

function legacyRouteBlock(index, points) {
  const spread = index ? `    ...CITY_CIRCUIT_IDENTITIES[${index}],\n` : "";
  return `  {\n${spread}    route: [\n${points.map((point) => `      { lat: ${point.lat}, lng: ${point.lng} }`).join(",\n")}\n    ]\n  }`;
}

function routeModuleBlock(points) {
  return `export const route: Array<{ lat: number; lng: number }> = [\n${points.map((point) => `  { lat: ${point.lat}, lng: ${point.lng} }`).join(",\n")}\n];\n`;
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
      if (segmentsIntersect(segments[i].a, segments[i].b, segments[j].a, segments[j].b)) total += 1;
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

function measureTurns(segments) {
  const deltas = segments.slice(0, -1).map((segment, index) => angleDelta(segment.angle, segments[index + 1].angle) * 180 / Math.PI);
  return {
    turns: deltas.filter((delta) => delta >= 35).length,
    twistiness: deltas.reduce((sum, delta) => sum + delta, 0)
  };
}

function measureReuse(segments) {
  const reverse = new Set();
  const sameDirection = new Set();
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 2; j < segments.length; j += 1) {
      const a = segments[i];
      const b = segments[j];
      if (a.length < 8 || b.length < 8) continue;
      if (distanceProjected(a.midpoint, b.midpoint) > 10) continue;
      if (angleDelta(a.angle, b.angle) >= 2.55) {
        reverse.add(i);
        reverse.add(j);
      } else {
        sameDirection.add(i);
        sameDirection.add(j);
      }
    }
  }
  return {
    reverseReuseMeters: [...reverse].reduce((sum, index) => sum + segments[index].length, 0),
    sameDirectionReuseMeters: [...sameDirection].reduce((sum, index) => sum + segments[index].length, 0)
  };
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

function offset(center, eastMeters, northMeters) {
  return {
    lat: round(center.lat + northMeters / 111_320),
    lng: round(center.lng + eastMeters / metersPerLng(center.lat))
  };
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

function summary(report) {
  return `${report.lengthMeters ? (report.lengthMeters / 1000).toFixed(2) : "?"}km ${report.points?.length ?? 0}pts ${report.turns ?? "?"}turns ${report.crossings ?? "?"}cross ${report.directUturns ?? "?"}uturn ${Math.round(report.reverseReuseMeters ?? 0)}m reverse ${Math.round(report.sameDirectionReuseMeters ?? 0)}m repeat`;
}

function hash(value) {
  let state = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    state ^= value.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  return state >>> 0;
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    parsed[name] = values[index + 1]?.startsWith("--") ? "true" : values[++index];
  }
  return parsed;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function round(value) {
  return Number(value.toFixed(6));
}

function die(message) {
  console.error(message);
  process.exit(1);
}
