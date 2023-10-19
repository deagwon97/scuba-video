// service-worker.js

self.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        console.log('APP resumed');
        window.location.reload();
    }
});

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('my-cache').then(function (cache) {
            return cache.addAll([
                '/',
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
