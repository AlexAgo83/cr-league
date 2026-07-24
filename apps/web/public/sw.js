// Shell-offline service worker. No build-time precache: assets are cached on first
// hit (stale-while-revalidate), navigations fall back to the cached app shell.
// ponytail: bump CACHE_VERSION on any incompatible shell change to purge old caches.
const CACHE_VERSION = "crl-shell-v1";
const SHELL_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.add(SHELL_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
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
