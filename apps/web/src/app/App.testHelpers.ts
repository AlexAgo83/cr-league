import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import { PROFILE_SESSION_KEY, safeStorage } from "./appStorage.js";

export function saveProfile(overrides: Partial<{ admin: boolean; recoveryCode: string | undefined; sessionCredential: string | undefined }> = {}) {
  safeStorage.set(
    PROFILE_SESSION_KEY,
    JSON.stringify({
      profile: { id: "profile_1", email: "pilot@example.test" },
      admin: false,
      sessionCredential: "SESSION123",
      ...overrides,
      teams: []
    })
  );
}

export function createLeagueFromSetup() {
  startMultiplayerSetup();
  fireEvent.click(screen.getByRole("button", { name: /Create league/ }));
  fireEvent.click(screen.getByRole("button", { name: "Start league" }));
}

/** Solo now opens a sub-mode step; Campaign is what Solo used to do on its own. */
export function startCampaign() {
  fireEvent.click(screen.getByRole("button", { name: /^Solo$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Campaign$/ }));
}

/**
 * A saved league is no longer opened on boot: the player lands on the entry screen and picks it
 * from the saved-league carousel.
 */
export function resumeSavedLeague() {
  startMultiplayerSetup();
  const card = document.querySelector<HTMLButtonElement>(".saved-league-card");
  if (!card) throw new Error("No saved league card to resume.");
  fireEvent.click(card);
}

export function startMultiplayerSetup() {
  const multiplayer = screen.queryByRole("button", { name: /Multiplayer/ });
  if (multiplayer) fireEvent.click(multiplayer);
}

export async function closeLeagueIntro() {
  await screen.findByRole("dialog", { name: "Welcome to the grid" });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(await screen.findByRole("button", { name: "Next" }));
  fireEvent.click(await screen.findByRole("button", { name: "Next" }));
  fireEvent.click(await screen.findByRole("button", { name: "Enter the grid" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Welcome to the grid" })).toBe(null));
}

export async function expectGarageCode(code: string) {
  fireEvent.click(await screen.findByRole("button", { name: "Championship" }));
  await waitFor(() => expect(document.querySelector(".championship-overview")?.textContent).toContain(code));
}

export function response(body: unknown) {
  return {
    ok: true,
    json: async () => body
  } as Response;
}

export function withoutPlayer<T extends { player?: unknown }>(state: T): Omit<T, "player"> {
  const rest = { ...state };
  delete rest.player;
  return rest;
}
