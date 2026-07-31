import { useSyncExternalStore } from "react";

// Lazy circuit-route loading: the lat/lng polylines (~47 KB gz) used to be a static import on
// the first-paint critical path though only one circuit renders per round. They now load on demand
// via a single dynamic import of ./data.js, and consumers read routes from this cache by layoutKey.
// ponytail: one dynamic import for the whole barrel — simpler and enough; per-circuit splitting buys
// little since a league cycles through several tracks anyway.
export type CircuitRoute = Array<{ lat: number; lng: number }>;

export type CircuitRoutesStatus = "pending" | "ready" | "failed";

let routeCache: Record<string, CircuitRoute> = {};
let loadPromise: Promise<void> | null = null;
let status: CircuitRoutesStatus = "pending";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/**
 * One import for the session. A failed one stays failed, and not for want of trying: a module
 * specifier that fails to fetch is recorded as errored in the browser's module map, so re-importing
 * it rejects again without ever going back to the network. Measured — a retry loop issued eight
 * more imports and exactly zero more requests. Only a reload clears it.
 *
 * So the failure is survivable rather than recoverable: `CircuitMap` keeps its stage when the route
 * never arrives, which is what leaves the panels the map carries — the race-day bar, the plan, the
 * buttons that move the Grand Prix on — on screen instead of a bare header.
 */
export function loadCircuitRoutes(): Promise<void> {
  if (!loadPromise) {
    loadPromise = import("./data.js")
      .then((module) => {
        routeCache = module.CIRCUIT_ROUTES;
        status = "ready";
        emit();
      })
      // Swallowed rather than left dangling: every render asks again, and each one would log its
      // own unhandled rejection. The status is what the UI reads to say so and offer the reload
      // that is the only way out.
      .catch(() => {
        status = "failed";
        emit();
      });
  }
  return loadPromise;
}

/** Test seam: puts the cache back to how a cold page load finds it. */
export function resetCircuitRoutesForTest() {
  routeCache = {};
  loadPromise = null;
  status = "pending";
  emit();
}

export function circuitRouteFor(layoutKey: string): CircuitRoute {
  const route = routeCache[layoutKey];
  if (route) return route;
  if (circuitRoutesReady()) throw new Error(`Missing circuit route for ${layoutKey}.`);
  return [];
}

export function circuitRoutesReady(): boolean {
  return Object.keys(routeCache).length > 0;
}

export function circuitRoutesStatus(): CircuitRoutesStatus {
  return status;
}

// React hook: kicks off the load and reports where it got to, so views that draw the route can gate
// on it and the one that cannot draw can say why.
export function useCircuitRoutesStatus(): CircuitRoutesStatus {
  const current = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    circuitRoutesStatus,
    () => "pending" as const
  );
  if (current === "pending") void loadCircuitRoutes();
  return current;
}

export function useCircuitRoutesReady(): boolean {
  return useCircuitRoutesStatus() === "ready";
}
