const CACHE_NAME = 'academic-planner-v14.7';
/* Opening the app must never wait on the network (v14.4). Before this, every request was
   network-first with no timeout, so on a connection that is up but carries nothing — one bar,
   a wifi network with no internet behind it, a captive portal — the page request simply hung, and
   the launch splash stayed up until the phone gave up or a signal got through. Airplane mode was
   fine (the request failed at once and fell back to the cache); a weak signal was not.

   So the app itself is served CACHE-FIRST: the shell and its scripts come straight out of this
   cache, every launch, online or not. New code still arrives — every commit bumps CACHE_NAME, the
   page calls reg.update(), the new worker precaches the whole set in one atomic addAll, takes
   over, and the page reloads once onto it. A cached version is therefore always a complete,
   matching set; nothing is ever revalidated piecemeal into it.

   almanac-data.js, almanac.js, calendars-data.js and syllabus.js must stay in this list: index.html
   loads them as separate scripts, so a stale cache would serve new markup with no engine and the
   almanac strip, the monastery calendar layers or the whole Syllabus tab would silently render
   empty. */
const SHELL = ['./', './manifest.json', './almanac-data.js', './almanac.js', './calendars-data.js', './syllabus.js'];
/* The syllabus feed is the one same-origin file that changes WITHOUT a commit to the code (the user
   uploads a new workbook over it), so it can never be cache-first: it is network-first, but with a
   short timeout, so a dead connection falls back to the last copy instead of waiting. It is still
   precached, so a first offline load has a syllabus. */
const FEED = './calendars/source/syllabus.xlsx';
/* Fonts live in their own cache, outside the version scheme, so a version bump does not throw
   them away and leave the next offline launch without its typefaces. */
const FONT_CACHE = 'academic-planner-fonts';
const NET_TIMEOUT = 4000;

const abs = p => new URL(p, self.registration.scope).href;

self.addEventListener('install', e => {
  // cache:'reload' so the precache is taken from the network, never from a stale HTTP cache entry.
  // The shell is one atomic set. The workbook is precached alongside it but OUTSIDE that set: it is the
  // user's upload, not code, and a missing or renamed one must not fail the install — that would strand
  // every installed device on the old code. The page keeps its own parsed copy of the feed anyway.
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(SHELL.map(p => new Request(p, { cache: 'reload' })))
        .then(() => fetchWithin(new Request(FEED, { cache: 'reload' }), NET_TIMEOUT)
          .then(r => { if (r.ok) return c.put(FEED, r); }).catch(() => {})))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== FONT_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// A fetch that gives up. Without this a request on a dead connection can hang for minutes.
function fetchWithin(req, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}
const fail = () => new Response('', { status: 504, statusText: 'Offline' });

/* The shell is cached under './' only. './index.html' is deliberately not precached: Cloudflare Pages
   redirects it to '/', and a redirected response cannot answer a navigation. */
async function shell() {
  return (await caches.open(CACHE_NAME)).match(abs('./'));
}

// Cache-first. A miss (a file added since this worker installed) goes to the network once, briefly.
async function cacheFirst(req, cacheName, keep) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req, { ignoreSearch: cacheName === CACHE_NAME });
  if (hit) return hit;
  try {
    const res = await fetchWithin(req, NET_TIMEOUT);
    if (keep(res)) c.put(req, res.clone()).catch(() => {});
    return res;
  } catch (e) { return fail(); }
}

// Network-first, but only for NET_TIMEOUT; then whatever this device last had.
async function networkFirst(req) {
  const c = await caches.open(CACHE_NAME);
  try {
    const res = await fetchWithin(req, NET_TIMEOUT);
    if (res.ok) { c.put(req, res.clone()).catch(() => {}); return res; }
    return (await c.match(req, { ignoreSearch: true })) || res;
  } catch (e) {
    return (await c.match(req, { ignoreSearch: true })) || fail();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: the stylesheet (requested with crossorigin, so its status is visible) and the font
  // files. Both are immutable for a given URL, so the first good copy is kept for good.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req, FONT_CACHE, r => r.ok));
    return;
  }
  // Everything else off-origin (Supabase) is the app's own business: it has its own timeouts and
  // its own offline queue, and must never be answered from a cache.
  if (url.origin !== location.origin) return;

  // Opening the app — from the home screen, a link, or ?action=newnote — is always the cached shell.
  // Only the app's own address, though: any other page on the site (test-almanac.html) is itself.
  if (req.mode === 'navigate') {
    const root = new URL(self.registration.scope).pathname;
    e.respondWith(url.pathname === root || url.pathname === root + 'index.html'
      ? shell().then(r => r || networkFirst(req))
      : networkFirst(req));
    return;
  }
  if (url.pathname.endsWith('/syllabus.xlsx')) {
    e.respondWith(networkFirst(req));
    return;
  }
  e.respondWith(cacheFirst(req, CACHE_NAME, r => r.ok));
});
