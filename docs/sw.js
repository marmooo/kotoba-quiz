const CACHE_NAME="2023-10-20 00:30",urlsToCache=["/kotoba-quiz/","/kotoba-quiz/hira.lst","/kotoba-quiz/kana.lst","/kotoba-quiz/index.js","/kotoba-quiz/worker.js","/kotoba-quiz/model/model.json","/kotoba-quiz/model/group1-shard1of1.bin","/kotoba-quiz/mp3/end.mp3","/kotoba-quiz/mp3/correct3.mp3","/kotoba-quiz/img/surfing-js.png","/kotoba-quiz/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/signature_pad@4.1.6/dist/signature_pad.umd.min.js","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",a=>{a.waitUntil(caches.open(CACHE_NAME).then(a=>a.addAll(urlsToCache)))}),self.addEventListener("fetch",a=>{a.respondWith(caches.match(a.request).then(b=>b||fetch(a.request)))}),self.addEventListener("activate",a=>{a.waitUntil(caches.keys().then(a=>Promise.all(a.filter(a=>a!==CACHE_NAME).map(a=>caches.delete(a)))))})