var staticCacheName = "pwa-v" + new Date().getTime();
var filesToCache = [
    'index.html',
    'style.css',
    'script.js',
    'res/favicon.png',
    'res/favicon_maskable.png',
    'res/correct.mp3',
    'res/incorrect.mp3',
    'res/fuzzysort-min.js',
    'res/leaflet.js',
    'res/leaflet.css',
    'res/leaflet.js.map',
    'manifest.json',
    'res/countryData.js',
    'res/geoJSON.js',
];

// Cache on install
self.addEventListener("install", event => {
    this.skipWaiting();
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
    )
});

// Clear cache on activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => (cacheName.startsWith("pwa-")))
                    .filter(cacheName => (cacheName !== staticCacheName))
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// Serve from Cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(() => {
                return caches.match('index.html');
            })
    )
});