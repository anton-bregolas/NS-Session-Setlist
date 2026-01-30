const APP_VERSION = '1.2.3';
const appVersionArr = APP_VERSION.split('.');
const CACHE_VERSION =
  appVersionArr[0] + appVersionArr[1] +
  (appVersionArr.length > 2? appVersionArr[2].padStart(2, "0") : '');
const CACHE_PREFIX = "ns-app-cache-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CACHE_EXPIRES_DAYS = 7;

const APP_ASSETS = [
  'index.html',
  'abc-encoder.html',
  'styles/styles-chord-viewer.css',
  'styles/styles-list-viewer.css',
  'styles/styles-nss-app.css',
  'modules/scripts-abc-utils.js',
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
  'assets/images/placeholder-offline.webp',
  'favicon.ico',
  'favicon.svg',
  'version.json'
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
  'assets/images/az.webp',
  'app.webmanifest'
];

// Install service worker with critical assets
// Skip waiting to activate service worker immediately
// Keep loading low-priority assets after activation

self.addEventListener('install', event => {

  event.waitUntil(handleInstall());
});

async function handleInstall() {

  // Cache critical app assets immediately

  const cache = await caches.open(CACHE_NAME);

  await cache.addAll(APP_ASSETS);

  await self.skipWaiting();

  // Lazy-load non-critical assets in the background

  try {

    await cache.addAll(APP_ASSETS_LAZY);

  } catch (error) {

    console.warn(`[NS App Service Worker] Lazy-loading of assets interrupted`, error);
  }
}

// Activate service worker, clear outdated caches, claim all pages

self.addEventListener('activate', event => {

  event.waitUntil(handleActivate());
});

async function handleActivate() {

  const cacheKeys = await caches.keys();

  await Promise.all(
    cacheKeys
      .filter(cacheKey => cacheKey.startsWith(CACHE_PREFIX) && cacheKey !== CACHE_NAME)
      .map(cacheKey => {
        console.log(`[NS App Service Worker]\n\n` +
          `Cached version: v${cacheKey.slice(CACHE_PREFIX.length)}\n\n` +
          `Current version: v${CACHE_VERSION}\n\n` +
          `Clearing outdated cached files...`);
        return caches.delete(cacheKey);
      })
  );

  await self.clients.claim();
}

// Handle service worker fetch requests

self.addEventListener('fetch', event => {

  const { request } = event;
  
  const url = new URL(request.url);

  // Handle offline behavior of analytics

  if (url.hostname.includes('gc.zgo.at') || url.hostname.includes('goatcounter.com')) {
    
    if (self.location.hostname === 'localhost' ||
        self.location.hostname.match(/127\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      
      event.respondWith(new Response(null, { status: 204, statusText: 'No Content' }));
      return;
    }

    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(null, { status: 204, statusText: 'No Content' });
      })
    );
    return;
  }

  // Filter out unrelated requests

  if (request.method !== 'GET') {
    return;
  }

  // Handle page navigation

  if (request.mode === 'navigate') {

    event.respondWith(handleNavigate(url));
    return;
  }

  // Handle Session DB files

  if (/(sets|tunes)\.json$/.test(url.pathname)) {

    event.respondWith(handleDBCaching(request));
    return;
  }

  // Handle version.json, skip network-only requests

  if (/version\.json$/.test(url.pathname) && /^\?t\=\d*/.test(url.search)) {

    return;
  }

  // Handle all other assets

  event.respondWith(handleAssetCaching(request));
});

// Handle navigation: Serve cached HTML for main app sections
// Fall back to launch screen page if no resource cached

async function handleNavigate(url) {

  const targetPage =
    url.pathname.includes('abc-encoder')?
      'abc-encoder.html' :
      'index.html';
  
  // Try cached pages first
  const pageCached =
    await caches.match(targetPage);

  if (pageCached) return pageCached;

  // Fall back to network response
  try {

    const pageFetched =
      await fetch(targetPage);

    if (pageFetched?.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(targetPage, pageFetched.clone());
    }

    return pageFetched;

  // Force loading from cache in case hard reload skips it
  } catch (error) {

    const indexCached =
      await caches.match('index.html');

    if (indexCached) return indexCached;

  // Return response with error if no pages available
    console.warn(
      `[NS App Service Worker]\n\n` +
      `Offline: No cached pages available`
    );

    return new Response(
      JSON.stringify({ error: 'Offline: No cached pages available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache and retrieve up-to-date Session DB files

async function handleDBCaching(request) {

  const appCache = await caches.open(CACHE_NAME);

  // Serve DB from cache if not outdated, use offline-safe lookup

  const cachedDB = await caches.match(request, { ignoreSearch: true });

  if (cachedDB && !isCacheExpired(cachedDB, CACHE_EXPIRES_DAYS)) {
    console.log(
      `[NS App Service Worker]\n\n` +
      `Retrieving cached version of Session DB`
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

    if (networkResponse && networkResponse.ok) {
      await appCache.put(request, networkResponse.clone());
      console.log(`[NS App Service Worker]\n\nSession DB successfully updated`);
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

  const cachedAsset = await caches.match(request, { ignoreSearch: true });

  if (cachedAsset) {

    return cachedAsset;
  }

  // Get assets from network, fix headers if needed

  try {

    // Try fetching assets from network

    const networkResponse = await fetch(request);

    return networkResponse;

  } catch (error) {

    // Fallback for critical asset types
    
    if (request.destination === 'script' ||
        request.destination === 'json' ||
        request.destination === 'font') {
 
      const cacheOnlyRequest = new Request(request.url, {
        method: 'GET',
        mode: 'same-origin',
        cache: 'only-if-cached',
        credentials: 'omit'
      });

      const fallbackResponse =
        await caches.match(cacheOnlyRequest);

      if (fallbackResponse) {

        return fallbackResponse;
      }
    }

    if (request.destination === 'image') {
      
      return await caches.match('assets/images/placeholder-offline.webp') || new Response('', { status: 404 });
    }

    // Return a generic failed response if no fallback is available

    console.warn(
      `[NS App Service Worker]\n\n` +
      `Offline: No cached assets available for this ` +
      `${request.destination? request.destination : 'item'}:\n\n` +
      `${request.url}\n\n`, error
    );

    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {

  const dateHeader = cachedResponse.headers.get('date');
  if (!dateHeader) return true;
  const ageInDays = (Date.now() - new Date(dateHeader)) / (1000 * 60 * 60 * 24);
  return ageInDays >= maxAgeInDays;
}