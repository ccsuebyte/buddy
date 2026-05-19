const CACHE = 'buddy-v2'; // Changed version to force browser cache reset
const ASSETS = [
  './buddy.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only intercept local requests, ignore third-party assets like Google Fonts to prevent CORS caching loops
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      
      return fetch(e.request).catch(() => {
        // Only fallback to the main UI shell if the user is actively navigating web pages
        if (e.request.mode === 'navigate') {
          return caches.match('./buddy.html');
        }
      });
    })
  );
});
