const APP_VERSION = "1.1.22";
const CACHE_VERSION = APP_VERSION.replaceAll(".", '');
const CACHE_PREFIX = "ns-app-cache-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CACHE_EXPIRES_DAYS = 7;

const APP_ASSETS = [
  'index.html',
  'abc-encoder.html',
  'styles/styles-chord-viewer.css',
  'styles/styles-list-viewer.css',
  'styles/styles-nss-app.css',
  'modules/scripts-abc-encoder.js',
  'modules/scripts-abc-tools.js',
  'modules/scripts-chord-viewer.js',
  'modules/scripts-emoji-manager.js',
  'modules/scripts-list-viewer.js',
  'modules/scripts-nss-app.js',
  'modules/scripts-preload-nssapp.js',
  'modules/scripts-3p/ap-style-title-case/ap-style-title-case.js',
  'modules/scripts-3p/lz-string/lz-string.min.js',
  'modules/scripts-3p/p-limit/p-limit.js',
  'modules/scripts-3p/p-limit/yocto-queue.js',
  'modules/scripts-3p/p-throttle/p-throttle.js',
  'modules/scripts-3p/popover-polyfill/popover.min.js',
  'modules/scripts-3p/storage-available/storage-available.js',
  'favicon.ico',
  'favicon.svg',
  'version.js'
];

const APP_ASSETS_LAZY = [
  'assets/fonts/FiraSans-Regular.ttf',
  'assets/fonts/FiraSans-SemiBold.ttf',
  'assets/icons/app-icon-192x192.png',
  'assets/icons/app-icon-512x512.png',
  'assets/icons/app-icon-maskable-192x192.png',
  'assets/icons/app-icon-maskable-512x512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/images/playalong-polkas-johnwalshs.jpg',
  'assets/images/playalong-polkas-pando.jpg',
  'assets/images/playalong-polkas-toureendarby.jpg',
  'assets/screens/placeholder-offline-h.webp',
  'app.webmanifest'
];

// Install service worker with critical assets
// Skip waiting to activate service worker immediately
// Keep loading low-priority assets after activation

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .then(() => {
        caches.open(CACHE_NAME).then(cache => {
          cache.addAll(APP_ASSETS_LAZY).catch(error => {
            console.warn(`[NS App Service Worker] Lazy-loading of assets interrupted`, error);
          });
        });
      })
  );
});

// Activate service worker, clear outdated caches, claim all pages

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
    .then(cacheKeys => Promise.all(
      cacheKeys
        .filter(cacheKey => cacheKey.startsWith(CACHE_PREFIX) && cacheKey !== CACHE_NAME)
        .map(cacheKey => {
          console.log(`[NS App Service Worker]\n\n` +
          `Cached version: v${cacheKey.slice(CACHE_PREFIX.length)}\n\n` +
          `Current version: v${CACHE_VERSION}\n\n` +
          `Clearing outdated cached files...`);
          return caches.delete(cacheKey);
        }))
    ).then(() => self.clients.claim())
  );
});

// Handle service worker fetch requests

self.addEventListener('fetch', (event) => {

  const { request } = event;
  const url = new URL(request.url);

  // Handle offline behavior of analytics

  if (request.method === 'POST' && url.pathname.includes('goatcounter.com')) {
    event.respondWith(
      navigator.onLine
        ? fetch(request).catch(() => new Response(''))
        : new Response('', { status: 200 })
    );
    return;
  }

  // Filter out unrelated requests
  
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Handle navigation: Serve cached HTML for main app sections, fall back to launch screen

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(
        url.pathname.includes('abc-encoder') ?
          'abc-encoder.html' :
          'index.html')
        .then(navResponse => navResponse || caches.match('index.html'))
    );
    return;
  }

  // Handle Session DB files

  if (/(sets|tunes|chords-sets|chords-tunes)\.json$/.test(url.pathname)) {
    event.respondWith(handleDBCaching(request));
    return;
  }

  // Handle all other assets

  event.respondWith(handleAssetCaching(request));
});

// Cache and retrieve up-to-date Session DB files

async function handleDBCaching(request) {

  const appCache = await caches.open(CACHE_NAME);

  // Serve DB from cache if not outdated, use offline-safe lookup

  const cachedDB = await caches.match(request, { ignoreSearch: true });

  if (cachedDB && !isCacheExpired(cachedDB, CACHE_EXPIRES_DAYS)) {
    console.log(
      `[NS App Service Worker]\n\n` +
      `Retrieving cachedDB version of Session DB`
    );
    return cachedDB;
  }

  // Fetch up-to-date DB from network, fall back to cached DB
  
  try {
    console.log(
      `[NS App Service Worker]\n\n` +
      `Session DB missing or outdated\n\n` +
      `Fetching a fresh version...`
    );
    const networkResponse = await fetch(request);
    if (networkResponse?.ok) {
      appCache.put(request, networkResponse.clone());
      console.log(
        `[NS App Service Worker]\n\n` +
        `Session DB successfully updated`
      );
      return networkResponse;
    }
  } catch (error) {
    console.log(
      `[NS App Service Worker]\n\n` +
      `Fetch unsuccessful. Falling back to cached version of Session DB`);
  }

  if (cachedDB) {
    return cachedDB;
  }

  return new Response(
    JSON.stringify({ error: 'Offline: No cached Session DB available' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

// Fetch app assets from network or cache with offline-safe request

async function handleAssetCaching(request) {

  // Get assets from cache, ignoring search parameters

  const cachedAsset =
    await caches.match(request, { ignoreSearch: true });

  if (cachedAsset) {
    return cachedAsset;
  }

  // Get assets from network, fix headers if needed

  try {

    // Try fetching assets from network

    const networkResponse = await fetch(request);
    return networkResponse;

  } catch(error) {

    // Use fallbacks for specific cases

    if (request.destination === 'script' || request.destination === 'font') {

      const cacheKey = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        mode: 'same-origin',
        credentials: request.credentials,
        cache: 'only-if-cached',
        redirect: request.redirect
      });

      const fallbackResponse =
        await caches.match(cacheKey);

      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    if (request.destination === 'image') {
      return caches.match('assets/screens/placeholder-offline-h.webp');
    }

    console.warn(`[NS App Service Worker] Offline: No cached assets available for this <${request.destination}>`, error);
  }
}

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {
  const date = cachedResponse.headers.get('date');
  if (!date) return true;
  return (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24) >= maxAgeInDays;
}