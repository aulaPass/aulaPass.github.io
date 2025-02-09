// service-worker.js

// Nombre de la cache (versionable para facilitar la limpieza de versiones antiguas)
const CACHE_NAME = 'aulaPass-cache-v2';

// Lista de URLs y recursos a cachear durante la instalación
const urlsToCache = [
  './',                          // Página raíz
  './index.html',                // Página principal
  './manifest.json',             // Manifest de la PWA
  './colores.json',              // Archivo JSON (si es necesario)
  '/favicon-16x16.png',          // Favicon de 16x16
  '/favicon-32x32.png',          // Favicon de 32x32
  '/apple-touch-icon.png',       // Icono para dispositivos Apple
  'https://cdn.tailwindcss.com', // Tailwind CSS
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/gh/baroninn/qrcodejs@master/jquery.min.js',
  'https://cdn.jsdelivr.net/gh/baroninn/qrcodejs@master/qrcode.js'
];

// Evento "install": Se instala el Service Worker y se cachean los recursos definidos.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache abierta durante la instalación');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Error al cachear en install:', error))
  );
});

// Evento "fetch": Estrategia Network First.
// 1. Se intenta obtener la respuesta desde la red.
// 2. Si es exitosa (status 200), se guarda una copia en la cache y se retorna la respuesta.
// 3. Si falla la red, se intenta entregar la versión cacheada.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si la respuesta es válida, se guarda en la cache
        if (networkResponse && networkResponse.status === 200) {
          // Se clona la respuesta para poder guardarla y retornarla a la vez
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            })
            .catch(error => console.error('Error al cachear la respuesta:', error));
        }
        return networkResponse;
      })
      .catch(() => {
        // En caso de error en la red, se retorna la versión cacheada (si existe)
        return caches.match(event.request);
      })
  );
});

// Evento "activate": Se encarga de eliminar caches antiguos que no coincidan con la versión actual.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Service Worker: Eliminando cache antigua', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});
