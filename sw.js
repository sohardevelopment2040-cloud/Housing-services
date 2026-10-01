const CACHE = 'services-guide-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Google Fonts: cache-first so the deck keeps its fonts offline
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  // Same-origin: network-first, fall back to cache when offline
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html'))));
  }
});
