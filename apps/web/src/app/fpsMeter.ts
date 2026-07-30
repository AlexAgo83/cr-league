/**
 * Frame rate is a property of the page, not of one map, so a single loop feeds every readout: a
 * rAF per mounted map would spend frames to measure frames. Idle when nobody is listening.
 */
type FpsListener = (fps: number) => void;

const SAMPLE_MS = 500;
const listeners = new Set<FpsListener>();
let frame = 0;
let frames = 0;
let last = 0;

function tick(now: number) {
  frames += 1;
  if (!last) last = now;
  if (now - last >= SAMPLE_MS) {
    const fps = Math.round((frames * 1000) / (now - last));
    frames = 0;
    last = now;
    for (const listener of listeners) listener(fps);
  }
  frame = requestAnimationFrame(tick);
}

export function subscribeFps(listener: FpsListener) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof requestAnimationFrame === "function") {
    frames = 0;
    last = 0;
    frame = requestAnimationFrame(tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

export function __fpsListenerCountForTest() {
  return listeners.size;
}
