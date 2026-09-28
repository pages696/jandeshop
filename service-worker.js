// Service worker de Jandé Shop.
// Sube el número de versión cada vez que quieras forzar a los celulares
// que ya instalaron la app a limpiar su caché vieja.
const CACHE_NAME = "jandeshop-v1";
const STATIC_ASSETS = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // La página principal (index.html) SIEMPRE se pide primero a internet,
  // para que nunca se quede pegada una versión vieja del sitio.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("index.html"))
    );
    return;
  }

  // Solo íconos y el manifest se guardan en caché, para que la app cargue
  // rápido y funcione como app instalada aunque haya poca señal.
  if (STATIC_ASSETS.some(a => req.url.endsWith(a))) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});
