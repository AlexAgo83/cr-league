import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Modal } from "./Modal.js";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      {open ? (
        <Modal label="Test dialog" onClose={() => setOpen(false)}>
          <h2>Test dialog</h2>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </Modal>
      ) : null}
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe("Modal", () => {
  it("focuses the dialog on open, closes on Escape, and restores focus to the trigger", () => {
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Open modal" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Test dialog" });
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Test dialog" })).toBe(null);
    expect(document.activeElement).toBe(trigger);
  });

  it("traps Tab inside the dialog and closes on overlay click", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));

    const dialog = screen.getByRole("dialog", { name: "Test dialog" });
    const close = screen.getByRole("button", { name: "Close" });
    close.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(close);

    const overlay = document.querySelector(".modal-overlay")!;
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    expect(screen.queryByRole("dialog", { name: "Test dialog" })).toBe(null);
  });
});
