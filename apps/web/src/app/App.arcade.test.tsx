// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";
import { SOLO_SLOT_KEY_PREFIX } from "./soloStorage.js";
import { WHEEL_PARTICIPANTS_KEY } from "../features/arcade/arcadeStorage.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function openWheel() {
  render(<App />);
  // The splash is skipped once the app has been entered, so a second visit has no start button.
  const splash = screen.queryByRole("button", { name: "PRESS START" });
  if (splash) fireEvent.click(splash);
  fireEvent.click(await screen.findByRole("button", { name: /^Solo$/ }));
  fireEvent.click(await screen.findByRole("button", { name: /^Arcade$/ }));
  fireEvent.click(await screen.findByRole("button", { name: /Destiny Wheel/ }));
  await screen.findByRole("heading", { name: "Who is in the draw?" });
}

function addName(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Add a name" }), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
}

describe("solo sub-modes", () => {
  it("offers Campaign and Arcade under Solo", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "PRESS START" }));

    fireEvent.click(await screen.findByRole("button", { name: /^Solo$/ }));

    expect(await screen.findByRole("heading", { name: "Choose your solo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Campaign$/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Arcade$/ })).toBeTruthy();
  });

  it("keeps Campaign going straight into a race when nothing is saved", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "PRESS START" }));

    fireEvent.click(await screen.findByRole("button", { name: /^Solo$/ }));
    fireEvent.click(await screen.findByRole("button", { name: /^Campaign$/ }));

    expect(await screen.findByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("destiny wheel", () => {
  it("refuses to race below two participants", async () => {
    await openWheel();

    expect(screen.getByRole("button", { name: "Race the draw" })).toHaveProperty("disabled", true);
    addName("Alex");
    expect(screen.getByRole("button", { name: "Race the draw" })).toHaveProperty("disabled", true);
    addName("Sam");
    expect(screen.getByRole("button", { name: "Race the draw" })).toHaveProperty("disabled", false);
  });

  it("keeps the participants only once the draw is launched, and never in a campaign slot", async () => {
    await openWheel();
    addName("Alex");
    addName("Sam");

    // Typing alone is not validating: nothing is stored until the draw runs.
    expect(localStorage.getItem(WHEEL_PARTICIPANTS_KEY)).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race the draw" }));

    await waitFor(() => expect(localStorage.getItem(WHEEL_PARTICIPANTS_KEY)).toContain("Alex"));
    expect(localStorage.getItem(`${SOLO_SLOT_KEY_PREFIX}0`)).toBe(null);
  });

  it("restores the participants on the next visit", async () => {
    await openWheel();
    addName("Alex");
    addName("Sam");
    fireEvent.click(screen.getByRole("button", { name: "Race the draw" }));
    await waitFor(() => expect(localStorage.getItem(WHEEL_PARTICIPANTS_KEY)).toContain("Alex"));
    cleanup();

    await openWheel();

    expect(screen.getByText("Alex")).toBeTruthy();
    expect(screen.getByText("Sam")).toBeTruthy();
  });

  it("removes a participant without touching the others", async () => {
    await openWheel();
    addName("Alex");
    addName("Sam");

    fireEvent.click(screen.getByRole("button", { name: "Remove Alex" }));

    expect(screen.queryByText("Alex")).toBe(null);
    expect(screen.getByText("Sam")).toBeTruthy();
  });
});
