const CACHE_NAME = 'ishas-cache-v2';
const APP_SHELL = ['/', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Network-first for same-origin API calls (always want fresh data when
// online), cache-first for the static app shell so it works offline.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // CRITICAL: never intercept cross-origin requests (e.g. the backend API
  // hosted on a different domain like Render, or Cloudinary images, or the
  // Socket.IO connection). Let the browser handle those completely natively
  // — otherwise a slow/cold backend or a transient network hiccup gets
  // swallowed here and reported back as an opaque, unrecoverable failure
  // instead of the real underlying network behavior (retries, timeouts, etc).
  if (url.origin !== self.location.origin) {
    return;
  }

  // Same-origin API calls (only relevant when the frontend and backend are
  // served from the same domain, e.g. behind the Docker/nginx reverse proxy).
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // No cached copy and the network failed — surface a real network
        // error to the page instead of returning `undefined`, which the
        // Fetch API cannot turn into a Response and throws on.
        return Response.error();
      })
    );
    return;
  }

  // Static app shell / assets
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).catch(async () => {
          const fallback = await caches.match('/');
          return fallback || Response.error();
        })
    )
  );
});
