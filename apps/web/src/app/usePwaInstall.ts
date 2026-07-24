import { useSyncExternalStore } from "react";

// Chrome/Edge fire beforeinstallprompt once, early. We stash it on a module singleton so the
// prompt survives component remounts and is captured even before the menu mounts.
// ponytail: no library needed — the platform event plus one deferred ref is the whole feature.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

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

export function usePwaInstall() {
  const canInstall = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => deferredPrompt !== null,
    () => false
  );

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; // a prompt can only be used once
    emit();
  };

  return { canInstall, promptInstall };
}
