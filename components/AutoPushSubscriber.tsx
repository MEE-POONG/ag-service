'use client'

import { useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'

/**
 * AutoPushSubscriber
 * Forces push subscription as soon as user logs in.
 */
export function AutoPushSubscriber() {
  const { user } = useAuth()
  const {
    isSupported,
    permission,
    isSubscribed,
    isPending,
    subscribe,
    requestPermission
  } = usePushNotifications()

  const hasAttemptedRef = useRef(false)

  const ensureSubscription = useCallback(async () => {
    if (!user || !isSupported || isPending) return

    try {
      let currentPermission = permission
      if (currentPermission === 'default') {
        currentPermission = await requestPermission()
      }

      if (currentPermission === 'granted' && !isSubscribed) {
        await subscribe()
        toast.success('เปิดใช้งานการแจ้งเตือนอัตโนมัติสำเร็จ')
      } else if (currentPermission === 'denied') {
        toast.error('ต้องเปิดสิทธิ์การแจ้งเตือนเพื่อใช้งานระบบแบบเต็มรูปแบบ')
      }
    } catch (error) {
      console.error('[AutoPushSubscriber] Subscribe failed:', error)
    }
  }, [user, isSupported, isPending, permission, isSubscribed, requestPermission, subscribe])

  useEffect(() => {
    if (!user) {
      hasAttemptedRef.current = false
      return
    }

    if (!isSupported || isPending || isSubscribed) return
    if (permission === 'denied' && hasAttemptedRef.current) return

    if (hasAttemptedRef.current) return
    hasAttemptedRef.current = true
    ensureSubscription().finally(() => {
      if (!isSubscribed) {
        hasAttemptedRef.current = false
      }
    })
  }, [user, isSupported, permission, isSubscribed, isPending, ensureSubscription])

  const shouldForcePrompt =
    !!user &&
    isSupported &&
    !isPending &&
    (!isSubscribed || permission !== 'granted')

  if (!shouldForcePrompt) return null

  const message =
    permission === 'denied'
      ? 'จำเป็นต้องเปิดสิทธิ์การแจ้งเตือนในเบราว์เซอร์ก่อนจึงจะใช้งานระบบต่อได้'
      : 'กรุณาอนุญาตและสมัคร push notification เพื่อใช้งานระบบ'

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-4 text-center">
        <div className="text-4xl">🔔</div>
        <h2 className="text-xl font-semibold text-gray-900">
          ต้องเปิดการแจ้งเตือนก่อนใช้งานต่อ
        </h2>
        <p className="text-gray-600">{message}</p>
        <button
          onClick={() => {
            hasAttemptedRef.current = false
            ensureSubscription()
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-green-400 text-white font-semibold hover:opacity-90 transition"
          disabled={isPending}
        >
          อนุญาตและสมัครแจ้งเตือนตอนนี้
        </button>
        {permission === 'denied' && (
          <p className="text-sm text-red-500">
            กรุณาไปที่การตั้งค่าการแจ้งเตือนของเบราว์เซอร์เพื่ออนุญาตจากนั้นกดปุ่มด้านบนอีกครั้ง
          </p>
        )}
      </div>
    </div>
  )
}
