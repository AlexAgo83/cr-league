import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";

export function saveProfile(overrides: Partial<{ admin: boolean; recoveryCode: string | undefined }> = {}) {
  localStorage.setItem(
    "cr-league-profile-session",
    JSON.stringify({
      profile: { id: "profile_1", email: "pilot@example.test" },
      admin: false,
      recoveryCode: "ABCD1234",
      ...overrides,
      teams: []
    })
  );
}

export function createLeagueFromSetup() {
  fireEvent.click(screen.getByRole("button", { name: /Create league/ }));
  fireEvent.click(screen.getByRole("button", { name: "Start league" }));
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
  fireEvent.click(await screen.findByRole("button", { name: "Garage" }));
  await waitFor(() => expect(document.querySelector(".garage-overview")?.textContent).toContain(code));
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
