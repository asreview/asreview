const CACHE_NAME = "asreview-offline-cache-v1";
const OFFLINE_URL = "/offline.html";
const FAVICON_URL = "/favicon.ico";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, FAVICON_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL)),
      ),
    );
  } else if (event.request.url.endsWith(FAVICON_URL)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => cache.match(FAVICON_URL)),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_OFFLINE_PAGE") {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll([OFFLINE_URL, FAVICON_URL]);
    });
  }
});
