/* sw.js — Baca Qur'an Service Worker
 * Caching: HTML=network-first, assets=cache-first, API=network-only, CDN=stale-while-revalidate
 */
const CACHE_VERSION = 'baca-v12';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const PRECACHE_URLS = [
  '/', '/index.html', '/mushaf.html', '/adhkar.html', '/ask.html', '/salah.html', '/game.html', '/topics.html', '/journeys.html', '/progress.html', '/bookmarks.html',
  '/css/style.css', '/css/shared-nav.css', '/css/reader-themes.css', '/css/reader-additions.css',
  '/css/mushaf.css', '/css/floating-player-bar.css', '/css/scroll-top.css',
  '/js/shared-nav.js', '/js/script.js', '/js/mushaf.js', '/js/data.js', '/js/chat.js',
  '/js/chat-widget.js', '/js/floating-player-bar.js', '/js/pwa-register.js', '/js/scroll-top.js',
  '/js/jumuah.js', '/js/onboarding-tour.js', '/js/onboarding-tour-steps-home.js',
  '/js/onboarding-tour-steps-mushaf.js', '/js/share-image.js', '/js/logo-info-trigger.js',
  '/manifest.json',
  '/images/baca-logo.webp', '/images/baca-logo.png', '/images/baca-logo-small.png',
  '/images/icons/icon-192.png', '/images/icons/icon-512.png', '/images/icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then(c => Promise.allSettled(PRECACHE_URLS.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/api.')) return;
  if (url.pathname === '/sw.js') return;
  if (url.origin !== self.location.origin) { event.respondWith(staleWhileRevalidate(request)); return; }
  const isHTML = request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/';
  if (isHTML) { event.respondWith(networkFirst(request)); return; }
  event.respondWith(cacheFirst(request));
});
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') { const cache = await caches.open(STATIC_CACHE); cache.put(request, response.clone()); }
    return response;
  } catch { return new Response('', { status: 504, statusText: 'Offline' }); }
}
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) { const cache = await caches.open(PAGE_CACHE); cache.put(request, response.clone()); }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const rootCache = await caches.match('/index.html');
    if (rootCache) return rootCache;
    return new Response('<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center"><h2>You\'re offline</h2><p>Connect to the internet and try again.</p></body></html>', { headers: { 'Content-Type': 'text/html' } });
  }
}
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => { if (response && response.ok) cache.put(request, response.clone()); return response; }).catch(() => cached);
  return cached || fetchPromise;
}
self.addEventListener('message', (event) => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
