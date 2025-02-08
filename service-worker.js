const CACHE_NAME = 'aulaPass-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    // Recursos externos y locales
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap',
    'https://cdn.jsdelivr.net/gh/baroninn/qrcodejs@master/jquery.min.js',
    'https://cdn.jsdelivr.net/gh/baroninn/qrcodejs@master/qrcode.js'
];

self.addEventListener('install', event => {
    // Se instalan y cachean los recursos definidos
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierta');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    // Se responde con lo cacheado, o se realiza la petición de red
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si se encuentra en cache se retorna
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    // Eliminar caches antiguos
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});