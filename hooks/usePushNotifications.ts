/**
 * Push Notifications Hook
 * Handles service worker registration and push subscription
 */

import { useState, useEffect, useCallback } from 'react'
import axios from '@/lib/axios'

interface UsePushNotificationsReturn {
  isSupported: boolean
  isSubscribed: boolean
  isPending: boolean
  permission: NotificationPermission
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  requestPermission: () => Promise<NotificationPermission>
}

// Function to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window
    setIsSupported(supported)

    if (supported && Notification.permission) {
      setPermission(Notification.permission)
    }

    // Register service worker
    if (supported) {
      registerServiceWorker()
    }

    // Check current subscription
    checkSubscription()
  }, [])

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('[Push] Service Worker registered:', registration.scope)
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready
      console.log('[Push] Service Worker ready')
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error)
    }
  }

  // Check if already subscribed
  const checkSubscription = async () => {
    if (!isSupported) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('[Push] Error checking subscription:', error)
    }
  }

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('[Push] Permission request failed:', error)
      throw error
    }
  }, [isSupported])

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    setIsPending(true)

    try {
      // Request permission if not granted
      let perm = permission
      if (perm !== 'granted') {
        perm = await requestPermission()
      }

      if (perm !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get VAPID public key from server
      const vapidRes = await axios.get('/api/push/vapid-key')
      const vapidPublicKey = vapidRes.data.data.publicKey

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not available')
      }

      // Subscribe to push manager
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      })

      // Send subscription to server
      await axios.post('/api/push/subscribe', {
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent
      })

      setIsSubscribed(true)
      console.log('[Push] Subscribed successfully')
    } catch (error: any) {
      console.error('[Push] Subscription failed:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }, [isSupported, permission, requestPermission])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return

    setIsPending(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe()

        // Remove subscription from server
        await axios.post('/api/push/unsubscribe', {
          endpoint: subscription.endpoint
        })

        setIsSubscribed(false)
        console.log('[Push] Unsubscribed successfully')
      }
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }, [isSupported])

  return {
    isSupported,
    isSubscribed,
    isPending,
    permission,
    subscribe,
    unsubscribe,
    requestPermission
  }
}

