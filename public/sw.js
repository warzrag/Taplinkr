const CACHE_NAME = 'getallmylinks-v1'
const STATIC_CACHE_NAME = 'getallmylinks-static-v1'
const DYNAMIC_CACHE_NAME = 'getallmylinks-dynamic-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth/signin',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API routes that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/links$/,
  /\/api\/analytics\/dashboard$/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip requests from other origins
  if (url.origin !== location.origin) {
    return
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Static assets - Cache First strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Pages - Stale While Revalidate strategy
  event.respondWith(staleWhileRevalidateStrategy(request))
})

// Network First strategy - for API calls
async function networkFirstStrategy(request) {
  const cacheName = DYNAMIC_CACHE_NAME
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok && shouldCacheAPIResponse(request.url)) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Fallback to cache
    console.log('Network failed, trying cache for:', request.url)
    const cacheResponse = await caches.match(request)
    
    if (cacheResponse) {
      return cacheResponse
    }
    
    // Return offline page for API calls
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache First strategy - for static assets
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  const cacheResponse = await cache.match(request)
  
  if (cacheResponse) {
    return cacheResponse
  }
  
  // If not in cache, fetch and cache
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Failed to fetch asset:', request.url)
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Stale While Revalidate strategy - for pages
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cacheResponse = await cache.match(request)
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => {
      console.log('Background fetch failed for:', request.url)
    })
  
  // Return cached version immediately if available
  if (cacheResponse) {
    return cacheResponse
  }
  
  // If no cache, wait for network
  try {
    return await fetchPromise
  } catch (error) {
    return new Response('Page not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.includes('.') && (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2')
  )
}

function shouldCacheAPIResponse(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  if (!event.data) {
    return
  }
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked')
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data
  
  let url = '/'
  
  if (action === 'view_link' && data?.linkId) {
    url = `/dashboard?linkId=${data.linkId}`
  } else if (action === 'view_analytics') {
    url = '/dashboard/analytics'
  } else if (data?.url) {
    url = data.url
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics())
  }
})

async function syncAnalytics() {
  try {
    // Sync pending analytics data when back online
    console.log('Syncing analytics data...')
    
    // This would sync any queued analytics events
    // Implementation depends on your offline data storage strategy
    
  } catch (error) {
    console.log('Analytics sync failed:', error)
  }
}