const CACHE_NAME = 'directorio-ops-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// Instalación: guardar archivos básicos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Interceptación de peticiones de red
self.addEventListener('fetch', event => {
  const requestUrl = event.request.url;

  // Si la petición es a Google Apps Script (datos de la agenda)
  if (requestUrl.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si hay internet, guarda la respuesta fresca en caché y la entrega
          const responseClone = response.clone();
          caches.open('agenda-data-cache').then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si NO hay internet (fail fetch), entrega la última copia guardada
          return caches.match(event.request);
        })
    );
  } else {
    // Para archivos estáticos (HTML/CSS)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
