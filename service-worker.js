// service-worker.js

// Nombre de la cache (versionable para facilitar la limpieza de versiones antiguas)
const CACHE_NAME = 'aulaPass-cache-v3';
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

/**
 * Evento "install":
 * - Se cachean los recursos esenciales.
 * - Se llama a skipWaiting() para activar inmediatamente el nuevo service worker.
 */
self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza la activación inmediata del nuevo service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache abierta durante la instalación');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Error al cachear en install:', error))
  );
});

/**
 * Evento "fetch":
 * Estrategia network-first:
 * 1. Se intenta obtener la respuesta desde la red.
 * 2. Si la respuesta es exitosa (status 200), se guarda una copia en la cache.
 * 3. Si falla la conexión, se retorna una respuesta personalizada informando de la falta de conexión.
 *    (Sin usar el contenido cacheado, ya que no se desea acceso offline).
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si la respuesta es válida, se almacena en la cache para futuras actualizaciones
        if (networkResponse && networkResponse.status === 200) {
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
        // En caso de error en la red, se retorna una respuesta personalizada
        return new Response('No hay conexión a internet. Por favor, revisa tu red.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({'Content-Type': 'text/plain'})
        });
      })
  );
});

/**
 * Evento "activate":
 * - Se eliminan caches antiguos que no coincidan con la versión actual.
 * - Se llama a clients.claim() para tomar el control inmediato de las páginas.
 */
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
      }).then(() => self.clients.claim())
  );
});
