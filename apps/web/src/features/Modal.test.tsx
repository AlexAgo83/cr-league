import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  document.body.removeAttribute("style");
  vi.restoreAllMocks();
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

  it("locks body scroll while mounted and restores it on unmount", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(120);
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1000);
    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(980);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    document.body.style.paddingRight = "4px";

    const { unmount } = render(
      <Modal label="Lock test" onClose={() => undefined}>
        <button type="button">Inside</button>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-120px");
    expect(document.body.style.width).toBe("100%");
    expect(document.body.style.paddingRight).toBe("calc(24px)");

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(document.body.style.width).toBe("");
    expect(document.body.style.paddingRight).toBe("4px");
    expect(scrollTo).toHaveBeenCalledWith(0, 120);
  });

  it("keeps body scroll locked until the last stacked modal unmounts", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    const first = render(
      <Modal label="First" onClose={() => undefined}>
        <button type="button">First action</button>
      </Modal>
    );
    const second = render(
      <Modal label="Second" onClose={() => undefined}>
        <button type="button">Second action</button>
      </Modal>
    );

    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    expect(scrollTo).not.toHaveBeenCalled();

    second.unmount();
    expect(document.body.style.overflow).toBe("");
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
