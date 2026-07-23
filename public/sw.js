// Taplinkr no longer caches pages in a service worker. Public pages and direct
// links must always use the latest deployed behavior.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )),
      self.registration.unregister(),
      self.clients.claim(),
    ])
  )
})
