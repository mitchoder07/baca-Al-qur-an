/* sw.js - Baca Qur'an Service Worker
 * Caching: HTML=network-first, assets=cache-first, API=network-only, CDN=stale-while-revalidate
 */
const CACHE_VERSION = 'baca-v22';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const PRECACHE_URLS = [
  '/', '/index.html', '/mushaf.html', '/adhkar.html', '/ask.html', '/salah.html', '/game.html', '/topics.html', '/journeys.html', '/progress.html', '/bookmarks.html', '/blog.html',
  '/css/style.css', '/css/shared-nav.css', '/css/reader-themes.css', '/css/reader-additions.css',
  '/css/mushaf.css', '/css/floating-player-bar.css', '/css/scroll-top.css', '/css/blog.css',
  '/js/shared-nav.js', '/js/script.js', '/js/mushaf.js', '/js/data.js', '/js/chat.js',
  '/js/chat-widget.js', '/js/floating-player-bar.js', '/js/pwa-register.js', '/js/scroll-top.js',
  '/js/jumuah.js', '/js/onboarding-tour.js', '/js/onboarding-tour-steps-home.js',
  '/js/onboarding-tour-steps-mushaf.js', '/js/onboarding-tour-steps-mobile.js',
  '/js/share-image.js', '/js/logo-info-trigger.js', '/js/blog.js',
  '/js/ayah-downloader.js', '/js/video-share.js',
  '/manifest.json',
  '/images/baca-logo.webp', '/images/baca-logo.png', '/images/baca-logo-small.png',
  '/images/icons/icon-192.png', '/images/icons/icon-512.png', '/images/icons/apple-touch-icon.png',
  '/images/icons/icon-maskable-192.png', '/images/icons/icon-maskable-512.png',
  '/images/icons/icon.svg', '/images/icons/favicon-32.png',
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
    const res = await fetch(request);
    if (res && res.ok && res.type === 'basic') {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    return new Response('Offline and not cached.', { status: 503, statusText: 'Service Unavailable' });
  }
}
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === 'basic') {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline and page not cached.', { status: 503, statusText: 'Service Unavailable' });
  }
}
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then(res => {
    if (res && res.ok && res.type === 'basic') {
      const cache = caches.open(STATIC_CACHE);
      cache.then(c => c.put(request, res.clone()));
    }
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}
