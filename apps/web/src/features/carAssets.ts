export type CarAssetId = "car-001";

export type CarAsset = {
  id: CarAssetId;
  name: string;
  sprite: string;
  top: string;
  side: string;
  metadata: string;
};

export const CAR_ASSETS: CarAsset[] = [
  {
    id: "car-001",
    name: "CRL 001",
    sprite: "/assets/cars/idle.png?v=crl-v2-car-001",
    top: "/assets/cars/crl-v2/car-001/top.png",
    side: "/assets/cars/crl-v2/car-001/side.png",
    metadata: "/assets/cars/crl-v2/car-001/metadata.json"
  }
];

export const DEFAULT_CAR_ASSET = CAR_ASSETS[0]!;
