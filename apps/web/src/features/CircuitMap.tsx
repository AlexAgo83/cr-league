import { useEffect, useRef, type Ref } from "react";
import type { CSSProperties } from "react";
import type { TeamLivery } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { countryFlag, type CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";

export type MapCar = {
  id: string;
  label: string;
  player: boolean;
  delay: number;
  duration: number;
  progress?: number;
  livery?: TeamLivery;
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
const FOCUS_ZOOM = 2.15;

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
    d: points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") + " Z",
    start: points[0] ?? { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 }
  };
}

function pointOnRoute(points: Array<{ x: number; y: number }>, progress: number) {
  if (!points.length) return { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 };
  const closed = [...points, points[0]!];
  const segments = closed.slice(1).map((point, index) => ({
    from: closed[index]!,
    to: point,
    length: Math.hypot(point.x - closed[index]!.x, point.y - closed[index]!.y)
  }));
  const total = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;
  let distance = (((progress % 1) + 1) % 1) * total;

  for (const segment of segments) {
    if (distance <= segment.length) {
      const ratio = segment.length ? distance / segment.length : 0;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
        y: segment.from.y + (segment.to.y - segment.from.y) * ratio
      };
    }
    distance -= segment.length;
  }

  return points[0]!;
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
    timeRef: React.RefObject<number>;
  };
  className?: string;
  showHeading?: boolean;
  framed?: boolean;
  showTraits?: boolean;
}) {
  const { zoom, tiles, points, d, start } = circuitScene(circuit);
  const cameraRef = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const markerScale = camera?.enabled ? 1 / FOCUS_ZOOM : 1;

  useEffect(() => {
    const cameraGroup = cameraRef.current;
    const route = routeRef.current;
    const car = camera?.car;
    if (!cameraGroup || !route || !camera?.enabled || !car || !route.getTotalLength) {
      cameraGroup?.removeAttribute("transform");
      return;
    }

    const length = route.getTotalLength();
    const focusX = VIEW_WIDTH / 2;
    const focusY = VIEW_HEIGHT / 2;
    let frame = requestAnimationFrame(function tick() {
      const elapsed = Math.max(0, camera.timeRef.current - car.delay);
      const progress = car.progress ?? (camera.timeRef.current >= car.delay + car.duration * circuit.laps ? 1 : (elapsed % car.duration) / car.duration);
      const point = car.progress === undefined ? route.getPointAtLength(length * progress) : pointOnRoute(points, progress);
      cameraGroup.setAttribute("transform", `translate(${focusX} ${focusY}) scale(${FOCUS_ZOOM}) translate(${-point.x} ${-point.y})`);
      frame = requestAnimationFrame(tick);
    });

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
            {countryFlag(circuit.country)} {circuit.city}
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
            <path ref={routeRef} className="circuit-route-glow" d={d} />
            <path className="circuit-route-asphalt" d={d} />
            <path className="circuit-route-edge" d={d} />
            <path className="circuit-route-accent" d={d} />
            <circle className="circuit-start" cx={start.x} cy={start.y} r="9" />
            {/* SVG z-order is document order: render the player's car last so it always sits on top. */}
            {[...cars].sort((a, b) => Number(a.player) - Number(b.player)).map((car) => {
              const point = car.progress === undefined ? null : pointOnRoute(points, car.progress);
              const carStyle = car.livery
                ? ({ "--car-primary": car.livery.primary, "--car-secondary": car.livery.secondary } as CSSProperties & Record<string, string>)
                : undefined;
              return (
                <g key={car.id} className={car.player ? "map-car player" : "map-car"} style={carStyle} transform={point ? `translate(${point.x} ${point.y})` : undefined}>
                  <g transform={`scale(${markerScale})`}>
                    <circle r="10" />
                    <text textAnchor="middle" dominantBaseline="central">
                      {car.label}
                    </text>
                  </g>
                  {car.progress === undefined ? (
                    <animateMotion path={d} dur={`${car.duration}s`} begin={`${car.delay}s`} repeatCount={circuit.laps} fill="freeze" />
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
          <span key={row.key} title={[tt(row.hint), ...rowImpacts].join("\n")}>
            <strong>{traits[row.key]}</strong>
            <span className="trait-label">{tt(row.label)}</span>
            {rowImpacts.length ? <em>+{rowImpacts.length}</em> : null}
          </span>
        );
      })}
    </div>
  );
}
