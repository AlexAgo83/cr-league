import { useSyncExternalStore } from "react";

// Lazy circuit-route loading: the 25 lat/lng polylines (~47 KB gz) used to be a static import on
// the first-paint critical path though only one circuit renders per round. They now load on demand
// via a single dynamic import of ./data.js, and consumers read routes from this cache by layoutKey.
// ponytail: one dynamic import for the whole barrel — simpler and enough; per-circuit splitting buys
// little since a league cycles through several tracks anyway.
export type CircuitRoute = Array<{ lat: number; lng: number }>;

let routeCache: Record<string, CircuitRoute> = {};
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function loadCircuitRoutes(): Promise<void> {
  if (!loadPromise) {
    loadPromise = import("./data.js").then((module) => {
      routeCache = module.CIRCUIT_ROUTES;
      emit();
    });
  }
  return loadPromise;
}

export function circuitRouteFor(layoutKey: string): CircuitRoute {
  return routeCache[layoutKey] ?? [];
}

export function circuitRoutesReady(): boolean {
  return Object.keys(routeCache).length > 0;
}

// React hook: kicks off the load and reports readiness so views that draw the route can gate on it.
export function useCircuitRoutesReady(): boolean {
  const ready = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    circuitRoutesReady,
    () => false
  );
  if (!ready) void loadCircuitRoutes();
  return ready;
}
