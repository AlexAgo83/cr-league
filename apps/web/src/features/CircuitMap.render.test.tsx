import { renderWithT } from "../testRender.js";
import { fireEvent } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CITY_CIRCUITS, withRoute } from "../app/circuits.js";
import { loadCircuitRoutes } from "../app/circuitRoutes/index.js";
import { CircuitMap, type MapCar } from "./CircuitMap.js";


describe("CircuitMap rendering", () => {
  // Route polylines now load lazily; populate the cache before rendering.
  beforeAll(async () => {
    await loadCircuitRoutes();
  });
  it("fits static map tiles and route with one shared transform", () => {
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} />);

    const content = container.querySelector(".circuit-map-content");
    expect(content?.getAttribute("transform")).toContain("scale(");
    expect(content?.querySelector(".circuit-map-tile")).not.toBeNull();
    expect(content?.querySelector(".circuit-route-layer")).not.toBeNull();
    expect((content?.querySelector(".circuit-route-layer") as SVGElement | null)?.style.getPropertyValue("--route-asphalt-width")).not.toBe("");
  });

  it("keeps replay focus mode in the native tile coordinate space", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[car]} camera={{ enabled: true, car }} />);

    expect(container.querySelector(".circuit-map-content")?.getAttribute("transform")).toBeNull();
  });

  it("reports a clicked car while focus selection is enabled", () => {
    const car: MapCar = { id: "rival", label: "R", player: false, delay: 0, duration: 10, progress: 0 };
    const onCarClick = vi.fn();
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[car]} onCarClick={onCarClick} />);

    fireEvent.click(container.querySelector(".map-car")!);

    expect(onCarClick).toHaveBeenCalledWith(car);
  });

  it("renders metadata-driven tire trails and headlights", () => {
    const moving: MapCar = { id: "moving", label: "M", player: false, delay: 0, duration: 10, progress: 1, braking: true };

    const movingMap = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[moving]} />);
    expect(movingMap.container.querySelectorAll(".map-car-trail[data-segment]")).toHaveLength(36);
    expect(movingMap.container.querySelectorAll(".map-car-headlight")).toHaveLength(2);
    expect(movingMap.container.querySelectorAll(".map-car-rear-light.braking")).toHaveLength(2);
  });

  it("renders ambient cars through the shared visual effects pipeline", () => {
    const ambient: MapCar = { id: "ambient", label: "A", player: false, delay: 0, duration: 10 };
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[ambient]} />);

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
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={cars} camera={{ enabled: true, car: cars[3] }} />);

    expect(container.querySelectorAll(".map-car")).toHaveLength(8);
    expect(container.querySelectorAll(".map-car-trail[data-segment]")).toHaveLength(72);
  });

  it("keeps car SVG definitions unique across map instances", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = renderWithT(
      <>
        <CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[car]} />
        <CircuitMap circuit={withRoute(CITY_CIRCUITS[1]!)} cars={[car]} />
      </>
    );

    const ids = [...container.querySelectorAll("linearGradient[id$='headlight-0']")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sanitizes car ids before using them in SVG paint server urls", () => {
    const car: MapCar = { id: "circuit-preview-Rio de Janeiro", label: "R", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[car]} />);

    expect(container.querySelector(".map-car-headlight path")?.getAttribute("fill")).not.toContain(" ");
    expect(container.querySelector(".map-car-tint")?.getAttribute("mask")).not.toContain(" ");
  });

  it("renders car lights above the body tint", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0 };
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[car]} />);
    const spriteChildren = [...container.querySelector(".map-car-sprite")!.children];

    expect(spriteChildren.findIndex((node) => node.classList.contains("map-car-headlight"))).toBeGreaterThan(
      spriteChildren.findIndex((node) => node.classList.contains("map-car-tint"))
    );
  });

  it("keeps ambient cars static when reduced motion is requested", () => {
    const ambient: MapCar = { id: "ambient", label: "A", player: false, delay: 0, duration: 10 };
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[ambient]} reduceMotion />);

    expect(container.querySelector("animateMotion")).toBeNull();
  });

  it("uses the car skin selected in the team livery", () => {
    const car: MapCar = { id: "player", label: "P", player: true, delay: 0, duration: 10, progress: 0, livery: { primary: "#111111", secondary: "#ff0000", carAssetId: "car-005" } };
    const { container } = renderWithT(<CircuitMap circuit={withRoute(CITY_CIRCUITS[0]!)} cars={[car]} />);

    expect(container.querySelector(".map-car-detail")?.getAttribute("href")).toContain("/assets/cars/crl-v2/car-005/top.webp");
  });

  it("keeps its stage and its overlay when the route never arrives", () => {
    // The panels a full-page map carries live in the overlay, so a map with no route still has to
    // render the box they hang off — otherwise one failed chunk leaves the Stand blank.
    const { container } = renderWithT(
      <CircuitMap circuit={{ ...CITY_CIRCUITS[0]!, route: [] }} className="drive-map-panel" overlay={<p className="probe-overlay">panels</p>} />
    );

    expect(container.querySelector(".circuit-map-stage")).not.toBeNull();
    expect(container.querySelector(".probe-overlay")?.textContent).toBe("panels");
    expect(container.querySelector(".circuit-map")?.classList.contains("drive-map-panel")).toBe(true);
    // No route means no route: the drawing is what is missing, not the screen.
    expect(container.querySelector(".circuit-route-layer")).toBeNull();
  });
});
