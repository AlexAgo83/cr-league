import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssetImage } from "./AssetImage.js";

describe("AssetImage", () => {
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
});
