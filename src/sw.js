const CACHE_NAME = "2023-10-20 00:30";
const urlsToCache = [
  "/kotoba-quiz/",
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
  "https://cdn.jsdelivr.net/npm/signature_pad@4.1.6/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
