var CACHE_NAME = 'mychef-v1';
var PRECACHE_URLS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    (async function () {
      try {
        var cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        var networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.ok) {
          var cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        var fallback = await caches.match(event.request);
        if (fallback) {
          return fallback;
        }
        return new Response('', { status: 504, statusText: 'Offline and not cached' });
      }
    })()
  );
});
