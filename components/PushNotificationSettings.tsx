/**
 * Push Notification Settings Component
 * UI for enabling/disabling push notifications
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import toast from 'react-hot-toast'

export function PushNotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isPending,
    permission,
    subscribe,
    unsubscribe,
    requestPermission
  } = usePushNotifications()

  const [showDetails, setShowDetails] = useState(false)

  const handleSubscribe = async () => {
    try {
      await subscribe()
      toast.success('เปิดการแจ้งเตือนแบบ Push สำเร็จ')
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถเปิดการแจ้งเตือนได้')
    }
  }

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe()
      toast.success('ปิดการแจ้งเตือนแบบ Push สำเร็จ')
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถปิดการแจ้งเตือนได้')
    }
  }

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission()
      if (result === 'granted') {
        toast.success('อนุญาตการแจ้งเตือนแล้ว')
      } else {
        toast.error('ไม่ได้รับอนุญาตให้แจ้งเตือน')
      }
    } catch (error) {
      toast.error('ไม่สามารถขออนุญาตได้')
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ReactIconComponent icon="FaExclamationTriangle" setClass="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-900">
              เบราว์เซอร์ไม่รองรับการแจ้งเตือนแบบ Push
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              กรุณาใช้เบราว์เซอร์ที่รองรับ เช่น Chrome, Firefox, Edge เวอร์ชันล่าสุด
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <ReactIconComponent icon="FaBell" setClass="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                การแจ้งเตือนแบบ Push
              </h3>
              <p className="text-sm text-gray-600">
                รับการแจ้งเตือนแม้ปิดหน้าเว็บไซต์
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSubscribed 
              ? 'bg-green-100 text-green-700'
              : permission === 'denied'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isSubscribed ? 'เปิดอยู่' : permission === 'denied' ? 'ถูกปฏิเสธ' : 'ปิดอยู่'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <ReactIconComponent icon="FaBan" setClass="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900">
                  การแจ้งเตือนถูกปฏิเสธ
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  คุณได้ปฏิเสธการอนุญาตให้แจ้งเตือนแล้ว กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์
                </p>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                >
                  {showDetails ? 'ซ่อนวิธีการ' : 'แสดงวิธีการ'}
                </button>
                {showDetails && (
                  <div className="mt-3 text-sm text-red-700 space-y-1">
                    <p>• Chrome: Settings → Privacy and security → Site Settings → Notifications</p>
                    <p>• Firefox: Settings → Privacy & Security → Permissions → Notifications</p>
                    <p>• Edge: Settings → Cookies and site permissions → Notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <ReactIconComponent icon="FaCheck" setClass="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              รับการแจ้งเตือนทันทีเมื่อมีข้อความใหม่
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ReactIconComponent icon="FaCheck" setClass="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              แจ้งเตือนแม้ปิดหน้าเว็บไซต์หรือเปิดแท็บอื่น
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ReactIconComponent icon="FaCheck" setClass="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              สามารถปิดได้ทุกเมื่อที่ต้องการ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {permission === 'default' && !isSubscribed && (
            <Button
              onClick={handleRequestPermission}
              disabled={isPending}
              className="flex-1 !bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white hover:opacity-90"
            >
              {isPending ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin mr-2" />
                  กำลังขออนุญาต...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaBell" setClass="w-4 h-4 mr-2" />
                  ขออนุญาตแจ้งเตือน
                </>
              )}
            </Button>
          )}

          {permission === 'granted' && !isSubscribed && (
            <Button
              onClick={handleSubscribe}
              disabled={isPending}
              className="flex-1 !bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white hover:opacity-90"
            >
              {isPending ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin mr-2" />
                  กำลังเปิดใช้งาน...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaBell" setClass="w-4 h-4 mr-2" />
                  เปิดการแจ้งเตือน
                </>
              )}
            </Button>
          )}

          {isSubscribed && (
            <Button
              onClick={handleUnsubscribe}
              disabled={isPending}
              variant="ghost"
              className="flex-1 !border-red-300 !text-red-600 hover:!bg-red-50"
            >
              {isPending ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin mr-2" />
                  กำลังปิด...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaBellSlash" setClass="w-4 h-4 mr-2" />
                  ปิดการแจ้งเตือน
                </>
              )}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {isSubscribed && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <ReactIconComponent icon="FaCheckCircle" setClass="w-4 h-4" />
              <span>คุณจะได้รับการแจ้งเตือนแบบ Push แล้ว</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

