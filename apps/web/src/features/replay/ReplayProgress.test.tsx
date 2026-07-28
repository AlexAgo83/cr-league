import { renderWithT } from "../../testRender.js";
import { createRef } from "react";
import { fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReplayProgress, type ReplayTimelineMarker } from "./ReplayProgress.js";

const marker = (id: string, time: number): ReplayTimelineMarker => ({
  id,
  className: "replay-marker",
  left: "50%",
  title: id,
  time
});

const resolvedWeather = { start: "dry", early: "dry", mid: "light_rain", late: "light_rain", finish: "dry" } as never;

function renderProgress(seek = vi.fn(), scrubbingRef = { current: false }) {
  const view = renderWithT(
    <ReplayProgress
      progressRef={createRef<HTMLDivElement>()}
      rangeRef={createRef<HTMLInputElement>()}
      scrubbingRef={scrubbingRef}
      seekValueText="0:00"
      replayEnd={100}
      laps={3}
      resolvedWeather={resolvedWeather}
      replayPercentAtRaceProgress={(progress) => progress * 100}
      seek={seek}
      markers={[marker("moment", 12)]}
      directorMarkers={[marker("director", 34)]}
    />
  );
  // no global testing-library cleanup in this repo, so every query is scoped to its own container
  return { ...view, seek, scrubbingRef, ui: within(view.container) };
}

describe("ReplayProgress", () => {
  it("renders one tick per lap and one weather marker per race segment", () => {
    const { container } = renderProgress();

    expect(container.querySelectorAll(".replay-tick")).toHaveLength(3);
    expect(container.querySelectorAll(".replay-weather").length).toBeGreaterThan(0);
  });

  it("seeks from both moment and director markers", () => {
    const { seek, ui } = renderProgress();

    fireEvent.click(ui.getByRole("button", { name: "moment" }));
    fireEvent.click(ui.getByRole("button", { name: "director" }));

    expect(seek).toHaveBeenNthCalledWith(1, 12);
    expect(seek).toHaveBeenNthCalledWith(2, 34);
  });

  it("tracks scrubbing state across pointer down, up, and cancel", () => {
    const scrubbingRef = { current: false };
    const { seek, ui } = renderProgress(vi.fn(), scrubbingRef);
    const range = ui.getByRole("slider");

    fireEvent.pointerDown(range);
    expect(scrubbingRef.current).toBe(true);

    fireEvent.pointerUp(range, { target: { value: "40" } });
    expect(scrubbingRef.current).toBe(false);
    expect(seek).toHaveBeenCalledWith(40);

    fireEvent.pointerDown(range);
    fireEvent.pointerCancel(range);
    expect(scrubbingRef.current).toBe(false);
  });

  it("seeks while the range input changes", () => {
    const { seek, ui } = renderProgress();

    fireEvent.change(ui.getByRole("slider"), { target: { value: "70" } });

    expect(seek).toHaveBeenCalledWith(70);
  });
});
