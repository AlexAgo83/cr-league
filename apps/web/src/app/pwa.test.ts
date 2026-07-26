// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { unregisterDevServiceWorkers } from "./pwa.js";

describe("pwa dev cleanup", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unregisters local service workers and clears app shell caches", async () => {
    const unregister = vi.fn();
    const deleteCache = vi.fn();

    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistrations: vi.fn().mockResolvedValue([{ unregister }])
      }
    });
    vi.stubGlobal("caches", {
      keys: vi.fn().mockResolvedValue(["crl-shell-old", "other-cache"]),
      delete: deleteCache
    });

    unregisterDevServiceWorkers();
    await Promise.resolve();
    await Promise.resolve();

    expect(unregister).toHaveBeenCalledOnce();
    expect(deleteCache).toHaveBeenCalledWith("crl-shell-old");
    expect(deleteCache).not.toHaveBeenCalledWith("other-cache");
  });
});
