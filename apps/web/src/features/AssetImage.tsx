import { type ImgHTMLAttributes, useEffect, useRef, useState } from "react";

type AssetImageState = "loading" | "loaded" | "error";

export function AssetImage({ className = "", decoding = "async", loading = "lazy", onError, onLoad, src, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [state, setState] = useState<AssetImageState>("loading");
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete) {
      setState(image.naturalWidth > 0 ? "loaded" : "error");
      return;
    }
    setState("loading");
  }, [src]);

  return (
    <span className={`asset-image-shell ${className} ${state}`} data-state={state}>
      <img
        {...props}
        alt={props.alt ?? ""}
        decoding={decoding}
        loading={loading}
        ref={imageRef}
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
      <span className="asset-image-placeholder" aria-hidden="true" />
    </span>
  );
}
