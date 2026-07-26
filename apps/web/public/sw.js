// Shell-offline service worker. No build-time precache: assets are cached on first
// hit (stale-while-revalidate), navigations fall back to the cached app shell.
// __BUILD__ is stamped with the app bundle hash at build time (scripts/stamp-sw.mjs) so
// this file changes whenever the app changes, which is what triggers the update flow.
const CACHE_VERSION = "crl-shell-__BUILD__";
const SHELL_URL = "/";
const DEV_SW = CACHE_VERSION.includes("__BUILD__");

self.addEventListener("install", (event) => {
  if (DEV_SW) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  // No skipWaiting: a new SW stays "waiting" until the user opts in (Update app button).
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.add(SHELL_URL)));
});

self.addEventListener("activate", (event) => {
  if (DEV_SW) {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("crl-shell-")).map((key) => caches.delete(key)))).then(() => self.registration.unregister())
    );
    return;
  }
  // No clients.claim: avoids reloading the very first visit; updates take over via SKIP_WAITING.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (DEV_SW) return;

  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let the API and cross-origin go straight to network

  // App shell: network-first so a new deploy's HTML wins, cached "/" as offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(CACHE_VERSION).then((cache) => cache.put(SHELL_URL, response.clone()));
          return response;
        })
        .catch(() => caches.match(SHELL_URL).then((cached) => cached ?? Response.error()))
    );
    return;
  }

  // Static assets (hashed JS/CSS, images, fonts): stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached ?? Response.error());
        return cached ?? network;
      })
    )
  );
});
