import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssetImage } from "./AssetImage.js";

describe("AssetImage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks loading, loaded, error, and src changes", () => {
    const { rerender } = render(<AssetImage className="modal-hero-image" src="/first.png" alt="Preview" />);
    const image = screen.getByRole("img", { name: "Preview" });

    expect(image.parentElement?.getAttribute("data-state")).toBe("loading");
    fireEvent.load(image);
    expect(image.parentElement?.getAttribute("data-state")).toBe("loaded");

    rerender(<AssetImage className="modal-hero-image" src="/second.png" alt="Preview" />);
    expect(image.parentElement?.getAttribute("data-state")).toBe("loading");
    fireEvent.error(image);
    expect(image.parentElement?.getAttribute("data-state")).toBe("error");
  });

  it("does not stay loading when the image is already complete", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(16);

    render(<AssetImage className="brand-icon" src="/favicon.svg" alt="Logo" />);

    expect((await screen.findByRole("img", { name: "Logo" })).parentElement?.getAttribute("data-state")).toBe("loaded");
  });
});
