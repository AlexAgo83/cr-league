import { useEffect, useRef, type Ref } from "react";
import type { CSSProperties } from "react";
import type { TeamLivery, Weather } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { circuitDistanceLabel, type CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import { DEFAULT_CAR_ASSET, carAssetForId } from "./carAssets.js";
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
  repeatCount?: number | "indefinite";
};

export type MapTraitStats = {
  grip: number;
  overtaking: number;
  energy: number;
};

export type MapTraitImpact = { label: string; value: number };
export type MapTraitImpacts = Partial<Record<keyof MapTraitStats, MapTraitImpact[]>>;

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
const MAX_DRIFT_ANGLE = 14;
const STRAIGHT_TURN_TOLERANCE_DEG = 18;
const ROUTE_FIT_PADDING = 58;
const ROUTE_STROKES = {
  glow: 22,
  asphalt: 12,
  edge: 2.5,
  accent: 4
};
type CameraZoomMode = "normal" | "traffic" | "close";
export type CarSprite = "idle" | "boost" | "brake";
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
export type CircuitRouteAnalysis = {
  startLine: { x1: number; y1: number; x2: number; y2: number };
  startProgress: number;
  pitProgress: number;
  pitStop: RoutePose;
  longestStraight: { startProgress: number; endProgress: number; length: number };
};

const CAR_SPRITES: Record<CarSprite, string> = {
  idle: DEFAULT_CAR_ASSET.top,
  boost: DEFAULT_CAR_ASSET.top,
  brake: DEFAULT_CAR_ASSET.top
};
const CAR_SPRITE_ANCHOR: Record<CarSprite, { x: number; y: number }> = {
  idle: { x: 0, y: 0 },
  boost: { x: 0, y: 0 },
  brake: { x: 0, y: 0 }
};
const CAR_SPRITE_BOX = { x: -17, y: -8.8, width: 34, height: 17.65 };

function spriteForCar(car: MapCar): CarSprite {
  if ((car.positionDelta ?? 0) > 0) return "boost";
  if ((car.positionDelta ?? 0) < 0) return "brake";
  return "idle";
}

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
  const segments = routeSegments(points);
  const total = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;
  let distance = (((progress % 1) + 1) % 1) * total;

  for (const segment of segments) {
    if (distance <= segment.length) {
      const ratio = segment.length ? distance / segment.length : 0;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
        y: segment.from.y + (segment.to.y - segment.from.y) * ratio,
        angle: Math.atan2(segment.to.y - segment.from.y, segment.to.x - segment.from.x) * 180 / Math.PI
      };
    }
    distance -= segment.length;
  }

  return { ...points[0]!, angle: 0 };
}

function routeLength(points: RoutePoint[]) {
  return points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index]!.x, point.y - points[index]!.y), 0);
}

function routeSegments(points: RoutePoint[]): RouteSegment[] {
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

export function analyzeCircuitRoute(points: RoutePoint[]): CircuitRouteAnalysis {
  const segments = routeSegments(points).filter((segment) => segment.length > 0.1);
  const total = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;
  if (!segments.length) {
    const pose = { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2, angle: 0 };
    return { startLine: routeLineAt(pose), startProgress: 0, pitProgress: 0, pitStop: pose, longestStraight: { startProgress: 0, endProgress: 0, length: 0 } };
  }

  let best = { start: segments[0]!, count: 1, length: segments[0]!.length };
  for (let startIndex = 0; startIndex < segments.length; startIndex += 1) {
    let length = segments[startIndex]!.length;
    let count = 1;
    for (; count < segments.length; count += 1) {
      const previous = segments[(startIndex + count - 1) % segments.length]!;
      const next = segments[(startIndex + count) % segments.length]!;
      if (Math.abs(angleDelta(previous.angle * 180 / Math.PI, next.angle * 180 / Math.PI)) > STRAIGHT_TURN_TOLERANCE_DEG) break;
      length += next.length;
    }
    if (length > best.length) best = { start: segments[startIndex]!, count, length };
  }

  const startDistance = best.start.startDistance;
  const endDistance = segments[(segments.indexOf(best.start) + best.count - 1) % segments.length]!.endDistance;
  const straightStart = startDistance / total;
  const straightEnd = (startDistance + best.length) / total;
  const pitProgress = (straightStart + (best.length / total) * 0.18) % 1;
  const lineProgress = (straightStart + (best.length / total) * 0.88) % 1;

  return {
    startLine: routeLineAt(poseOnRoute(points, lineProgress)),
    startProgress: lineProgress,
    pitProgress,
    pitStop: poseOnRoute(points, pitProgress),
    longestStraight: {
      startProgress: straightStart,
      endProgress: endDistance >= startDistance ? endDistance / total : straightEnd % 1,
      length: best.length
    }
  };
}

export function circuitDisplayLength(circuit: CityCircuit) {
  return routeLength(circuitScene(circuit).points);
}

export function circuitRouteAnalysis(circuit: CityCircuit) {
  return analyzeCircuitRoute(circuitScene(circuit).points);
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
  return Math.max(-MAX_DRIFT_ANGLE, Math.min(MAX_DRIFT_ANGLE, angleDelta(before, after) * 0.45));
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
  className,
  showHeading = true,
  framed = true,
  showTraits = true,
  weather
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
  className?: string;
  showHeading?: boolean;
  framed?: boolean;
  showTraits?: boolean;
  weather?: Weather;
}) {
  const { zoom, tiles, points, d } = circuitScene(circuit);
  const cameraRef = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const carsRef = useRef(cars);
  const pointsRef = useRef(points);
  const clockRef = useRef(0);
  const zoomRef = useRef(FOCUS_ZOOM);
  const zoomModeRef = useRef<CameraZoomMode>("normal");
  const focusEnabled = Boolean(camera?.enabled && camera.car);
  const markerScale = focusEnabled ? 1 / FOCUS_ZOOM : 0.62;
  const hasCars = cars.length > 0;
  const mapFit = focusEnabled ? null : routeFitTransform(points);
  const mapTransform = mapFit?.value;
  const routeDecorScale = Math.max(1, mapFit?.scale ?? 1);
  const routeDecorStyle = {
    "--route-glow-width": `${ROUTE_STROKES.glow / routeDecorScale}`,
    "--route-asphalt-width": `${ROUTE_STROKES.asphalt / routeDecorScale}`,
    "--route-edge-width": `${ROUTE_STROKES.edge / routeDecorScale}`,
    "--route-accent-width": `${ROUTE_STROKES.accent / routeDecorScale}`
  } as CSSProperties;
  const renderPoints = points;
  const renderD = d;
  const routeAnalysis = analyzeCircuitRoute(renderPoints);
  const stageProgress = (progress: number) => progressFromStart(progress, routeAnalysis.startProgress);
  const displayWeather = weather ?? circuit.likelyWeather;
  carsRef.current = cars;
  pointsRef.current = renderPoints;

  useEffect(() => {
    const cameraGroup = cameraRef.current;
    const route = routeRef.current;
    const car = camera?.car;
    if (!cameraGroup || !route || !camera?.enabled || !car || !route.getTotalLength) {
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
      clockRef.current = camera.timeRef?.current ?? (performance.now() - startedAt) / 1000;
      const elapsed = Math.max(0, clockRef.current - car.delay);
      const progress = car.progress ?? (car.repeatCount !== "indefinite" && clockRef.current >= car.delay + car.duration * circuit.laps ? 1 : (elapsed % car.duration) / car.duration);
      const stagedProgress = progressFromStart(progress, routeAnalysis.startProgress);
      const point = car.progress === undefined ? route.getPointAtLength(length * stagedProgress) : poseOnRoute(pointsRef.current, stagedProgress);
      const nearestCarDistance = Math.min(
        ...carsRef.current.map((other) => {
          if (other.id === car.id || other.progress === undefined) return Number.POSITIVE_INFINITY;
          const otherPoint = poseOnRoute(pointsRef.current, progressFromStart(other.progress, routeAnalysis.startProgress));
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
  }, [camera?.enabled, camera?.car, camera?.timeRef, circuit.laps, routeAnalysis.startProgress]);

  return (
    <section
      className={`${framed ? "circuit-map" : "circuit-map circuit-map-unframed"}${className ? ` ${className}` : ""}${weather ? ` circuit-weather-${weather}` : ""}`}
      aria-label={tt("city_circuit_map")}
    >
      <div className="circuit-map-stage">
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g ref={cameraRef} className="circuit-camera">
            <g className="circuit-map-content" transform={mapTransform}>
              {tiles.map((tile) => (
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
              ))}
              <g className="circuit-route-layer" style={routeDecorStyle}>
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
                {/* SVG z-order is document order: render the player's car last so it always sits on top. */}
                {[...cars].sort((a, b) => Number(a.player) - Number(b.player)).map((car) => {
                  const pose = car.progress === undefined ? null : poseOnRoute(renderPoints, stageProgress(car.progress));
                  const drift = car.progress === undefined ? 0 : driftAngle(renderPoints, stageProgress(car.progress));
                  const sprite = spriteForCar(car);
                  const carStyle = car.livery
                    ? ({ "--car-primary": car.livery.primary, "--car-secondary": car.livery.secondary } as CSSProperties & Record<string, string>)
                    : undefined;
                  return (
                    <g key={car.id} className={car.player ? "map-car player" : "map-car"} style={carStyle} transform={pose ? `translate(${pose.x} ${pose.y})` : undefined}>
                      <g className="map-car-marker" transform={`scale(${markerScale})`}>
                        <MapCarSprite asset={carAssetForId(car.livery?.carAssetId).top} sprite={sprite} maskId={`car-sprite-mask-${car.id}`} transform={pose ? `rotate(${pose.angle + drift + 180})` : "rotate(180)"} />
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
                        <animateMotion path={renderD} dur={`${car.duration}s`} begin={`${car.delay}s`} keyPoints={`${routeAnalysis.startProgress};1;${routeAnalysis.startProgress}`} keyTimes={`0;${1 - routeAnalysis.startProgress};1`} calcMode="linear" repeatCount={car.repeatCount ?? circuit.laps} fill="freeze" rotate="auto" />
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

export function MapCarSprite({ asset, maskId, sprite, transform }: { asset?: string; maskId: string; sprite: CarSprite; transform?: string }) {
  const anchor = CAR_SPRITE_ANCHOR[sprite];
  const carAsset = asset ?? CAR_SPRITES[sprite];

  return (
    <g className="map-car-sprite" transform={transform}>
      <defs>
        <mask id={maskId} className="map-car-tint-mask">
          <image href={carAsset} x={CAR_SPRITE_BOX.x + anchor.x} y={CAR_SPRITE_BOX.y + anchor.y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} preserveAspectRatio="xMidYMid meet" />
        </mask>
        <linearGradient id={`${maskId}-livery`} x1={CAR_SPRITE_BOX.x} y1="0" x2={CAR_SPRITE_BOX.x + CAR_SPRITE_BOX.width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="18%" className="map-car-livery-start" />
          <stop offset="62%" className="map-car-livery-mid" />
          <stop offset="100%" className="map-car-livery-end" />
        </linearGradient>
      </defs>
      {([
        [-0.6, 0],
        [0.6, 0],
        [0, -0.6],
        [0, 0.6]
      ] as Array<[number, number]>).map(([x, y]) => (
        <rect key={`${x}-${y}`} className="map-car-stroke" x={CAR_SPRITE_BOX.x + anchor.x + x} y={CAR_SPRITE_BOX.y + anchor.y + y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} mask={`url(#${maskId})`} />
      ))}
      <image className="map-car-detail" href={carAsset} x={CAR_SPRITE_BOX.x + anchor.x} y={CAR_SPRITE_BOX.y + anchor.y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} preserveAspectRatio="xMidYMid meet" />
      <rect className="map-car-tint" x={CAR_SPRITE_BOX.x + anchor.x} y={CAR_SPRITE_BOX.y + anchor.y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} mask={`url(#${maskId})`} fill={`url(#${maskId}-livery)`} />
    </g>
  );
}

export function MapTraitsPanel({ traits, tt, impacts = {} }: { traits: MapTraitStats; tt: Translator; impacts?: MapTraitImpacts }) {
  const rows: Array<{ key: keyof MapTraitStats; label: TranslationKey; hint: TranslationKey }> = [
    { key: "grip", label: "circuit_grip", hint: "circuit_grip_hint" },
    { key: "overtaking", label: "circuit_overtaking", hint: "circuit_overtaking_hint" },
    { key: "energy", label: "circuit_energy", hint: "circuit_energy_hint" }
  ];

  return (
    <div className="map-traits-panel">
      {rows.map((row) => {
        const rowImpacts = impacts[row.key] ?? [];
        const impactValue = rowImpacts.reduce((total, impact) => total + impact.value, 0);
        const impactLabel = impactValue > 0 ? `+${impactValue}` : impactValue < 0 ? `${impactValue}` : "±0";
        return (
          <span key={row.key} className={`map-trait-${row.key}`} title={[tt(row.hint), ...rowImpacts.map((impact) => `${impact.value > 0 ? "+" : ""}${impact.value} ${impact.label}`)].join("\n")}>
            <i aria-hidden="true">
              <VisualIcon name={row.key} />
            </i>
            <strong className="map-trait-value" style={{ "--trait-value": `${traits[row.key]}%` } as CSSProperties & Record<string, string>}>
              <span>{traits[row.key]}</span>
            </strong>
            <span className="trait-label">{tt(row.label)}</span>
            {rowImpacts.length ? <em className={impactValue > 0 ? "bonus" : impactValue < 0 ? "weakness" : "neutral"}>{impactLabel}</em> : null}
          </span>
        );
      })}
    </div>
  );
}
