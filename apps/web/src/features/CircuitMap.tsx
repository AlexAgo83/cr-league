import { useEffect, useMemo, useRef, type Ref, type RefObject } from "react";
import type { CSSProperties } from "react";
import type { DecisionDeltaKey, TeamLivery, Weather } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { circuitDistanceLabel, type CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import { DEFAULT_CAR_ASSET, carAssetForId, carRenderGeometryForId, type CarAsset } from "./carAssets.js";
import { safeHex } from "./LiveryPlate.js";
import { CountryBadge, VisualIcon } from "./VisualIcon.js";

export type MapCar = {
  id: string;
  label: string;
  player: boolean;
  delay: number;
  duration: number;
  progress?: number;
  livery?: TeamLivery;
  positionDelta?: number;
  positionDeltaKey?: number;
  eventLabel?: string;
  braking?: boolean;
  repeatCount?: number | "indefinite";
};

export function MapStatsToggle({ expanded, onToggle, tt }: { expanded: boolean; onToggle: (expanded: boolean) => void; tt: Translator }) {
  return (
    <button
      className="map-plan-stats-toggle"
      type="button"
      aria-expanded={expanded}
      aria-label={tt(expanded ? "action_collapse_stats" : "action_expand_stats")}
      title={tt(expanded ? "action_collapse_stats" : "action_expand_stats")}
      onClick={() => onToggle(!expanded)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={expanded ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
      </svg>
    </button>
  );
}

export type MapTraitStats = {
  grip: number;
  overtaking: number;
  energy: number;
};

export type MapTraitImpact = { label: string; value: number };
export type MapTraitImpacts = Partial<Record<DecisionDeltaKey, MapTraitImpact[]>>;

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 560;
const SAFE_AREA = {
  top: 115,
  right: 110,
  bottom: 80,
  left: 125
};
const TILE_SIZE = 256;
const FOCUS_ZOOM = 2.55;
const TRAFFIC_FOCUS_ZOOM = 3.45;
const CLOSE_FOCUS_ZOOM = FOCUS_ZOOM * 2;
const TRAFFIC_ENTER_DISTANCE = 44;
const TRAFFIC_EXIT_DISTANCE = 60;
const CLOSE_ENTER_DISTANCE = 2;
const CLOSE_EXIT_DISTANCE = 6;
const DRIFT_LOOKAHEAD = 0.012;
const HEADING_LOOKAHEAD = 0.006;
const MAX_DRIFT_ANGLE = 22;
const TIRE_MARK_MIN_DRIFT = 3;
const TIRE_MARK_LIFETIME = 1_100;
const TIRE_MARK_SAMPLE_DISTANCE = 0.45;
const ROUTE_FIT_PADDING = 58;
const ROUTE_STROKES = {
  glow: 22,
  asphalt: 12,
  edge: 2.5,
  accent: 4
};
type CameraZoomMode = "normal" | "traffic" | "close";
type RoutePoint = { x: number; y: number };
type RoutePose = RoutePoint & { angle: number };
type RouteSegment = {
  from: RoutePoint;
  to: RoutePoint;
  length: number;
  angle: number;
  startDistance: number;
  endDistance: number;
};
type RouteGeometry = { segments: RouteSegment[]; total: number };
type TireMarkPoint = RoutePoint & { at: number };
type TireMarks = { left: TireMarkPoint[]; right: TireMarkPoint[] };
export type CircuitRouteAnalysis = {
  startLine: { x1: number; y1: number; x2: number; y2: number };
  startProgress: number;
  pitStop: RoutePose;
};

const routeGeometryCache = new WeakMap<RoutePoint[], RouteGeometry>();
let routeGeometryBuildCount = 0;

function projectLatLng(point: { lat: number; lng: number }, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((point.lat * Math.PI) / 180);

  return {
    x: ((point.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
}

function circuitScene(circuit: CityCircuit) {
  // Highest integer zoom where the route fits the padded viewbox.
  let zoom = 16;
  let projected = circuit.route.map((point) => projectLatLng(point, zoom));
  let bounds = boundsOf(projected);
  const safeWidth = VIEW_WIDTH - SAFE_AREA.left - SAFE_AREA.right;
  const safeHeight = VIEW_HEIGHT - SAFE_AREA.top - SAFE_AREA.bottom;

  while (zoom > 10 && (bounds.maxX - bounds.minX > safeWidth || bounds.maxY - bounds.minY > safeHeight)) {
    zoom -= 1;
    projected = circuit.route.map((point) => projectLatLng(point, zoom));
    bounds = boundsOf(projected);
  }

  const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
  const safeCenter = {
    x: SAFE_AREA.left + safeWidth / 2,
    y: SAFE_AREA.top + safeHeight / 2
  };
  const originX = center.x - safeCenter.x;
  const originY = center.y - safeCenter.y;
  const points = projected.map((point) => ({ x: point.x - originX, y: point.y - originY }));

  const tiles = [];
  for (let x = Math.floor(originX / TILE_SIZE); x * TILE_SIZE < originX + VIEW_WIDTH; x += 1) {
    for (let y = Math.floor(originY / TILE_SIZE); y * TILE_SIZE < originY + VIEW_HEIGHT; y += 1) {
      tiles.push({ x, y, left: x * TILE_SIZE - originX, top: y * TILE_SIZE - originY });
    }
  }

  return {
    zoom,
    tiles,
    points,
    d: routePath(points)
  };
}

export function poseOnRoute(points: RoutePoint[], progress: number) {
  const point = pointOnRoute(points, progress);
  if (!point) return { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2, angle: 0 };
  const before = pointOnRoute(points, progress - HEADING_LOOKAHEAD);
  const after = pointOnRoute(points, progress + HEADING_LOOKAHEAD);
  const angle =
    before && after && Math.hypot(after.x - before.x, after.y - before.y) > 0.1
      ? Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI
      : point.angle;
  return { ...point, angle };
}

function pointOnRoute(points: RoutePoint[], progress: number): RoutePose {
  if (!points.length) return { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2, angle: 0 };
  const { segments, total } = getRouteGeometry(points);
  let distance = (((progress % 1) + 1) % 1) * (total || 1);

  for (const segment of segments) {
    if (distance <= segment.length) {
      const ratio = segment.length ? distance / segment.length : 0;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
        y: segment.from.y + (segment.to.y - segment.from.y) * ratio,
        angle: segment.angle * 180 / Math.PI
      };
    }
    distance -= segment.length;
  }

  return { ...points[0]!, angle: 0 };
}

function routeLength(points: RoutePoint[]) {
  return getRouteGeometry(points).total;
}

export function routeSegments(points: RoutePoint[]): RouteSegment[] {
  return getRouteGeometry(points).segments;
}

function getRouteGeometry(points: RoutePoint[]): RouteGeometry {
  const cached = routeGeometryCache.get(points);
  if (cached) return cached;
  routeGeometryBuildCount += 1;
  const segments = buildRouteSegments(points);
  const geometry = { segments, total: segments.at(-1)?.endDistance ?? 0 };
  routeGeometryCache.set(points, geometry);
  return geometry;
}

function buildRouteSegments(points: RoutePoint[]): RouteSegment[] {
  let startDistance = 0;
  return points.slice(1).map((point, index) => {
    const from = points[index]!;
    const length = Math.hypot(point.x - from.x, point.y - from.y);
    const segment = {
      from,
      to: point,
      length,
      angle: Math.atan2(point.y - from.y, point.x - from.x),
      startDistance,
      endDistance: startDistance + length
    };
    startDistance += length;
    return segment;
  });
}

export function __resetRouteGeometryStatsForTest() {
  routeGeometryBuildCount = 0;
}

export function __routeGeometryBuildCountForTest() {
  return routeGeometryBuildCount;
}

function routeLineAt(pose: RoutePose) {
  const angle = (pose.angle * Math.PI) / 180 + Math.PI / 2;
  const halfLength = 10;
  const dx = Math.cos(angle) * halfLength;
  const dy = Math.sin(angle) * halfLength;

  return {
    x1: pose.x - dx,
    y1: pose.y - dy,
    x2: pose.x + dx,
    y2: pose.y + dy
  };
}

export function analyzeCircuitRoute(points: RoutePoint[], circuit: Pick<CityCircuit, "startProgress" | "pitLaneProgress">): CircuitRouteAnalysis {
  const lineProgress = circuit.startProgress;
  const pitProgress = progressFromStart(circuit.pitLaneProgress, circuit.startProgress);
  return {
    startLine: routeLineAt(poseOnRoute(points, lineProgress)),
    startProgress: lineProgress,
    pitStop: poseOnRoute(points, pitProgress)
  };
}

export function circuitDisplayLength(circuit: CityCircuit) {
  return routeLength(circuitScene(circuit).points);
}

export function circuitRouteAnalysis(circuit: CityCircuit) {
  return analyzeCircuitRoute(circuitScene(circuit).points, circuit);
}

export function angleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function progressFromStart(progress: number, startProgress: number) {
  return (((progress + startProgress) % 1) + 1) % 1;
}

export function driftAngle(points: Array<{ x: number; y: number }>, progress: number) {
  const before = poseOnRoute(points, progress - DRIFT_LOOKAHEAD).angle;
  const after = poseOnRoute(points, progress + DRIFT_LOOKAHEAD).angle;
  return Math.max(-MAX_DRIFT_ANGLE, Math.min(MAX_DRIFT_ANGLE, angleDelta(before, after) * 0.7));
}

function boundsOf(points: Array<{ x: number; y: number }>) {
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y))
  };
}

function routePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

export function routeFitTransform(points: RoutePoint[]) {
  const bounds = boundsOf(points);
  const width = bounds.maxX - bounds.minX || 1;
  const height = bounds.maxY - bounds.minY || 1;
  const scale = Math.min((VIEW_WIDTH - ROUTE_FIT_PADDING * 2) / width, (VIEW_HEIGHT - ROUTE_FIT_PADDING * 2) / height);
  const x = VIEW_WIDTH / 2 - ((bounds.minX + bounds.maxX) / 2) * scale;
  const y = VIEW_HEIGHT / 2 - ((bounds.minY + bounds.maxY) / 2) * scale;
  return { x, y, scale, value: `translate(${x} ${y}) scale(${scale})` };
}

export function CircuitMap({
  circuit,
  tt,
  cars = [],
  svgRef,
  overlay,
  camera,
  carProgressRef,
  className,
  showHeading = true,
  framed = true,
  showTraits = true,
  weather,
  onCarClick,
  reduceMotion = prefersReducedMotion()
}: {
  circuit: CityCircuit;
  tt: Translator;
  cars?: MapCar[];
  svgRef?: Ref<SVGSVGElement>;
  overlay?: React.ReactNode;
  camera?: {
    enabled: boolean;
    car: MapCar | undefined;
    timeRef?: React.RefObject<number>;
  };
  carProgressRef?: RefObject<Record<string, number>>;
  className?: string;
  showHeading?: boolean;
  framed?: boolean;
  showTraits?: boolean;
  weather?: Weather;
  onCarClick?: (car: MapCar) => void;
  reduceMotion?: boolean;
}) {
  const { zoom, tiles, points, d } = useMemo(() => circuitScene(circuit), [circuit]);
  const cameraRef = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const carsRef = useRef(cars);
  const pointsRef = useRef(points);
  const clockRef = useRef(0);
  const zoomRef = useRef(FOCUS_ZOOM);
  const zoomModeRef = useRef<CameraZoomMode>("normal");
  const tireMarksRef = useRef(new Map<string, TireMarks>());
  const focusEnabled = Boolean(camera?.enabled && camera.car);
  const markerScale = focusEnabled ? 1 / FOCUS_ZOOM : 0.62;
  const hasCars = cars.length > 0;
  const routeAnalysis = useMemo(() => analyzeCircuitRoute(points, circuit), [circuit, points]);
  const mapFit = useMemo(() => routeFitTransform(points), [points]);
  const activeMapFit = focusEnabled ? null : mapFit;
  const mapTransform = activeMapFit?.value;
  const routeDecorScale = Math.max(1, activeMapFit?.scale ?? 1);
  const routeDecorStyle = useMemo(() => ({
    "--route-glow-width": `${ROUTE_STROKES.glow / routeDecorScale}`,
    "--route-asphalt-width": `${ROUTE_STROKES.asphalt / routeDecorScale}`,
    "--route-edge-width": `${ROUTE_STROKES.edge / routeDecorScale}`,
    "--route-accent-width": `${ROUTE_STROKES.accent / routeDecorScale}`
  }) as CSSProperties, [routeDecorScale]);
  const renderPoints = points;
  const renderD = d;
  const stageProgress = (progress: number) => progressFromStart(progress, routeAnalysis.startProgress);
  const displayWeather = weather ?? circuit.likelyWeather;
  const sortedCars = useMemo(() => [...cars].sort((a, b) => Number(a.player) - Number(b.player)), [cars]);
  const tileLayer = useMemo(() => tiles.map((tile) => (
    <g key={`${tile.x}-${tile.y}`} className="circuit-map-tile-layer">
      <rect className="circuit-map-tile-placeholder" x={tile.left} y={tile.top} width={TILE_SIZE} height={TILE_SIZE} />
      <image
        className="circuit-map-tile"
        href={`https://basemaps.cartocdn.com/dark_nolabels/${zoom}/${tile.x}/${tile.y}.png`}
        x={tile.left}
        y={tile.top}
        width={TILE_SIZE}
        height={TILE_SIZE}
      />
    </g>
  )), [tiles, zoom]);
  const routeLayer = useMemo(() => (
    <>
      <path ref={routeRef} className={hasCars ? "circuit-route-glow replay-muted-glow" : "circuit-route-glow"} d={renderD} />
      <path className={hasCars ? "circuit-route-asphalt replay-muted-asphalt" : "circuit-route-asphalt"} d={renderD} />
      <path className={hasCars ? "circuit-route-edge replay-muted-route" : "circuit-route-edge"} d={renderD} />
      <path className={hasCars ? "circuit-route-accent replay-muted-route" : "circuit-route-accent"} d={renderD} />
      <g className="circuit-pit-stop" transform={`translate(${routeAnalysis.pitStop.x} ${routeAnalysis.pitStop.y})`}>
        <circle r="9" />
        <text textAnchor="middle" dominantBaseline="central">
          P
        </text>
      </g>
      {hasCars ? (
        <line className="circuit-start-line" x1={routeAnalysis.startLine.x1} y1={routeAnalysis.startLine.y1} x2={routeAnalysis.startLine.x2} y2={routeAnalysis.startLine.y2} />
      ) : (
        <line className="circuit-start-line circuit-start-preview" x1={routeAnalysis.startLine.x1} y1={routeAnalysis.startLine.y1} x2={routeAnalysis.startLine.x2} y2={routeAnalysis.startLine.y2} />
      )}
    </>
  ), [hasCars, renderD, routeAnalysis]);
  carsRef.current = cars;
  pointsRef.current = renderPoints;

  useEffect(() => {
    const cameraGroup = cameraRef.current;
    if (!cameraGroup || !carProgressRef || !hasCars) return;
    const lastTransforms = new Map<string, string>();
    const trailPaths = Array.from(cameraGroup.querySelectorAll<SVGPathElement>(".map-car-trail"));
    const tireMarks = tireMarksRef.current;
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      const groups = Array.from(cameraGroup.querySelectorAll<SVGGElement>(".map-car"));
      for (const car of carsRef.current) {
        const progress = carProgressRef.current[car.id] ?? car.progress;
        if (progress === undefined) continue;
        const stagedProgress = progressFromStart(progress, routeAnalysis.startProgress);
        const pose = poseOnRoute(pointsRef.current, stagedProgress);
        const drift = driftAngle(pointsRef.current, stagedProgress);
        const transform = `translate(${pose.x} ${pose.y})`;
        const group = groups.find((candidate) => candidate.dataset.carId === car.id);
        if (group && lastTransforms.get(car.id) !== transform) {
          group.setAttribute("transform", transform);
          lastTransforms.set(car.id, transform);
        }
        const bodyAngle = pose.angle + drift;
        group?.querySelector<SVGGElement>(".map-car-sprite")?.setAttribute("transform", `rotate(${bodyAngle})`);

        const geometry = carRenderGeometryForId(car.livery?.carAssetId);
        const scale = focusEnabled ? 1 / zoomRef.current : markerScale;
        const radians = bodyAngle * Math.PI / 180;
        const wheelPoints = geometry.rearWheels.map(([x, y]) => ({
          x: pose.x + (x * Math.cos(radians) - y * Math.sin(radians)) * scale,
          y: pose.y + (x * Math.sin(radians) + y * Math.cos(radians)) * scale
        }));
        const marks = tireMarks.get(car.id) ?? { left: [], right: [] };
        tireMarks.set(car.id, marks);
        for (const [index, side] of (["left", "right"] as const).entries()) {
          marks[side] = marks[side].filter((point) => now - point.at <= TIRE_MARK_LIFETIME);
          const wheel = wheelPoints[index]!;
          const previous = marks[side].at(-1);
          const distance = previous ? Math.hypot(wheel.x - previous.x, wheel.y - previous.y) : 0;
          if (previous && distance > 8) marks[side] = [];
          if (Math.abs(drift) >= TIRE_MARK_MIN_DRIFT && (!previous || distance >= TIRE_MARK_SAMPLE_DISTANCE)) {
            marks[side].push({ ...wheel, at: now });
          }
          const path = trailPaths.find((candidate) => candidate.dataset.carId === car.id && candidate.dataset.wheel === side);
          const latest = marks[side].at(-1);
          path?.setAttribute("d", marks[side].length > 1 ? routePath(marks[side]) : "");
          path?.setAttribute("opacity", latest ? String(Math.min(1, (TIRE_MARK_LIFETIME - (now - latest.at)) / 400)) : "0");
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      tireMarks.clear();
    };
  }, [carProgressRef, focusEnabled, hasCars, markerScale, routeAnalysis.startProgress]);

  useEffect(() => {
    const cameraGroup = cameraRef.current;
    const route = routeRef.current;
    const carId = camera?.car?.id;
    if (!cameraGroup || !route || !camera?.enabled || !carId || !route.getTotalLength) {
      cameraGroup?.removeAttribute("transform");
      zoomRef.current = FOCUS_ZOOM;
      zoomModeRef.current = "normal";
      return;
    }

    const length = route.getTotalLength();
    const focusX = VIEW_WIDTH / 2;
    const focusY = VIEW_HEIGHT / 2;
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      const car = carsRef.current.find((candidate) => candidate.id === carId);
      if (!car) return;
      clockRef.current = camera.timeRef?.current ?? (performance.now() - startedAt) / 1000;
      // Center on the same continuous progress the sprite is drawn from (carProgressRef, updated
      // every frame) rather than the React-stepped car.progress; otherwise the camera pans in
      // discrete jumps that the focus zoom magnifies into a micro-teleport while the sprite glides.
      const liveProgress = carProgressRef?.current[carId];
      const elapsed = Math.max(0, clockRef.current - car.delay);
      const ambientProgress = car.repeatCount !== "indefinite" && clockRef.current >= car.delay + car.duration * circuit.laps ? 1 : (elapsed % car.duration) / car.duration;
      const usesTrace = liveProgress !== undefined || car.progress !== undefined;
      const progress = liveProgress ?? car.progress ?? ambientProgress;
      const stagedProgress = progressFromStart(progress, routeAnalysis.startProgress);
      const point = usesTrace ? poseOnRoute(pointsRef.current, stagedProgress) : route.getPointAtLength(length * stagedProgress);
      const nearestCarDistance = Math.min(
        ...carsRef.current.map((other) => {
          const otherProgress = carProgressRef?.current[other.id] ?? other.progress;
          if (other.id === car.id || otherProgress === undefined) return Number.POSITIVE_INFINITY;
          const otherPoint = poseOnRoute(pointsRef.current, progressFromStart(otherProgress, routeAnalysis.startProgress));
          return Math.hypot(otherPoint.x - point.x, otherPoint.y - point.y);
        })
      );
      if (zoomModeRef.current === "close") {
        if (nearestCarDistance > CLOSE_EXIT_DISTANCE) zoomModeRef.current = nearestCarDistance < TRAFFIC_EXIT_DISTANCE ? "traffic" : "normal";
      } else if (zoomModeRef.current === "traffic") {
        if (nearestCarDistance < CLOSE_ENTER_DISTANCE) zoomModeRef.current = "close";
        else if (nearestCarDistance > TRAFFIC_EXIT_DISTANCE) zoomModeRef.current = "normal";
      } else if (nearestCarDistance < CLOSE_ENTER_DISTANCE) {
        zoomModeRef.current = "close";
      } else if (nearestCarDistance < TRAFFIC_ENTER_DISTANCE) {
        zoomModeRef.current = "traffic";
      }
      const targetZoom = zoomModeRef.current === "close" ? CLOSE_FOCUS_ZOOM : zoomModeRef.current === "traffic" ? TRAFFIC_FOCUS_ZOOM : FOCUS_ZOOM;
      zoomRef.current += (targetZoom - zoomRef.current) * 0.08;
      cameraGroup.querySelectorAll<SVGGElement>(".map-car-marker").forEach((marker) => marker.setAttribute("transform", `scale(${1 / zoomRef.current})`));
      cameraGroup.setAttribute("transform", `translate(${focusX} ${focusY}) scale(${zoomRef.current}) translate(${-point.x} ${-point.y})`);
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      cameraGroup.removeAttribute("transform");
    };
  }, [camera?.enabled, camera?.car?.id, camera?.timeRef, carProgressRef, circuit.laps, routeAnalysis.startProgress]);

  return (
    <section
      className={`${framed ? "circuit-map" : "circuit-map circuit-map-unframed"}${className ? ` ${className}` : ""}${weather ? ` circuit-weather-${weather}` : ""}`}
      aria-label={tt("city_circuit_map")}
    >
      <div className="circuit-map-stage">
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g ref={cameraRef} className="circuit-camera">
            <g className="circuit-map-content" transform={mapTransform}>
              {tileLayer}
              <g className="circuit-route-layer" style={routeDecorStyle}>
                {routeLayer}
                <g className="map-car-trails">
                  {sortedCars.flatMap((car) => (["left", "right"] as const).map((wheel) => (
                    <path key={`${car.id}-${wheel}`} className="map-car-trail" data-car-id={car.id} data-wheel={wheel} vectorEffect="non-scaling-stroke" />
                  )))}
                </g>
                {/* SVG z-order is document order: render the player's car last so it always sits on top. */}
                {sortedCars.map((car) => {
                  const pose = car.progress === undefined ? null : poseOnRoute(renderPoints, stageProgress(car.progress));
                  const drift = car.progress === undefined ? 0 : driftAngle(renderPoints, stageProgress(car.progress));
                  const asset = carAssetForId(car.livery?.carAssetId);
                  const carStyle = car.livery
                    ? ({ "--car-primary": safeHex(car.livery.primary, "#38bdf8"), "--car-secondary": safeHex(car.livery.secondary, "#16c784") } as CSSProperties & Record<string, string>)
                    : undefined;
                  return (
                    <g
                      key={car.id}
                      data-car-id={car.id}
                      className={`${car.player ? "map-car player" : "map-car"}${onCarClick ? " focus-target" : ""}`}
                      style={carStyle}
                      transform={pose ? `translate(${pose.x} ${pose.y})` : undefined}
                      onClick={onCarClick ? () => onCarClick(car) : undefined}
                    >
                      <g className="map-car-marker" transform={`scale(${markerScale})`}>
                        <MapCarSprite asset={asset} braking={car.braking} maskId={`car-sprite-mask-${car.id}`} transform={pose ? `rotate(${pose.angle + drift})` : undefined} />
                        <text textAnchor="middle" dominantBaseline="central">
                          {car.label}
                        </text>
                        {car.positionDelta ? (
                          <text
                            key={`${car.id}-${car.positionDeltaKey}`}
                            className={car.positionDelta > 0 ? "map-car-delta gain" : "map-car-delta loss"}
                            x="24"
                            y="-16"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {car.positionDelta > 0 ? `+${car.positionDelta}` : car.positionDelta}
                          </text>
                        ) : null}
                        {car.eventLabel ? (
                          <text className="map-car-event" x="0" y="-34" textAnchor="middle">
                            {car.eventLabel}
                          </text>
                        ) : null}
                      </g>
                      {car.progress === undefined ? (
                        reduceMotion ? null : <animateMotion path={renderD} dur={`${car.duration}s`} begin={`${car.delay}s`} keyPoints="0;1" keyTimes="0;1" calcMode="linear" repeatCount={car.repeatCount ?? circuit.laps} fill="freeze" rotate="auto" />
                      ) : null}
                    </g>
                  );
                })}
              </g>
            </g>
          </g>
        </svg>
        <small className="map-attribution">© OSM · CARTO</small>
        {showHeading || showTraits ? (
          <div className="map-info-stack">
            {showHeading ? (
              <div className="map-status">
                <span className="circuit-city">
                  <CountryBadge country={circuit.country} /> {circuit.city}
                </span>
                <strong>{tt(circuit.layoutKey)}</strong>
                <small className="map-laps-readout">
                  <VisualIcon name="laps" />
                  {circuit.laps} {tt("unit_laps")}
                </small>
                <small className="map-distance-readout">
                  <VisualIcon name="distance" />
                  {circuitDistanceLabel(circuit)}
                </small>
                <small className="map-weather-readout">
                  <VisualIcon name={displayWeather} />
                  <span>{tt(`weather_${displayWeather}` as TranslationKey)}</span>
                </small>
              </div>
            ) : null}
            {showTraits ? <MapTraitsPanel traits={circuit.traits} tt={tt} /> : null}
          </div>
        ) : null}
        {overlay}
      </div>
    </section>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function MapCarSprite({ asset = DEFAULT_CAR_ASSET, braking = false, maskId, transform }: { asset?: CarAsset; braking?: boolean; maskId: string; transform?: string }) {
  const geometry = carRenderGeometryForId(asset.id);
  const { image, bounds } = geometry;

  return (
    <g className="map-car-sprite" transform={transform}>
      <defs>
        <mask id={maskId} className="map-car-tint-mask">
          <g transform={`rotate(${image.rotation})`}>
            <image href={asset.top} x={image.x} y={image.y} width={image.width} height={image.height} />
          </g>
        </mask>
        <linearGradient id={`${maskId}-livery`} x1={bounds.x} y1="0" x2={bounds.x + bounds.width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="18%" className="map-car-livery-start" />
          <stop offset="62%" className="map-car-livery-mid" />
          <stop offset="100%" className="map-car-livery-end" />
        </linearGradient>
        {geometry.frontLights.map(([x, y], index) => (
          <linearGradient key={index} id={`${maskId}-headlight-${index}`} x1={x} y1={y} x2={x + 28} y2={y} gradientUnits="userSpaceOnUse">
            <stop offset="0" className="map-car-headlight-start" />
            <stop offset="1" className="map-car-headlight-end" />
          </linearGradient>
        ))}
        {geometry.rearLights.map(([x, y], index) => (
          <linearGradient key={index} id={`${maskId}-rear-light-${index}`} x1={x} y1={y} x2={x - 7} y2={y} gradientUnits="userSpaceOnUse">
            <stop offset="0" className="map-car-rear-light-start" />
            <stop offset="1" className="map-car-rear-light-end" />
          </linearGradient>
        ))}
      </defs>
      {geometry.frontLights.map(([x, y], index) => (
        <g key={index} className="map-car-headlight">
          <path d={`M${x} ${y} L${x + 24} ${y - 5} L${x + 24} ${y + 5} Z`} fill={`url(#${maskId}-headlight-${index})`} />
          <circle cx={x} cy={y} r="1.2" />
        </g>
      ))}
      {geometry.rearLights.map(([x, y], index) => (
        <g key={index} className={braking ? "map-car-rear-light braking" : "map-car-rear-light"}>
          <path d={`M${x} ${y} L${x - 7} ${y - 1.7} L${x - 7} ${y + 1.7} Z`} fill={`url(#${maskId}-rear-light-${index})`} />
          <circle cx={x} cy={y} r="0.9" />
        </g>
      ))}
      <rect className="map-car-stroke" x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} mask={`url(#${maskId})`} />
      <g transform={`rotate(${image.rotation})`}>
        <image className="map-car-detail" href={asset.top} x={image.x} y={image.y} width={image.width} height={image.height} />
      </g>
      <rect className="map-car-tint" x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} mask={`url(#${maskId})`} fill={`url(#${maskId}-livery)`} />
    </g>
  );
}

export function MapTraitsPanel({ traits, tt, impacts = {} }: { traits: MapTraitStats; tt: Translator; impacts?: MapTraitImpacts }) {
  const engineRows: Array<{ key: DecisionDeltaKey; label: TranslationKey; hint: TranslationKey }> = [
    { key: "pace", label: "engine_stat_pace", hint: "engine_stat_pace_hint" },
    { key: "control", label: "engine_stat_control", hint: "engine_stat_control_hint" },
    { key: "reliability", label: "engine_stat_reliability", hint: "engine_stat_reliability_hint" },
    { key: "weatherReadiness", label: "engine_stat_weather", hint: "engine_stat_weather_hint" },
    { key: "aggression", label: "engine_stat_aggression", hint: "engine_stat_aggression_hint" }
  ];
  const circuitRows: Array<{ key: keyof MapTraitStats; label: TranslationKey; hint: TranslationKey }> = [
    { key: "grip", label: "circuit_grip", hint: "circuit_grip_hint" },
    { key: "overtaking", label: "circuit_overtaking", hint: "circuit_overtaking_hint" },
    { key: "energy", label: "circuit_energy", hint: "circuit_energy_hint" }
  ];
  const hasPlanImpacts = Object.values(impacts).some((items) => items?.length);
  const rows = hasPlanImpacts ? engineRows : circuitRows;

  return (
    <div className={hasPlanImpacts ? "map-traits-panel engine-stats" : "map-traits-panel"}>
      {rows.map((row) => {
        const rowImpacts: MapTraitImpact[] = hasPlanImpacts ? impacts[row.key as DecisionDeltaKey] ?? [] : [];
        const impactValue = rowImpacts.reduce((total, impact) => total + impact.value, 0);
        const impactLabel = impactValue > 0 ? `+${impactValue}` : impactValue < 0 ? `${impactValue}` : "±0";
        const value = hasPlanImpacts ? 50 + impactValue : traits[row.key as keyof MapTraitStats];
        return (
          <span key={row.key} className={`map-trait-${row.key}`} title={[tt(row.hint), ...rowImpacts.map((impact) => `${impact.value > 0 ? "+" : ""}${impact.value} ${impact.label}`)].join("\n")}>
            <i aria-hidden="true">
              {hasPlanImpacts ? tt(row.label).charAt(0) : <VisualIcon name={row.key as keyof MapTraitStats} />}
            </i>
            <strong className="map-trait-value" style={{ "--trait-value": `${value}%` } as CSSProperties & Record<string, string>}>
              <span>{value}</span>
            </strong>
            <span className="trait-label">{tt(row.label)}</span>
            {hasPlanImpacts ? <em className={impactValue > 0 ? "bonus" : impactValue < 0 ? "weakness" : "neutral"}>{impactLabel}</em> : null}
          </span>
        );
      })}
    </div>
  );
}
