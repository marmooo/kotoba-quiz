var CACHE_NAME="2022-08-11 09:05",urlsToCache=["/kotoba-quiz/","/kotoba-quiz/hira.lst","/kotoba-quiz/kana.lst","/kotoba-quiz/eraser.svg","/kotoba-quiz/index.js","/kotoba-quiz/worker.js","/kotoba-quiz/model/model.json","/kotoba-quiz/model/group1-shard1of1.bin","/kotoba-quiz/mp3/end.mp3","/kotoba-quiz/mp3/correct3.mp3","/kotoba-quiz/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/signature_pad@4.0.7/dist/signature_pad.umd.min.js","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.19.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})