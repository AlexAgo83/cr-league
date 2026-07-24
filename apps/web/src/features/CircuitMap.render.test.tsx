import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  it("reports a clicked car while focus selection is enabled", () => {
    const car: MapCar = { id: "rival", label: "R", player: false, delay: 0, duration: 10, progress: 0 };
    const onCarClick = vi.fn();
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[car]} onCarClick={onCarClick} />);

    fireEvent.click(container.querySelector(".map-car")!);

    expect(onCarClick).toHaveBeenCalledWith(car);
  });

  it("renders metadata-driven tire trails and headlights", () => {
    const moving: MapCar = { id: "moving", label: "M", player: false, delay: 0, duration: 10, progress: 1, braking: true };

    const movingMap = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[moving]} />);
    expect(movingMap.container.querySelectorAll(".map-car-trail[data-segment]")).toHaveLength(36);
    expect(movingMap.container.querySelectorAll(".map-car-headlight")).toHaveLength(2);
    expect(movingMap.container.querySelectorAll(".map-car-rear-light.braking")).toHaveLength(2);
  });

  it("renders ambient cars through the shared visual effects pipeline", () => {
    const ambient: MapCar = { id: "ambient", label: "A", player: false, delay: 0, duration: 10 };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[ambient]} />);

    expect(container.querySelector("animateMotion")).toBeNull();
    expect(container.querySelectorAll(".map-car-trail[data-segment]")).toHaveLength(36);
    expect(container.querySelectorAll(".map-car-headlight")).toHaveLength(2);
  });

  it("limits tire trail nodes on packed Grand Prix maps", () => {
    const cars: MapCar[] = Array.from({ length: 8 }, (_, index) => ({
      id: `car-${index}`,
      label: String(index + 1),
      player: index === 0,
      delay: 0,
      duration: 10,
      progress: index / 10
    }));
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={cars} camera={{ enabled: true, car: cars[3] }} />);

    expect(container.querySelectorAll(".map-car")).toHaveLength(8);
    expect(container.querySelectorAll(".map-car-trail[data-segment]")).toHaveLength(72);
  });

  it("keeps car SVG definitions unique across map instances", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = render(
      <>
        <CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[car]} />
        <CircuitMap circuit={CITY_CIRCUITS[1]!} tt={tt} cars={[car]} />
      </>
    );

    const ids = [...container.querySelectorAll("linearGradient[id$='headlight-0']")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("renders car lights above the body tint", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = render(<CircuitMap circuit={CITY_CIRCUITS[0]!} tt={tt} cars={[car]} />);
    const spriteChildren = [...container.querySelector(".map-car-sprite")!.children];

    expect(spriteChildren.findIndex((node) => node.classList.contains("map-car-headlight"))).toBeGreaterThan(
      spriteChildren.findIndex((node) => node.classList.contains("map-car-tint"))
    );
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
