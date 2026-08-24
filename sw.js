/* sw.js - Baca Qur'an Service Worker (v6)
 *
 * Caching strategy:
 * - HTML pages: network-first (fresh when online, cached when offline)
 * - Static assets (CSS/JS/images): cache-first
 * - API calls: network-only (never cached)
 * - Cross-origin audio (mp3quran.net, everyayah.com): STALE-WHILE-REVALIDATE
 *   with a dedicated AUDIO_CACHE. Audio files are cached on first play and
 *   available offline on subsequent plays. This enables offline Qur'an
 *   recitation on the reciter page.
 */
const CACHE_VERSION = 'baca-v6';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

const PRECACHE_URLS = [
  '/', '/index.html', '/mushaf.html', '/adhkar.html', '/ask.html', '/salah.html', '/game.html', '/blog.html',
  '/topics.html', '/journeys.html', '/progress.html', '/bookmarks.html',
  '/css/style.css', '/css/shared-nav.css', '/css/reader-themes.css', '/css/reader-additions.css',
  '/css/mushaf.css', '/css/floating-player-bar.css', '/css/scroll-top.css', '/css/blog.css', '/css/baca-logo.css',
  '/js/shared-nav.js', '/js/script.js', '/js/mushaf.js', '/js/data.js', '/js/chat.js',
  '/js/chat-widget.js', '/js/floating-player-bar.js', '/js/pwa-register.js', '/js/scroll-top.js',
  '/js/jumuah.js', '/js/onboarding-tour.js', '/js/onboarding-tour-steps-home.js',
  '/js/onboarding-tour-steps-mushaf.js', '/js/share-image.js', '/js/logo-info-trigger.js',
  '/js/blog.js', '/js/baca-shortcuts.js',
  '/manifest.json',
  '/images/baca-logo.webp', '/images/baca-logo.png', '/images/baca-logo-small.png',
  '/images/icons/icon-192.png', '/images/icons/icon-512.png', '/images/icons/apple-touch-icon.png',
  '/images/baca-social-preview.jpg',
];

// Audio file extensions and domains
const AUDIO_DOMAINS = ['mp3quran.net', 'everyayah.com'];
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.ogg', '.wav'];

function isAudioRequest(url) {
  const hostname = url.hostname.toLowerCase();
  const pathname = url.pathname.toLowerCase();
  const isAudioDomain = AUDIO_DOMAINS.some(d => hostname.includes(d));
  const isAudioExt = AUDIO_EXTENSIONS.some(ext => pathname.endsWith(ext));
  return isAudioDomain && isAudioExt;
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(c => Promise.allSettled(PRECACHE_URLS.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API calls
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/api.')) return;
  // Never cache the SW itself
  if (url.pathname === '/sw.js') return;

  // === AUDIO FILES: stale-while-revalidate with dedicated audio cache ===
  // On first play: fetches from network, caches the response.
  // On subsequent plays (online): serves cached instantly, revalidates in background.
  // On subsequent plays (offline): serves cached audio. No network needed.
  if (isAudioRequest(url)) {
    event.respondWith(audioStaleWhileRevalidate(request));
    return;
  }

  // === Cross-origin (non-audio): stale-while-revalidate ===
  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // === HTML pages: network-first ===
  const isHTML = request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/';
  if (isHTML) {
    event.respondWith(networkFirst(request));
    return;
  }

  // === Static assets: cache-first ===
  event.respondWith(cacheFirst(request));
});

// === Audio caching: stale-while-revalidate with dedicated cache ===
// This is the key function that enables offline Qur'an recitation.
async function audioStaleWhileRevalidate(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request);

  // If we have it cached, serve instantly and revalidate in background
  if (cached) {
    // Revalidate in background (don't block the response)
    fetch(request).then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Offline — that's fine, we already served from cache
    });
    return cached;
  }

  // Not cached yet — fetch from network, cache it for next time
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not cached — return empty audio (silence)
    return new Response('', { status: 504, statusText: 'Offline — audio not cached yet' });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const rootCache = await caches.match('/index.html');
    if (rootCache) return rootCache;
    return new Response(
      '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center"><h2>You\'re offline</h2><p>Connect to the internet and try again.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Allow the page to manage audio cache (check what's cached, clear, etc.)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data === 'CLEAR_AUDIO_CACHE') {
    // Clear all cached audio files
    caches.delete(AUDIO_CACHE).then(() => {
      event.source && event.source.postMessage({ type: 'AUDIO_CACHE_CLEARED' });
    });
  } else if (event.data === 'GET_AUDIO_CACHE_INFO') {
    // Report how many audio files are cached
    caches.open(AUDIO_CACHE).then(cache => {
      return cache.keys();
    }).then(keys => {
      event.source && event.source.postMessage({
        type: 'AUDIO_CACHE_INFO',
        count: keys.length,
        urls: keys.map(k => k.url)
      });
    });
  }
});
