const CACHE_NAME = 'buddy-v1';
const ASSETS = [
  './buddy.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap'
];

// Install lifecycle: Cache critical shell assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate lifecycle: Clean up older cache namespaces
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch Interception: Cache First falling back to network, with an offline application shell bridge
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(e.request).catch(() => {
        // If the resource requested is a navigation page, serve your app structure
        if (e.request.mode === 'navigate') {
          return caches.match('./buddy.html');
        }
      });
    })
  );
});
