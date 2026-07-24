import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "./useNotifications.js";

describe("useNotifications", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([["info" as const], ["error" as const]])("dismisses %s notifications after two seconds", (tone) => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.pushNotification("Message", tone);
    });
    expect(result.current.notifications[0]?.tone).toBe(tone);

    act(() => vi.advanceTimersByTime(1_999));
    expect(result.current.notifications).toHaveLength(1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.notifications).toEqual([]);
  });
});
