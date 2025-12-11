const cacheName = "2025-12-12 00:00";
const urlsToCache = [
  "/kotoba-quiz/hira.lst",
  "/kotoba-quiz/kana.lst",
  "/kotoba-quiz/index.js",
  "/kotoba-quiz/worker.js",
  "/kotoba-quiz/model/model.json",
  "/kotoba-quiz/model/group1-shard1of1.bin",
  "/kotoba-quiz/mp3/end.mp3",
  "/kotoba-quiz/mp3/correct3.mp3",
  "/kotoba-quiz/img/surfing-js.png",
  "/kotoba-quiz/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((err) => console.warn("Failed to cache", url, err))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
