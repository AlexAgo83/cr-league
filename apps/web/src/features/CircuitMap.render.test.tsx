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
    expect((content?.querySelector(".circuit-route-layer") as SVGElement | null)?.style.getPropertyValue("--route-asphalt-width")).not.toBe("");
  });

  it("keeps replay focus mode in the native tile coordinate space", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[car]} camera={{ enabled: true, car }} />);

    expect(container.querySelector(".circuit-map-content")?.getAttribute("transform")).toBeNull();
  });

  it("renders metadata-driven tire trails and headlights", () => {
    const moving: MapCar = { id: "moving", label: "M", player: false, delay: 0, duration: 10, progress: 1 };

    const movingMap = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[moving]} />);
    expect(movingMap.container.querySelectorAll(".map-car-trail")).toHaveLength(2);
    expect(movingMap.container.querySelectorAll(".map-car-headlight")).toHaveLength(2);
  });

  it("keeps ambient cars moving forward only", () => {
    const ambient: MapCar = { id: "ambient", label: "A", player: false, delay: 0, duration: 10 };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[ambient]} />);

    const motion = container.querySelector("animateMotion");
    expect(motion?.getAttribute("keyPoints")).toBe("0;1");
    expect(motion?.getAttribute("keyTimes")).toBe("0;1");
  });

  it("keeps ambient cars static when reduced motion is requested", () => {
    const ambient: MapCar = { id: "ambient", label: "A", player: false, delay: 0, duration: 10 };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[ambient]} reduceMotion />);

    expect(container.querySelector("animateMotion")).toBeNull();
  });

  it("uses the car skin selected in the team livery", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0, livery: { primary: "#111111", secondary: "#ff0000", carAssetId: "car-005" } };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[car]} />);

    expect(container.querySelector(".map-car-detail")?.getAttribute("href")).toContain("/assets/cars/crl-v2/car-005/top.png");
  });
});
