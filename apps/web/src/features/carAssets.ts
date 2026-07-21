export type CarAssetId = `car-${string}`;

export type CarAsset = {
  id: CarAssetId;
  name: string;
  sprite: string;
  top: string;
  side: string;
  metadata: string;
};

export const CAR_ASSETS: CarAsset[] = Array.from({ length: 16 }, (_, index) => {
  const id = `car-${String(index + 1).padStart(3, "0")}` as CarAssetId;
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
export const DEFAULT_CAR_ASSET = CAR_ASSET_BY_ID.get("car-008") ?? CAR_ASSETS[0]!;
export const DEFAULT_CAR_ASSET_INDEX = Math.max(0, CAR_ASSETS.findIndex((asset) => asset.id === DEFAULT_CAR_ASSET.id));

export function carAssetForId(id: string | undefined) {
  return (id && CAR_ASSET_BY_ID.get(id as CarAssetId)) || DEFAULT_CAR_ASSET;
}
