import { CAR_ASSET_IDS, DEFAULT_CAR_ASSET_ID, type CarAssetId } from "@cr-league/shared";
export type { CarAssetId } from "@cr-league/shared";

export type CarAsset = {
  id: CarAssetId;
  name: string;
  sprite: string;
  top: string;
  side: string;
  metadata: string;
};

type CarAssetPoint = [number, number];
type RawCarGeometry = {
  size: CarAssetPoint;
  front: [CarAssetPoint, CarAssetPoint];
  rear: [CarAssetPoint, CarAssetPoint];
  lights: [CarAssetPoint, CarAssetPoint];
};

export type CarRenderGeometry = {
  image: { x: number; y: number; width: number; height: number; rotation: number };
  bounds: { x: number; y: number; width: number; height: number };
  center: CarAssetPoint;
  rearWheels: [CarAssetPoint, CarAssetPoint];
  frontLights: [CarAssetPoint, CarAssetPoint];
  rearLights: [CarAssetPoint, CarAssetPoint];
  wheelbase: number;
};

const RAW_CAR_GEOMETRY: Record<CarAssetId, RawCarGeometry> = {
  "car-001": { size: [767, 384], front: [[114, 36], [114, 347]], rear: [[655, 36], [655, 348]], lights: [[55, 67], [54, 314]] },
  "car-002": { size: [753, 386], front: [[119, 31], [119, 354]], rear: [[648, 31], [648, 354]], lights: [[41, 77], [41, 307]] },
  "car-003": { size: [773, 396], front: [[128, 32], [128, 363]], rear: [[657, 32], [657, 365]], lights: [[48, 66], [48, 327]] },
  "car-004": { size: [865, 466], front: [[137, 58], [137, 413]], rear: [[726, 55], [726, 413]], lights: [[52, 125], [53, 342]] },
  "car-005": { size: [940, 468], front: [[159, 47], [159, 421]], rear: [[797, 48], [797, 420]], lights: [[57, 133], [65, 328]] },
  "car-006": { size: [791, 400], front: [[127, 36], [127, 363]], rear: [[660, 36], [660, 364]], lights: [[53, 80], [53, 318]] },
  "car-007": { size: [791, 404], front: [[126, 34], [126, 370]], rear: [[651, 34], [651, 370]], lights: [[61, 90], [61, 314]] },
  "car-008": { size: [977, 523], front: [[209, 69], [209, 454]], rear: [[806, 70], [806, 453]], lights: [[60, 164], [53, 360]] },
  "car-009": { size: [997, 466], front: [[198, 50], [198, 418]], rear: [[837, 53], [837, 414]], lights: [[60, 138], [60, 324]] },
  "car-010": { size: [843, 424], front: [[152, 38], [152, 384]], rear: [[688, 38], [688, 384]], lights: [[64, 70], [63, 345]] },
  "car-011": { size: [1214, 487], front: [[241, 30], [241, 457]], rear: [[958, 33], [958, 457]], lights: [[0, 91], [0, 406]] },
  "car-012": { size: [1037, 501], front: [[162, 39], [162, 466]], rear: [[825, 30], [825, 471]], lights: [[60, 103], [66, 425]] },
  "car-013": { size: [1155, 475], front: [[175, 197], [175, 273]], rear: [[924, 37], [924, 444]], lights: [[80, 113], [78, 370]] },
  "car-014": { size: [1104, 443], front: [[891, 31], [891, 413]], rear: [[223, 33], [223, 416]], lights: [[1103, 78], [1103, 372]] },
  "car-015": { size: [1178, 494], front: [[243, 32], [243, 463]], rear: [[942, 32], [942, 459]], lights: [[74, 121], [77, 378]] },
  "car-016": { size: [1214, 478], front: [[255, 35], [255, 439]], rear: [[979, 40], [979, 440]], lights: [[76, 134], [83, 334]] }
};

const RAW_REAR_LIGHTS: Record<CarAssetId, [CarAssetPoint, CarAssetPoint]> = {
  "car-001": [[737, 101], [736, 285]],
  "car-002": [[714, 89], [713, 297]],
  "car-003": [[717, 78], [717, 318]],
  "car-004": [[803, 96], [802, 369]],
  "car-005": [[880, 93], [881, 375]],
  "car-006": [[735, 94], [739, 308]],
  "car-007": [[725, 85], [725, 319]],
  "car-008": [[941, 111], [942, 412]],
  "car-009": [[932, 83], [932, 385]],
  "car-010": [[770, 86], [770, 334]],
  "car-011": [[1213, 75], [1213, 413]],
  "car-012": [[1036, 76], [1036, 424]],
  "car-013": [[1154, 74], [1154, 403]],
  "car-014": [[0, 73], [0, 376]],
  "car-015": [[1061, 49], [1177, 410]],
  "car-016": [[1124, 173], [1125, 298]]
};

export const CAR_ASSETS: CarAsset[] = CAR_ASSET_IDS.map((id, index) => {
  return {
    id,
    name: `CRL ${String(index + 1).padStart(3, "0")}`,
    sprite: `/assets/cars/idle.png?v=crl-v2-${id}`,
    top: `/assets/cars/crl-v2/${id}/top.png`,
    side: `/assets/cars/crl-v2/${id}/side.png`,
    metadata: `/assets/cars/crl-v2/${id}/metadata.json`
  };
});

export const CAR_ASSET_BY_ID = new Map(CAR_ASSETS.map((asset) => [asset.id, asset]));
export const DEFAULT_CAR_ASSET = CAR_ASSET_BY_ID.get(DEFAULT_CAR_ASSET_ID) ?? CAR_ASSETS[0]!;
export const DEFAULT_CAR_ASSET_INDEX = Math.max(0, CAR_ASSETS.findIndex((asset) => asset.id === DEFAULT_CAR_ASSET.id));

export function carAssetForId(id: string | undefined) {
  return (id && CAR_ASSET_BY_ID.get(id as CarAssetId)) || DEFAULT_CAR_ASSET;
}

const CAR_RENDER_GEOMETRY = new Map<CarAssetId, CarRenderGeometry>();

export function carRenderGeometryForId(id: string | undefined): CarRenderGeometry {
  const asset = carAssetForId(id);
  const cached = CAR_RENDER_GEOMETRY.get(asset.id);
  if (cached) return cached;

  const raw = (RAW_CAR_GEOMETRY[asset.id] ?? RAW_CAR_GEOMETRY[DEFAULT_CAR_ASSET.id])!;
  const midpoint = (points: [CarAssetPoint, CarAssetPoint]): CarAssetPoint => [
    (points[0][0] + points[1][0]) / 2,
    (points[0][1] + points[1][1]) / 2
  ];
  const front = midpoint(raw.front);
  const rear = midpoint(raw.rear);
  const rawWheelbase = Math.hypot(front[0] - rear[0], front[1] - rear[1]);
  const wheelbase = 20 * Math.max(0.9, Math.min(1.1, rawWheelbase / 620));
  const scale = wheelbase / rawWheelbase;
  const heading = Math.atan2(front[1] - rear[1], front[0] - rear[0]);
  const rotation = -heading;
  const transformPoint = ([x, y]: CarAssetPoint): CarAssetPoint => {
    const dx = (x - front[0]) * scale;
    const dy = (y - front[1]) * scale;
    return [
      dx * Math.cos(rotation) - dy * Math.sin(rotation),
      dx * Math.sin(rotation) + dy * Math.cos(rotation)
    ];
  };
  const corners = [[0, 0], [raw.size[0], 0], [0, raw.size[1]], raw.size].map((point) => transformPoint(point as CarAssetPoint));
  const minX = Math.min(...corners.map(([x]) => x));
  const maxX = Math.max(...corners.map(([x]) => x));
  const minY = Math.min(...corners.map(([, y]) => y));
  const maxY = Math.max(...corners.map(([, y]) => y));
  const geometry: CarRenderGeometry = {
    image: {
      x: -front[0] * scale,
      y: -front[1] * scale,
      width: raw.size[0] * scale,
      height: raw.size[1] * scale,
      rotation: rotation * 180 / Math.PI
    },
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    center: transformPoint([raw.size[0] / 2, raw.size[1] / 2]),
    rearWheels: raw.rear.map(transformPoint) as [CarAssetPoint, CarAssetPoint],
    frontLights: raw.lights.map(transformPoint) as [CarAssetPoint, CarAssetPoint],
    rearLights: (RAW_REAR_LIGHTS[asset.id] ?? RAW_REAR_LIGHTS[DEFAULT_CAR_ASSET.id]!).map(transformPoint) as [CarAssetPoint, CarAssetPoint],
    wheelbase
  };
  CAR_RENDER_GEOMETRY.set(asset.id, geometry);
  return geometry;
}
