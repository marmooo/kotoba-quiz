const CACHE_NAME="2024-07-10 09:50",urlsToCache=["/kotoba-quiz/","/kotoba-quiz/hira.lst","/kotoba-quiz/kana.lst","/kotoba-quiz/index.js","/kotoba-quiz/worker.js","/kotoba-quiz/model/model.json","/kotoba-quiz/model/group1-shard1of1.bin","/kotoba-quiz/mp3/end.mp3","/kotoba-quiz/mp3/correct3.mp3","/kotoba-quiz/img/surfing-js.png","/kotoba-quiz/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})