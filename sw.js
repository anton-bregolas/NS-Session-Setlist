const APP_VERSION = '1.2.3';
const appVersionArr = APP_VERSION.split('.');
const APP_CACHE_VERSION =
  appVersionArr[0] + appVersionArr[1] +
  (appVersionArr.length > 2? appVersionArr[2].padStart(2, "0") : '');
const APP_CACHE_PREFIX = "ns-app-cache-";
const APP_CACHE_NAME = `${APP_CACHE_PREFIX}${APP_CACHE_VERSION}`;
const DB_CACHE_NAME = "session-db-cache";

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

  const cache = await caches.open(APP_CACHE_NAME);

  try {

    await cache.addAll(APP_ASSETS);

  } catch (error) {

    console.warn(`[NS App Service Worker] Failed to cache main app assets`, error);
  }

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
      .filter(cacheKey => cacheKey.startsWith(APP_CACHE_PREFIX) && cacheKey !== APP_CACHE_NAME)
      .map(cacheKey => {
        console.log(`[NS App Service Worker]\n\n` +
          `Cached version: v${cacheKey.slice(APP_CACHE_PREFIX.length)}\n\n` +
          `Current version: v${APP_CACHE_VERSION}\n\n` +
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
      fetch(request).catch(() => {
        return new Response(null, { status: 204, statusText: 'No Content' });
      })
    );
    return;
  }

  // Filter out unrelated requests

  if (request.method !== 'GET') {
    return;
  }

  // Check if network requests must be prioritized

  const isNoCache = request.cache === 'no-cache';

  // Handle page navigation

  if (request.mode === 'navigate') {

    event.respondWith(handleNavigate(event, url.pathname));
    return;
  }

  // Handle version files, skip network-only requests

  if (/version\.json$/.test(url.pathname) && /^\?t\=\d*/.test(url.search)) {

    return;
  }

  // Handle Session DB files

  if (/(sets|tunes|version-db)\.json$/.test(url.pathname)) {

    event.respondWith(handleDBCaching(event, isNoCache));
    return;
  }

  // Handle all other assets

  event.respondWith(handleAssetCaching(event, isNoCache));
});

// Handle navigation: Serve cached HTML for main app sections
// No cache: Fall back to network response & add to app cache

async function handleNavigate(event, pathname, isNoCache) {

  const request = event.request;

  // Redirect to /index.html from root
  const cacheKey =
    (pathname === '/' || pathname === '/index.html')?
      '/index.html' : pathname;

  // Try cached pages first
  const pageCached =
    await caches.match(cacheKey);

  if (pageCached && !isNoCache)
    return pageCached;

  // Fall back to network response
  try {

    const pageFetched = await fetch(request);

    if (pageFetched.ok) {

      const cache = await caches.open(APP_CACHE_NAME);

      cache.put(request, pageFetched.clone());
      
      return pageFetched;
    }

  } catch (error) {
    
    // Force loading from cache in case hard reload skips it
    if (pageCached) return pageCached;

    // Return response with error if no pages available
    console.warn(
      `[NS App Service Worker]\n\n` +
      `Offline: No cached page available`
    );

    return new Response(
      JSON.stringify({ error: 'Offline: No cached page available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache and retrieve up-to-date Session DB files
// Use stale-while-revalidate cache update strategy

async function handleDBCaching(event, isNoCache) {

  const request = event.request;

  const sessionDbCache = await caches.open(DB_CACHE_NAME);

  const cachedResponse = await sessionDbCache.match(request);

  // Serve DB from cache immediately

  if (!!cachedResponse && !isNoCache) {

    console.log(
      `[NS App Service Worker]\n\n` +
      `Retrieving cached version of Session DB`
    );

    // Fetch up-to-date DB from network in background

    handleDBFetchUpdate(event);

    return cachedResponse;
  }

  // Serve DB from network if no cache

  return handleDBFetchUpdate(event, true);
}

// Fetch Session DB files and update DB cache

async function handleDBFetchUpdate(event, isFallback) {

  const request = event.request;

  try {

    if (isFallback) {

      console.log(
        `[NS App Service Worker]\n\n` +
        `Fetching Session DB update from network...`
      );
    }

    const networkResponse = await fetch(request, { cache: "no-cache" });

    if (networkResponse.ok) {

      const sessionDbCache = await caches.open(DB_CACHE_NAME);

      await sessionDbCache.put(request, networkResponse.clone());

      console.log(`[NS App Service Worker]\n\nSession DB successfully updated`);

      return networkResponse;
    }

  } catch (error) {

    if (isFallback) {

      return new Response(
        JSON.stringify({ 'error': 'Offline: No cached Session DB available' }),
        { 'status': 503, 'headers': { 'Content-Type': 'application/json' } }
      );

    } else {

      console.log(
        `[NS App Service Worker]\n\n` +
        `Update unsuccessful: Using cached version of Session DB`
      );
    }
  }
}

// Fetch app assets from network or cache with offline-safe request

async function handleAssetCaching(event, isNoCache) {

  const request = event.request;

  // Get assets from cache, ignoring search parameters

  const cachedAsset = await caches.match(request, { ignoreSearch: true });

  if (cachedAsset && !isNoCache) {

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