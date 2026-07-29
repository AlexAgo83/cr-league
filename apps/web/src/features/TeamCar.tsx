import type { CSSProperties, ReactNode } from "react";
import type { TeamLivery } from "@cr-league/shared";
import { AssetImage } from "./AssetImage.js";
import { CAR_ASSET_BY_ID, DEFAULT_CAR_ASSET, type CarAssetId } from "./carAssets.js";

/**
 * A team's car in its own colours: the sprite goes through in luminosity so the livery gradient
 * over it reads as paint, and the primary colour outlines it. Extracted from the garage so the
 * save slots paint their car exactly the same way rather than approximating it.
 */
export function TeamCar({
  children,
  className = "",
  livery,
  locked = false,
  view = "side"
}: {
  children?: ReactNode;
  className?: string;
  livery: TeamLivery;
  locked?: boolean;
  view?: "top" | "side";
}) {
  // A stored id can name a skin this build no longer ships, so the default is a real fallback.
  const asset = CAR_ASSET_BY_ID.get(livery.carAssetId as CarAssetId) ?? DEFAULT_CAR_ASSET;
  const src = view === "top" ? asset.top : asset.side;
  const style = {
    "--garage-car-secondary": livery.secondary,
    "--garage-car-stroke": livery.primary,
    "--garage-car-mask": `url("${src}")`
  } as CSSProperties & Record<string, string>;

  return (
    <span className={`garage-car-preview-frame garage-car-preview-${view}${locked ? " locked" : ""} ${className}`.trim()} style={style}>
      <AssetImage className="garage-car-preview" src={src} alt="" />
      <span className="garage-car-gradient" aria-hidden="true" />
      {children}
    </span>
  );
}
