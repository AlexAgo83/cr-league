import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CITY_CIRCUITS } from "../app/circuits.js";
import { CircuitMap, type MapCar } from "./CircuitMap.js";

const tt = (key: string) => key;

describe("CircuitMap rendering", () => {
  it("fits static map tiles and route with one shared transform", () => {
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} />);

    const content = container.querySelector(".circuit-map-content");
    expect(content?.getAttribute("transform")).toContain("scale(");
    expect(content?.querySelector(".circuit-map-tile")).not.toBeNull();
    expect(content?.querySelector(".circuit-route-layer")).not.toBeNull();
  });

  it("keeps replay focus mode in the native tile coordinate space", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[car]} camera={{ enabled: true, car }} />);

    expect(container.querySelector(".circuit-map-content")?.getAttribute("transform")).toBeNull();
  });
});
