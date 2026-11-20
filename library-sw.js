// Service worker for vinhx library (scope /library): the app and the books you opened keep working offline.
//  - pages: network first, the last good copy when offline
//  - css, js, icons: show the cached copy at once and refresh it in the background
//  - book files (/library/books/*.json.gz): cached the first time they are read
//  - Google Fonts: cached the same way as other static files
// Bump VERSION to clear everything the next time this file changes.
const VERSION = 'lib-v1';
const BOOKS = 'lib-books-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION && k !== BOOKS) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    return (await cache.match(req)) || (await cache.match('/library')) || Response.error();
  }
}
async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const fresh = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await fresh) || Response.error();
}
async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;
  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/library/books/')) return e.respondWith(cacheFirst(req, BOOKS));
    if (req.mode === 'navigate' && (url.pathname === '/library' || url.pathname.startsWith('/library/'))) return e.respondWith(networkFirst(req));
    if (url.pathname.startsWith('/library/') || url.pathname.startsWith('/assets/')) return e.respondWith(staleWhileRevalidate(req));
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    return e.respondWith(staleWhileRevalidate(req));
  }
});
