'use client'

import { useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'

/**
 * AutoPushSubscriber
 * Subscribes to push notifications when permission is already granted.
 * It must not block the dashboard after login.
 */
export function AutoPushSubscriber() {
  const { user } = useAuth()
  const {
    isSupported,
    permission,
    isSubscribed,
    isPending,
    subscribe,
  } = usePushNotifications()

  const hasAttemptedRef = useRef(false)

  const ensureSubscription = useCallback(async () => {
    if (!user || !isSupported || isPending) return

    try {
      let currentPermission = permission
      if (currentPermission === 'default') {
        return
      }

      if (currentPermission === 'granted' && !isSubscribed) {
        await subscribe()
        toast.success('เปิดใช้งานการแจ้งเตือนอัตโนมัติสำเร็จ')
      }
    } catch (error) {
      console.error('[AutoPushSubscriber] Subscribe failed:', error)
    }
  }, [user, isSupported, isPending, permission, isSubscribed, subscribe])

  useEffect(() => {
    if (!user) {
      hasAttemptedRef.current = false
      return
    }

    if (!isSupported || isPending || isSubscribed) return
    if (permission !== 'granted') return

    if (hasAttemptedRef.current) return
    hasAttemptedRef.current = true
    ensureSubscription().finally(() => {
      if (!isSubscribed) {
        hasAttemptedRef.current = false
      }
    })
  }, [user, isSupported, permission, isSubscribed, isPending, ensureSubscription])

  return null
}
