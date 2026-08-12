const CACHE_NAME = 'academic-planner-v10.0';
// almanac-data.js + almanac.js must stay in this list: index.html loads them as separate
// scripts, so a stale cache would serve new markup with no engine and the almanac strip
// would silently render empty.
const ASSETS = ['./', './index.html', './manifest.json', './almanac-data.js', './almanac.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Only cache same-origin navigation/asset requests, let API calls through
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
