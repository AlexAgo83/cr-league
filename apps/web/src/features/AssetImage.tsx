import { type ImgHTMLAttributes, useEffect, useState } from "react";

type AssetImageState = "loading" | "loaded" | "error";

export function AssetImage({ className = "", onError, onLoad, src, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [state, setState] = useState<AssetImageState>("loading");

  useEffect(() => {
    setState("loading");
  }, [src]);

  return (
    <span className={`asset-image-shell ${className} ${state}`} data-state={state}>
      <img
        {...props}
        src={src}
        onError={(event) => {
          setState("error");
          onError?.(event);
        }}
        onLoad={(event) => {
          setState("loaded");
          onLoad?.(event);
        }}
      />
      {state === "loaded" ? null : <span className="asset-image-placeholder" aria-hidden="true" />}
    </span>
  );
}
