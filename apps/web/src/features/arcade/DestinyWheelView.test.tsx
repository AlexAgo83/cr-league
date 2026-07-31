import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { loadCircuitRoutes } from "../../app/circuitRoutes/index.js";
import { t, TranslationProvider, type TranslationKey, type TranslationParams } from "../../i18n/index.js";
import { DestinyWheelView } from "./DestinyWheelView.js";

const translate = (key: TranslationKey, params?: TranslationParams) => t(key, "en", params);
const wheel = () => (
  <TranslationProvider value={translate}>
    <DestinyWheelView onBack={() => {}} />
  </TranslationProvider>
);

const addName = (name: string) => {
  fireEvent.change(screen.getByRole("textbox", { name: "Add a name" }), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
};

/** The car each participant row is showing, by its sprite folder. */
const carsOnScreen = () =>
  Array.from(document.querySelectorAll<HTMLImageElement>(".wheel-participant img[src*='cars']")).map(
    (image) => image.getAttribute("src")?.split("/").slice(-2)[0] ?? ""
  );

beforeAll(async () => {
  await loadCircuitRoutes();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("choosing a participant's car", () => {
  it("opens on the car that entry is showing, and swaps it", () => {
    render(wheel());
    addName("Alex");
    addName("Sam");
    const before = carsOnScreen();

    fireEvent.click(screen.getByRole("button", { name: "Choose Alex's car" }));
    const options = screen.getAllByRole("button", { pressed: false }).filter((button) => button.className.includes("wheel-car-option"));
    // Sixteen cars, and the one already on the entry is the one marked as chosen.
    expect(options).toHaveLength(15);
    expect(document.querySelectorAll(".wheel-car-option.selected")).toHaveLength(1);

    fireEvent.click(options[8]!);
    expect(document.querySelector("[role=dialog]")).toBe(null);

    const after = carsOnScreen();
    expect(after[0]).not.toBe(before[0]);
    // Only the entry that was asked about changes.
    expect(after[1]).toBe(before[1]);
  });

  it("shuffles every car and every livery at once", () => {
    render(wheel());
    for (const name of ["Alex", "Sam", "Zoe"]) addName(name);
    const before = carsOnScreen();

    fireEvent.click(screen.getByRole("button", { name: "Shuffle the cars" }));

    const after = carsOnScreen();
    expect(after).toHaveLength(3);
    expect(after).not.toEqual(before);
    expect(new Set(after).size).toBe(3);
  });
});
