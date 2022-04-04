var CACHE_NAME = '2022-04-05 00:14';
var urlsToCache = [
  "/kotoba-quiz/",
  "/kotoba-quiz/hira.lst",
  "/kotoba-quiz/kana.lst",
  "/kotoba-quiz/eraser.svg",
  "/kotoba-quiz/index.js",
  "/kotoba-quiz/model/model.json",
  "/kotoba-quiz/model/group1-shard1of1.bin",
  "/kotoba-quiz/mp3/end.mp3",
  "/kotoba-quiz/mp3/correct3.mp3",
  "/kotoba-quiz/favicon/original.svg",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.0.4/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.9.0/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
