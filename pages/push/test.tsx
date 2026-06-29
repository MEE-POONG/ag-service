import { useState } from 'react'
import { TheLayout } from '@/components/TheLayout'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import axios from '@/lib/axios'

export default function PushNotificationTestPage() {
  const { user } = useAuth()
  const {
    isSupported,
    permission,
    isSubscribed,
    isPending,
    subscribe,
    unsubscribe,
    requestPermission
  } = usePushNotifications()

  const [title, setTitle] = useState('ทดสอบการแจ้งเตือน')
  const [body, setBody] = useState('นี่คือข้อความทดสอบระบบ Push Notification')

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission()
      if (result === 'granted') {
        toast.success('อนุญาตให้แจ้งเตือนแล้ว')
      } else {
        toast.error('ผู้ใช้ไม่อนุญาตให้แจ้งเตือน')
      }
    } catch (error) {
      toast.error('ขอสิทธิ์ไม่ได้')
      console.error(error)
    }
  }

  const handleSubscribe = async () => {
    try {
      await subscribe()
      toast.success('สมัครรับการแจ้งเตือนแล้ว')
    } catch (error: any) {
      toast.error(error?.message || 'สมัครรับการแจ้งเตือนไม่สำเร็จ')
    }
  }

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe()
      toast.success('ยกเลิกการแจ้งเตือนแล้ว')
    } catch (error: any) {
      toast.error(error?.message || 'ยกเลิกการแจ้งเตือนล้มเหลว')
    }
  }

  const handleSendTest = async () => {
    if (!user?.id) {
      toast.error('ไม่พบข้อมูลผู้ใช้')
      return
    }

    try {
      const res = await axios.post('/api/push/send', {
        userId: user.id,
        title,
        body,
        data: {
          test: true,
          triggeredAt: new Date().toISOString()
        }
      })

      if (res.data?.success) {
        toast.success(res.data?.message || 'ส่งการแจ้งเตือนแล้ว')
      } else {
        toast.error(res.data?.error || 'ส่งการแจ้งเตือนล้มเหลว')
      }
    } catch (error: any) {
      console.error('Send push test error:', error)
      toast.error(error?.response?.data?.error || 'ส่งการแจ้งเตือนไม่สำเร็จ')
    }
  }

  const statusBadges = [
    { label: 'รองรับ', value: isSupported ? 'รองรับ' : 'ไม่รองรับ', color: isSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' },
    { label: 'สิทธิ์', value: permission, color: permission === 'granted' ? 'bg-green-100 text-green-700' : permission === 'denied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700' },
    { label: 'Subscription', value: isSubscribed ? 'เปิดอยู่' : 'ปิดอยู่', color: isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700' }
  ]

  return (
    <TheLayout>
      <PageHeader
        title="ทดสอบ Push Notification"
        description="ขอสิทธิ์สมัครรับแจ้งเตือน และส่งข้อความทดสอบถึงเบราว์เซอร์ของคุณ"
        icon="FaBell"
        gradient
      />

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">สถานะระบบ</h2>
          <div className="flex flex-wrap gap-3">
            {statusBadges.map((badge) => (
              <span
                key={badge.label}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
              >
                <span className="text-gray-500">{badge.label}:</span>
                {badge.value}
              </span>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button type="button" variant="secondary" onClick={handleRequestPermission} disabled={!isSupported || isPending}>
              ขอสิทธิ์แจ้งเตือน
            </Button>
            <Button type="button" onClick={handleSubscribe} disabled={!isSupported || isPending || isSubscribed}>
              สมัครรับการแจ้งเตือน
            </Button>
            <Button type="button" variant="destructive" onClick={handleUnsubscribe} disabled={!isSupported || isPending || !isSubscribed}>
              ยกเลิกรับการแจ้งเตือน
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">ส่งการแจ้งเตือนทดสอบ</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">หัวข้อ</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ข้อความ</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
            </div>
            <Button
              type="button"
              onClick={handleSendTest}
              disabled={!isSubscribed || isPending}
            >
              ส่งการแจ้งเตือนทดสอบถึงตัวเอง
            </Button>
            {!isSubscribed && (
              <p className="text-sm text-red-500">
                * ต้องสมัครรับการแจ้งเตือนก่อนจึงจะส่งข้อความได้
              </p>
            )}
          </div>
        </div>
      </div>
    </TheLayout>
  )
}
