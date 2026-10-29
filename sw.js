/**
 * TiagoTech - Progressive Web App (PWA) Service Worker
 * Brinda carga ultra-rápida, aceleración en caché y funcionamiento offline para TiagoTech
 */

const CACHE_NAME = 'tiagotech-v2026-1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/main.css',
  '/css/tech-theme.css',
  '/js/canvas-bg.js',
  '/js/animations.js',
  '/js/app.js',
  '/manifest.json',
  '/assets/img/favicon.png',
  '/assets/img/tiagotech-symbol.png',
  '/assets/img/whatsapp.svg',
  '/404.html'
];

// Instalación: Pre-cacheados los recursos estáticos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza automática de versiones anteriores de caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch Inteligente:
// 1. Peticiones POST o a APIs externas (Web3Forms): Pasar directo a la red (sin caché)
// 2. Páginas HTML (navegación): Network-First con fallback a caché y página 404
// 3. Recursos estáticos locales (CSS, JS, imágenes, fuentes): Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignorar peticiones no GET (formularios POST)
  if (req.method !== 'GET') {
    return;
  }

  // Ignorar APIs externas y servicios de correo
  if (url.hostname.includes('web3forms.com')) {
    return;
  }

  // Navegación HTML: Network-first
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match('/404.html') || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Recursos estáticos locales: Cache-first con actualización en segundo plano
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return networkRes;
          })
          .catch(() => cachedRes);

        return cachedRes || fetchPromise;
      })
    );
  }
});
