import type { ReactNode } from "react";
import { AssetImage } from "./AssetImage.js";

export function ModalHero({ image, kicker, title }: { image: string; kicker: ReactNode; title: ReactNode }) {
  return (
    <header className="modal-hero">
      <AssetImage className="modal-hero-image" src={image} alt="" />
      <div className="modal-hero-copy">
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
    </header>
  );
}
