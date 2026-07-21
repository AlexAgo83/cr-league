import { AssetImage } from "./AssetImage.js";

export type VisualIconName = "grip" | "overtaking" | "energy" | "dry" | "light_rain" | "heavy_rain" | "card" | "position" | "laps" | "distance" | "dot";

export function VisualIcon({ name }: { name: VisualIconName }) {
  return (
    <svg className={`visual-icon visual-icon-${name}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === "grip" ? <path d="M12 3l8 9-8 9-8-9 8-9Z" /> : null}
      {name === "overtaking" ? (
        <>
          <path d="M5 17 17 5" />
          <path d="M10 5h7v7" />
          <path d="M5 9h5" />
        </>
      ) : null}
      {name === "energy" ? <path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z" /> : null}
      {name === "dry" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
        </>
      ) : null}
      {name === "light_rain" ? (
        <>
          <path d="M7 15h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9.2 3 3 0 0 0 7 15Z" />
          <path d="M8 19l-1 2M13 19l-1 2M18 19l-1 2" />
        </>
      ) : null}
      {name === "heavy_rain" ? (
        <>
          <path d="M7 14h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6.1 8.9 3 3 0 0 0 7 14Z" />
          <path d="M8 18l-1.5 3M13 18l-1.5 3M18 18l-1.5 3" />
          <path d="m11 3-2 4h3l-2 4" />
        </>
      ) : null}
      {name === "card" ? <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h6M9 12h6" /> : null}
      {name === "position" ? (
        <>
          <path d="M5 17 17 5" />
          <path d="M10 5h7v7" />
        </>
      ) : null}
      {name === "laps" ? (
        <>
          <path d="M7 7h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z" />
          <path d="M8 12h8" />
        </>
      ) : null}
      {name === "distance" ? (
        <>
          <path d="M5 18c3-8 11-4 14-12" />
          <path d="M5 18h4M15 6h4" />
          <circle cx="5" cy="18" r="1.5" />
          <circle cx="19" cy="6" r="1.5" />
        </>
      ) : null}
      {name === "dot" ? <circle cx="12" cy="12" r="4" /> : null}
    </svg>
  );
}

export function CountryBadge({ country }: { country: string }) {
  const code = country.slice(0, 2).toLowerCase();
  return (
    <span className="country-badge" aria-label={country.toUpperCase()}>
      <AssetImage className="country-flag" src={`/assets/flags/${code}.svg`} alt="" />
    </span>
  );
}
