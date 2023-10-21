var CACHE_NAME = 'pwa-task-manager';
var urlsToCache = [
  '/',
];

// Install a service worker
self.addEventListener("install", (event) => {
  console.log("Service Worker : Installed!")
  event.waitUntil(
      (async() => {
          try {
              cache_obj = await caches.open(cache)
              cache_obj.addAll(urlsToCache)
          }
          catch{
              console.log("error occured while caching...")
          }
      })()
  )
} )

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  var cacheWhitelist = ['pwa-task-manager'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});