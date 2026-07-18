import { useEffect, useRef, type Ref } from "react";
import type { CSSProperties } from "react";
import type { TeamLivery } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
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
  repeatCount?: number | "indefinite";
};

export type MapTraitStats = {
  grip: number;
  overtaking: number;
  energy: number;
};

export type MapTraitImpacts = Partial<Record<keyof MapTraitStats, string[]>>;

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
const MAX_DRIFT_ANGLE = 14;
type CameraZoomMode = "normal" | "traffic" | "close";
export type CarSprite = "idle" | "boost" | "brake";

const CAR_SPRITES: Record<CarSprite, string> = {
  idle: "/assets/cars/idle.png",
  boost: "/assets/cars/boost.png",
  brake: "/assets/cars/brake.png"
};
const CAR_SPRITE_ANCHOR: Record<CarSprite, { x: number; y: number }> = {
  idle: { x: 0, y: 0 },
  boost: { x: 0, y: -0.35 },
  brake: { x: 0.35, y: -0.35 }
};
const CAR_SPRITE_BOX = { x: -12, y: -18, width: 24, height: 36 };

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
    d: points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" "),
    start: points[0] ?? { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 }
  };
}

function poseOnRoute(points: Array<{ x: number; y: number }>, progress: number) {
  if (!points.length) return { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2, angle: 0 };
  const segments = points.slice(1).map((point, index) => ({
    from: points[index]!,
    to: point,
    length: Math.hypot(point.x - points[index]!.x, point.y - points[index]!.y)
  }));
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

function routeLength(points: Array<{ x: number; y: number }>) {
  return points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index]!.x, point.y - points[index]!.y), 0);
}

function startFinishLine(points: Array<{ x: number; y: number }>) {
  const start = points[0] ?? { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 };
  const next = points.find((point) => Math.hypot(point.x - start.x, point.y - start.y) > 0.1) ?? { x: start.x + 1, y: start.y };
  const angle = Math.atan2(next.y - start.y, next.x - start.x) + Math.PI / 2;
  const halfLength = 10;
  const dx = Math.cos(angle) * halfLength;
  const dy = Math.sin(angle) * halfLength;

  return {
    x1: start.x - dx,
    y1: start.y - dy,
    x2: start.x + dx,
    y2: start.y + dy
  };
}

export function circuitDisplayLength(circuit: CityCircuit) {
  return routeLength(circuitScene(circuit).points);
}

function angleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function driftAngle(points: Array<{ x: number; y: number }>, progress: number) {
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
  showTraits = true
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
}) {
  const { zoom, tiles, points, d, start } = circuitScene(circuit);
  const cameraRef = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const carsRef = useRef(cars);
  const pointsRef = useRef(points);
  const clockRef = useRef(0);
  const zoomRef = useRef(FOCUS_ZOOM);
  const zoomModeRef = useRef<CameraZoomMode>("normal");
  const markerScale = camera?.enabled ? 1 / FOCUS_ZOOM : 1;
  const hasCars = cars.length > 0;
  const replayStart = startFinishLine(points);
  carsRef.current = cars;
  pointsRef.current = points;

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
      const point = car.progress === undefined ? route.getPointAtLength(length * progress) : poseOnRoute(pointsRef.current, progress);
      const nearestCarDistance = Math.min(
        ...carsRef.current.map((other) => {
          if (other.id === car.id || other.progress === undefined) return Number.POSITIVE_INFINITY;
          const otherPoint = poseOnRoute(pointsRef.current, other.progress);
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
  }, [camera?.enabled, camera?.car, camera?.timeRef, circuit.laps]);

  return (
    <section
      className={`${framed ? "circuit-map" : "circuit-map circuit-map-unframed"}${className ? ` ${className}` : ""}`}
      aria-label={tt("city_circuit_map")}
    >
      {showHeading ? (
        <div className="circuit-map-heading">
          <span className="circuit-city">
            <CountryBadge country={circuit.country} /> {circuit.city}
          </span>
          <strong>{tt(circuit.layoutKey)}</strong>
          <small>
            {circuit.laps} {tt("unit_laps")} · {tt(`weather_${circuit.likelyWeather}` as TranslationKey)}
          </small>
        </div>
      ) : null}
      <div className="circuit-map-stage">
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g ref={cameraRef} className="circuit-camera">
            {tiles.map((tile) => (
              <image
                key={`${tile.x}-${tile.y}`}
                className="circuit-map-tile"
                href={`https://basemaps.cartocdn.com/dark_nolabels/${zoom}/${tile.x}/${tile.y}.png`}
                x={tile.left}
                y={tile.top}
                width={TILE_SIZE}
                height={TILE_SIZE}
              />
            ))}
            <path ref={routeRef} className={hasCars ? "circuit-route-glow replay-muted-glow" : "circuit-route-glow"} d={d} />
            <path className={hasCars ? "circuit-route-asphalt replay-muted-asphalt" : "circuit-route-asphalt"} d={d} />
            <path className={hasCars ? "circuit-route-edge replay-muted-route" : "circuit-route-edge"} d={d} />
            <path className={hasCars ? "circuit-route-accent replay-muted-route" : "circuit-route-accent"} d={d} />
            {hasCars ? (
              <line className="circuit-start-line" x1={replayStart.x1} y1={replayStart.y1} x2={replayStart.x2} y2={replayStart.y2} />
            ) : (
              <circle className="circuit-start" cx={start.x} cy={start.y} r="9" />
            )}
            {/* SVG z-order is document order: render the player's car last so it always sits on top. */}
            {[...cars].sort((a, b) => Number(a.player) - Number(b.player)).map((car) => {
              const pose = car.progress === undefined ? null : poseOnRoute(points, car.progress);
              const drift = car.progress === undefined ? 0 : driftAngle(points, car.progress);
              const sprite = spriteForCar(car);
              const carStyle = car.livery
                ? ({ "--car-primary": car.livery.primary, "--car-secondary": car.livery.secondary } as CSSProperties & Record<string, string>)
                : undefined;
              return (
                <g key={car.id} className={car.player ? "map-car player" : "map-car"} style={carStyle} transform={pose ? `translate(${pose.x} ${pose.y})` : undefined}>
                  <g className="map-car-marker" transform={`scale(${markerScale})`}>
                    <MapCarSprite sprite={sprite} maskId={`car-sprite-mask-${car.id}`} transform={pose ? `rotate(${pose.angle + drift + 90})` : "rotate(90)"} />
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
                  </g>
                  {car.progress === undefined ? (
                    <animateMotion path={d} dur={`${car.duration}s`} begin={`${car.delay}s`} repeatCount={car.repeatCount ?? circuit.laps} fill="freeze" rotate="auto" />
                  ) : null}
                </g>
              );
            })}
          </g>
        </svg>
        <small className="map-attribution">© OSM · CARTO</small>
        {overlay}
      </div>
      {showTraits ? <MapTraitsPanel traits={circuit.traits} tt={tt} /> : null}
    </section>
  );
}

export function MapCarSprite({ maskId, sprite, transform }: { maskId: string; sprite: CarSprite; transform?: string }) {
  const anchor = CAR_SPRITE_ANCHOR[sprite];

  return (
    <g className="map-car-sprite" transform={transform}>
      <defs>
        <mask id={maskId} className="map-car-tint-mask">
          <image href={CAR_SPRITES[sprite]} x={CAR_SPRITE_BOX.x + anchor.x} y={CAR_SPRITE_BOX.y + anchor.y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} preserveAspectRatio="xMidYMid meet" />
        </mask>
      </defs>
      <rect className="map-car-tint" x={CAR_SPRITE_BOX.x + anchor.x} y={CAR_SPRITE_BOX.y + anchor.y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} mask={`url(#${maskId})`} />
      <image className="map-car-detail" href={CAR_SPRITES[sprite]} x={CAR_SPRITE_BOX.x + anchor.x} y={CAR_SPRITE_BOX.y + anchor.y} width={CAR_SPRITE_BOX.width} height={CAR_SPRITE_BOX.height} preserveAspectRatio="xMidYMid meet" />
      <rect className="map-car-accent" x="-4" y={CAR_SPRITE_BOX.y + anchor.y} width="8" height={CAR_SPRITE_BOX.height} mask={`url(#${maskId})`} />
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
        return (
          <span key={row.key} className={`map-trait-${row.key}`} title={[tt(row.hint), ...rowImpacts].join("\n")}>
            <i aria-hidden="true">
              <VisualIcon name={row.key} />
            </i>
            <strong className="map-trait-value" style={{ "--trait-value": `${traits[row.key]}%` } as CSSProperties & Record<string, string>}>
              <span>{traits[row.key]}</span>
            </strong>
            <span className="trait-label">{tt(row.label)}</span>
            {rowImpacts.length ? <em>+{rowImpacts.length}</em> : null}
          </span>
        );
      })}
    </div>
  );
}
