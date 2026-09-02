/**
 * Service Worker for PWA and Push Notifications
 */

const CACHE_PREFIX = 'ag-service-'
const CACHE_NAME = `${CACHE_PREFIX}static-v2`
const PRECACHE_URLS = [
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
]
const PRECACHE_PATHS = new Set(PRECACHE_URLS)

function shouldCache(request) {
  if (request.method !== 'GET') return false

  const url = new URL(request.url)

  if (!['http:', 'https:'].includes(url.protocol)) return false
  if (url.origin !== self.location.origin) return false

  return url.pathname.startsWith('/_next/static/') || PRECACHE_PATHS.has(url.pathname)
}

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching public static assets')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Cache only same-origin public static assets. Auth pages, API responses and
// unsupported schemes such as chrome-extension:// must always bypass the worker.
self.addEventListener('fetch', (event) => {
  if (!shouldCache(event.request)) return

  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) return cachedResponse

      const response = await fetch(event.request)

      if (response.status === 200 && response.type === 'basic') {
        try {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(event.request, response.clone())
        } catch (error) {
          console.warn('[Service Worker] Static asset cache failed:', error)
        }
      }

      return response
    })
  )
})

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event)

  let notificationData = {}
  
  try {
    notificationData = event.data ? event.data.json() : {}
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error)
    notificationData = {
      title: 'New Notification',
      body: event.data ? event.data.text() : 'You have a new notification'
    }
  }

  const {
    title = 'AG Service',
    body = 'New notification',
    icon = '/icon-192x192.svg',
    badge = '/icon-192x192.svg',
    tag = 'default',
    data = {},
    actions = [],
    requireInteraction = false
  } = notificationData

  const options = {
    body,
    icon,
    badge,
    tag,
    data,
    actions,
    requireInteraction,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync (for offline message queue)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag)
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      // Handle syncing offline messages
      Promise.resolve()
    )
  }
})

