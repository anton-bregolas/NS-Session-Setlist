const APP_VERSION = "1.1.18";
const CACHE_VERSION = APP_VERSION.replaceAll(".", '');
const CACHE_PREFIX = "ns-app-cache-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CACHE_EXPIRES_DAYS = 7;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'assets/fonts/FiraSans-Regular.ttf',
        'assets/fonts/FiraSans-SemiBold.ttf',
        'assets/icons/app-icon-192x192.png',
        'assets/icons/app-icon-512x512.png',
        'assets/icons/app-icon-maskable-192x192.png',
        'assets/icons/app-icon-maskable-512x512.png',
        'assets/icons/apple-touch-icon.png',
        'assets/icons/icons.svg',
        'assets/icons/icons-chord-viewer.svg',
        'assets/images/playalong-polkas-johnwalshs.jpg',
        'assets/images/playalong-polkas-pando.jpg',
        'assets/images/playalong-polkas-toureendarby.jpg',
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
        'styles/styles-chord-viewer.css',
        'styles/styles-list-viewer.css',
        'styles/styles-nss-app.css',
        'abc-encoder.html',
        'app.webmanifest',
        'favicon.ico',
        'favicon.svg',
        'index.html',
        'version.js'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => { 
                console.log(`[NS App Service Worker]\n\n` +
                `Cached version: v${cacheName.slice(CACHE_PREFIX.length)}\n\n` +
                `Current version: v${CACHE_VERSION}\n\n` +
                `Clearing outdated cached files...`);
                caches.delete(cacheName);
            })
        );
      })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Activate new service worker on page reload
        self.clients.claim().then(() => {
            // Stop the old service worker, notify about version change in console 
            console.log(`[NS App Service Worker]\n\n` + `Cache version updated to v${CACHE_VERSION}`);
            self.registration.unregister().then(() => {
                self.skipWaiting();
            });
        })
    );
});

self.addEventListener('fetch', (event) => {

  // Cache and retrieve HTML for main app sections (Launch Screen & ABC Encoder)

  if (event.request.mode === 'navigate' || event.request.headers.get('Accept').includes('text/html')) {
  
    if (event.request.url.endsWith('abc-encoder.html')) {
      event.respondWith(
        caches.match('abc-encoder.html').then((cachedPage) => {
          return cachedPage || fetch(event.request);
        }).catch(() => caches.match('abc-encoder.html'))
      );

    } else {
      event.respondWith(
        caches.match('index.html').then((cachedPage) => {
          return cachedPage || fetch(event.request);
        }).catch(() => caches.match('index.html'))
      );
    }
    return;
  }

  // Cache and retrieve Session DB files

  if (event.request.url.endsWith('sets.json') ||
      event.request.url.endsWith('tunes.json') || 
      event.request.url.endsWith('chords-sets.json') || 
      event.request.url.endsWith('chords-tunes.json')) {
      event.respondWith(
        // Check if the file is already cached
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            // If found in cache and the cache has not expired, retrieve it from cache
            if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_EXPIRES_DAYS)) {
              console.log(`[NS App Service Worker]\n\n` + `Retrieving cached version of Session DB`);
              return cachedResponse;
            }
            // If not found in cache or outdated, try to retrieve a fresh copy
            console.log(`[NS App Service Worker]\n\n` + `Session DB missing or outdated\n\n` + `Fetching a fresh version...`);
            return fetchWithTimeout(event.request, 30000)
              .then((networkResponse) => {
                if (navigator.onLine && networkResponse && networkResponse.ok) {
                  // Clone the network response without accessing its body
                  const responseHeaders = new Headers(networkResponse.headers);
                  responseHeaders.set('Date', new Date().toUTCString());
                  // Create a new Response object with the cloned headers and the body stream
                  const responseWithDateHeader = new Response(networkResponse.body, {
                    status: networkResponse.status,
                    statusText: networkResponse.statusText,
                    headers: responseHeaders,
                  });
                  // Update cache with the fresh response
                  cache.put(event.request, responseWithDateHeader.clone());
                  console.log(`[NS App Service Worker]\n\n` + `Session DB successfully updated`);
                  return responseWithDateHeader;
                }
  
                // If fetch fails or navigator is offline, fall back to cached version
                console.log(`[NS App Service Worker]\n\n` + `Fetch unsuccessful. Retrieving cached version of Session DB`);
                return cachedResponse;
              })
              .catch((error) => {
                // console.warn(`[NS App Service Worker]\n\n` + `Fetch error caught:\n\n` + error);
                // Fall back to cached version if fetch throws an error
                if (cachedResponse) {
                  console.log(`[NS App Service Worker]\n\n` + `Falling back to cached version of Session DB`);
                  return cachedResponse;
                }
                // If no cached response, return an error response
                return new Response('Fetch error: No cached Session DB available', {
                  status: 400,
                  statusText: 'Fetch error and no cached Session DB available',
                });
              });
          });
        })
      );

  } else {
      event.respondWith(
          caches.match(event.request).then((response) => {
              // console.log(`[NS App Service Worker]\n\n` + `Loading cached version of the file`);
              return response || fetch(event.request);
          })
      );
  }
});

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {

    const cacheDateHeader = cachedResponse.headers.get('date');

    if (cacheDateHeader) {
      const cacheDate = new Date(cacheDateHeader);
      const currentDate = new Date();
      const differenceInDays = (currentDate - cacheDate) / (1000 * 60 * 60 * 24);
      // console.log(`[NS App Service Worker]\n\n` + `Date of cached Session DB:\n\n` + cacheDate);
      return differenceInDays >= maxAgeInDays;
    }

    return false;
  }

  // Helper function preventing infinite loading if connection is lost during fetch request

function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`[NS App Service Worker]\n\n` + `Fetch request timed out`)), timeout)
    ),
  ]);
}