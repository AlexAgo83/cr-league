import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { loadCircuitRoutes, resetCircuitRoutesForTest } from "../../app/circuitRoutes/index.js";
import { t, TranslationProvider, type TranslationKey, type TranslationParams } from "../../i18n/index.js";
import { DuelView } from "./DuelView.js";
import { DUEL_LAPS } from "./duel.js";

const translate = (key: TranslationKey, params?: TranslationParams) => t(key, "en", params);
const board = () => (
  <TranslationProvider value={translate}>
    <DuelView onBack={() => {}} />
  </TranslationProvider>
);

/** One lap of animation, plus a frame to land on. */
const LAP_MS = 4200;

/* By its own label rather than its accessible name: "Cover" explains itself with the word "attack",
   so a name query matches two of the three cards. */
const callButton = (label: string) =>
  Array.from(document.querySelectorAll<HTMLButtonElement>(".duel-call"))
    .find((button) => button.querySelector("strong")?.textContent === label)!;

/**
 * Fake timers with a real 16ms frame run ~265 callbacks per lap, and eight laps of that took 6s
 * under coverage. The board only cares that the lap reaches its end, not how many frames it took,
 * so frames are coarse here: same behaviour, a thirtieth of the work.
 */
const FRAME_MS = 500;
function useCoarseFrames() {
  vi.useFakeTimers({ toFake: ["performance", "setTimeout", "clearTimeout", "Date"] });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), FRAME_MS) as unknown as number);
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => clearTimeout(handle as unknown as NodeJS.Timeout));
}

function playLap(label: string) {
  fireEvent.click(callButton(label));
  act(() => {
    vi.advanceTimersByTime(LAP_MS + FRAME_MS * 2);
  });
}

// The whole board lives in the map's overlay, and the map draws nothing until the route data
// chunk has landed. Loaded once for the file.
beforeAll(async () => {
  await loadCircuitRoutes();
});

describe("a duel opened before the route data lands", () => {
  it("draws the circuit once it does", async () => {
    // /arcade/duel mounts this view cold, so the route cache can still be empty. A snapshot taken
    // then used to be frozen empty for the whole duel: a board on a blank map.
    resetCircuitRoutesForTest();
    render(board());
    fireEvent.click(screen.getByRole("button", { name: "Line up" }));
    expect(document.querySelector(".circuit-route-layer")).toBe(null);

    await act(async () => {
      await loadCircuitRoutes();
    });

    expect(document.querySelector(".circuit-route-layer")).not.toBe(null);
  });
});

afterEach(() => {
  // Vitest runs without globals here, so testing-library never registers its own auto-cleanup:
  // without this the trees pile up and a second render finds two of everything.
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the duel board", () => {
  it("opens on a briefing and lines up on the map", () => {
    render(board());

    expect(screen.getByRole("button", { name: "Line up" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Line up" }));

    // Every call is offered, both tanks are shown, and the history is there before it has anything
    // to hold — the corner should not appear out of nowhere after the first lap.
    for (const call of ["Attack", "Manage", "Cover"]) expect(callButton(call)).toBeTruthy();
    expect(document.querySelectorAll(".duel-tank")).toHaveLength(2);
    expect(document.querySelector(".duel-history-empty")).toBeTruthy();
    expect(document.querySelector(".duel-status")?.textContent).toContain("Lap 1/8");
  });

  it("closes the attack once the tank is empty", () => {
    useCoarseFrames();
    render(board());
    fireEvent.click(screen.getByRole("button", { name: "Line up" }));

    expect(callButton("Attack").hasAttribute("disabled")).toBe(false);
    playLap("Attack");
    playLap("Attack");

    // Four engagement, two a lap: the third attack has nothing left to spend.
    expect(callButton("Attack").hasAttribute("disabled")).toBe(true);
  });

  it("ends on a recap in the middle of the map, not in the standing panel", () => {
    useCoarseFrames();
    render(board());
    fireEvent.click(screen.getByRole("button", { name: "Line up" }));

    for (let lap = 0; lap < DUEL_LAPS; lap += 1) playLap("Manage");

    const recap = document.querySelector(".replay-finish-recap");
    expect(recap).toBeTruthy();
    expect(recap?.textContent).toMatch(/laps taken/);
    // The verdict lives in the recap; the standing panel only ever reports the gap.
    expect(document.querySelector(".duel-status")?.textContent).not.toMatch(/beat|held/i);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector(".replay-finish-recap")).toBe(null);
    expect(screen.getByRole("button", { name: "New duel" })).toBeTruthy();
  });

  it("explains itself on the grid, not on the briefing, and remembers being dismissed", () => {
    localStorage.clear();
    render(board());
    expect(screen.queryByRole("dialog")).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "Line up" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    // Closed without ticking: nothing is remembered.
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).toBe(null);
    expect(localStorage.getItem("cr-league-help-duel")).toBe(null);

    cleanup();
    render(board());
    fireEvent.click(screen.getByRole("button", { name: "Line up" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(localStorage.getItem("cr-league-help-duel")).toBe("1");

    cleanup();
    render(board());
    fireEvent.click(screen.getByRole("button", { name: "Line up" }));
    expect(screen.queryByRole("dialog")).toBe(null);
  });

  it("keeps your colours and your car from one duel to the next", () => {
    localStorage.setItem("cr-league-arcade-duel-livery", JSON.stringify({ primary: "#ff0000", secondary: "#00ff00", carAssetId: "car-009" }));
    render(board());

    // Colour inputs have no ARIA role of their own, so they are read off the card.
    const colours = Array.from(document.querySelectorAll<HTMLInputElement>(".duel-player-card input[type=color]"));
    expect(colours.map((input) => input.value)).toEqual(["#ff0000", "#00ff00"]);
    expect(document.querySelector<HTMLImageElement>(".duel-player-card img[src*='cars']")?.getAttribute("src")).toContain("car-009");
  });

  it("lets you pick a car and a circuit pool from the briefing, and remembers both", () => {
    localStorage.clear();
    render(board());

    fireEvent.click(screen.getByRole("button", { name: "Choose your car" }));
    const options = Array.from(document.querySelectorAll<HTMLButtonElement>(".wheel-car-option"));
    expect(options).toHaveLength(16);
    fireEvent.click(options[6]!);
    expect(document.querySelector("[role=dialog]")).toBe(null);
    expect(localStorage.getItem("cr-league-arcade-duel-livery")).toContain("car-007");

    // The pool is remembered, and the drawn circuit follows it rather than staying in the old one.
    const circuitNow = () => document.querySelector(".duel-briefing dd")?.textContent ?? "";
    const before = circuitNow();
    fireEvent.change(document.querySelector(".wheel-region select")!, { target: { value: "africa" } });
    expect(localStorage.getItem("cr-league-arcade-duel-region")).toBe("africa");
    expect(circuitNow()).not.toBe(before);
  });

  it("draws the rival a new car with the new name, and never the player's", () => {
    localStorage.clear();
    render(board());
    const cars = () =>
      Array.from(document.querySelectorAll<HTMLImageElement>(".duel-rival-card img[src*='cars']")).map(
        (image) => image.getAttribute("src")?.split("/").slice(-2)[0] ?? ""
      );

    const rivalCars = new Set<string>();
    for (let draw = 0; draw < 12; draw += 1) {
      const [mine, theirs] = cars();
      // Two identical cars on a two-car map is the one thing it has to get right.
      expect(theirs, "the rival is in the player's car").not.toBe(mine);
      rivalCars.add(theirs!);
      fireEvent.click(screen.getByRole("button", { name: "Another rival" }));
    }

    expect(rivalCars.size, "the rival is always in the same car").toBeGreaterThan(1);
  });
});
