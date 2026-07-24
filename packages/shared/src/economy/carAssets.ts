export const CAR_ASSET_IDS = [
  "car-001", "car-002", "car-003", "car-004", "car-005", "car-006", "car-007",
  "car-008", "car-009", "car-010",
  "car-011", "car-012", "car-013",
  "car-014", "car-015", "car-016"
] as const;

export type CarAssetId = typeof CAR_ASSET_IDS[number];

export const DEFAULT_CAR_ASSET_ID: CarAssetId = "car-001";

export const CAR_ASSET_PRICES: Record<CarAssetId, number> = {
  "car-001": 0,
  "car-002": 0,
  "car-003": 0,
  "car-004": 0,
  "car-005": 0,
  "car-006": 0,
  "car-007": 0,
  "car-008": 1_000,
  "car-009": 1_000,
  "car-010": 1_000,
  "car-011": 2_000,
  "car-012": 2_000,
  "car-013": 2_000,
  "car-014": 3_000,
  "car-015": 3_000,
  "car-016": 3_000
};

export function isCarAssetId(value: string): value is CarAssetId {
  return CAR_ASSET_IDS.includes(value as CarAssetId);
}

export function carAssetPrice(id: CarAssetId) {
  return CAR_ASSET_PRICES[id];
}
