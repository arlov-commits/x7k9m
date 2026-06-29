const CACHE_NAME = 'academic-planner-v7.5';
const ASSETS = ['./', './index.html',
  './icons/week_moon.png', './icons/syllabus_book.png', './icons/tasks_lotus.png',
  './icons/events_bell.png', './icons/notes_pen.png', './icons/dashboard_grid.png',
  './icons/dashboard_wheel.png', './icons/more_menu.png'];

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
