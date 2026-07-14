import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";

export type MapCar = {
  id: string;
  label: string;
  player: boolean;
  delay: number;
  duration: number;
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 560;
const PADDING = 70;
const TILE_SIZE = 256;

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

  while (zoom > 10 && (bounds.maxX - bounds.minX > VIEW_WIDTH - PADDING * 2 || bounds.maxY - bounds.minY > VIEW_HEIGHT - PADDING * 2)) {
    zoom -= 1;
    projected = circuit.route.map((point) => projectLatLng(point, zoom));
    bounds = boundsOf(projected);
  }

  const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
  const originX = center.x - VIEW_WIDTH / 2;
  const originY = center.y - VIEW_HEIGHT / 2;
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
    d: points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") + " Z",
    start: points[0] ?? { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 }
  };
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
  cars = []
}: {
  circuit: CityCircuit;
  tt: Translator;
  cars?: MapCar[];
}) {
  const { zoom, tiles, d, start } = circuitScene(circuit);

  return (
    <section className="circuit-map" aria-label={tt("city_circuit_map")}>
      <div className="circuit-map-heading">
        <span className="circuit-city">{circuit.city}</span>
        <strong>{tt(circuit.layoutKey)}</strong>
        <small>
          {circuit.country} · {circuit.laps} {tt("unit_laps")} · {tt(`weather_${circuit.likelyWeather}` as TranslationKey)}
        </small>
      </div>
      <div className="circuit-map-stage">
        <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
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
          <path className="circuit-route-glow" d={d} />
          <path className="circuit-route-asphalt" d={d} />
          <path className="circuit-route-edge" d={d} />
          <path className="circuit-route-accent" d={d} />
          <circle className="circuit-start" cx={start.x} cy={start.y} r="9" />
          {cars.map((car) => (
            <g key={car.id} className={car.player ? "map-car player" : "map-car"}>
              <circle r="16" />
              <text textAnchor="middle" dominantBaseline="central">
                {car.label}
              </text>
              <animateMotion path={d} dur={`${car.duration}s`} begin={`${car.delay}s`} repeatCount="indefinite" />
            </g>
          ))}
        </svg>
        <small className="map-attribution">© OpenStreetMap · © CARTO</small>
      </div>
      <div className="circuit-traits">
        <span>
          {tt("circuit_grip")} {circuit.traits.grip}
        </span>
        <span>
          {tt("circuit_overtaking")} {circuit.traits.overtaking}
        </span>
        <span>
          {tt("circuit_energy")} {circuit.traits.energy}
        </span>
      </div>
    </section>
  );
}
