import { useSyncExternalStore } from "react";

// PWA install + update state on a module singleton, so it survives component remounts and is
// captured even before the menu mounts. ponytail: no library — platform events + two refs.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });
}

// Called once from main.tsx in production. Registers the SW and tracks when a newer version
// is installed and waiting (an update the user can apply).
export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return; // the new SW took over after SKIP_WAITING -> load the fresh version
    reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      const markWaiting = (worker: ServiceWorker | null) => {
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          // "installed" + an existing controller == this is an update, not a first install.
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            waitingWorker = worker;
            emit();
          }
        });
      };

      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorker = registration.waiting;
        emit();
      }
      registration.addEventListener("updatefound", () => markWaiting(registration.installing));

      // SPAs rarely navigate, so poll for a fresh sw.js hourly to surface updates mid-session.
      // ponytail: hourly is plenty for a turn-based game; tighten only if releases must land faster.
      setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    })
    .catch(() => {});
}

export function unregisterDevServiceWorkers() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if ("caches" in globalThis) {
    caches.keys().then((keys) => {
      keys.filter((key) => key.startsWith("crl-shell-")).forEach((key) => caches.delete(key));
    });
  }
}

export function usePwaInstall() {
  const canInstall = useSyncExternalStore(subscribe, () => deferredPrompt !== null, () => false);
  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; // a prompt can only be used once
    emit();
  };
  return { canInstall, promptInstall };
}

export function usePwaUpdate() {
  const updateReady = useSyncExternalStore(subscribe, () => waitingWorker !== null, () => false);
  const applyUpdate = () => {
    // Tell the waiting SW to activate; controllerchange then reloads into the new version.
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  };
  return { updateReady, applyUpdate };
}
