import { afterEach, describe, expect, it, vi } from "vitest";
import { __fpsListenerCountForTest, subscribeFps } from "./fpsMeter.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fps meter", () => {
  it("runs one loop for any number of readouts and stops when the last one leaves", () => {
    const request = vi.spyOn(globalThis, "requestAnimationFrame").mockReturnValue(1 as unknown as number);
    const cancel = vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    const first = subscribeFps(() => {});
    const second = subscribeFps(() => {});
    expect(__fpsListenerCountForTest()).toBe(2);
    expect(request).toHaveBeenCalledTimes(1);

    first();
    expect(cancel).not.toHaveBeenCalled();
    second();
    expect(__fpsListenerCountForTest()).toBe(0);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("reports a rate once a sample window has passed", () => {
    let tick: FrameRequestCallback | undefined;
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
      tick = callback;
      return 1 as unknown as number;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    const readings: number[] = [];
    const unsubscribe = subscribeFps((fps) => readings.push(fps));
    // 30 frames over 500ms is 60 fps; nothing is reported before the window closes.
    for (let frame = 0; frame < 30; frame += 1) tick?.(1000 + frame * (500 / 30));
    expect(readings).toEqual([]);
    tick?.(1500);
    expect(readings).toEqual([62]);
    unsubscribe();
  });
});
