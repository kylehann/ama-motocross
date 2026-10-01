/* YZ250F Workshop SW. Lives in /yz250f/ so its scope is ONLY this app (default scope = this folder).
   The parent Dirt Bike Updates site and other github.io projects are not touched. */
const CACHE = 'yz250f-workshop-v3';
const PREFIX = 'yz250f-workshop-';
const PRECACHE = [
  './',
  './index.html',
  './maps/maps.json',
  './maps/copy-grid.js',
  './maps/copy-grid.css',
  './pwa/icons/icon-192.png',
  './pwa/icons/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => undefined)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      // only delete this app's own old caches (origin is shared with other sites)
      Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return; // never touch other paths/sites
  if (url.pathname.endsWith('maps.json')) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(req, clone));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
