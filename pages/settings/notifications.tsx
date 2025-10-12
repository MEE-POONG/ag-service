/**
 * Notification Settings Page
 * Configure in-app and push notification preferences
 */

import { TheLayout } from '@/components/TheLayout'
import PageHeader from '@/components/PageHeader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import toast from 'react-hot-toast'
import { PushNotificationSettings } from '@/components/PushNotificationSettings'

type Preferences = {
  id: string
  userId: string
  // In-app
  enableInApp: boolean
  inAppMessages: boolean
  inAppConversations: boolean
  inAppAssignments: boolean
  inAppSystem: boolean
  // Push
  enablePush: boolean
  pushMessages: boolean
  pushConversations: boolean
  pushAssignments: boolean
  pushSystem: boolean
  // Behavior
  soundEnabled: boolean
  desktopOnly: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  // Frequency
  groupSimilar: boolean
  maxPerHour?: number
}

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient()
  const [localPrefs, setLocalPrefs] = useState<Partial<Preferences>>({})

  // Fetch preferences
  const { data: prefsData, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await axios.get('/api/notifications/preferences')
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to load')
      return res.data.data as Preferences
    }
  })

  // Initialize local state from fetched data
  useEffect(() => {
    if (prefsData) {
      setLocalPrefs(prefsData)
    }
  }, [prefsData])

  // Update preferences mutation
  const updatePrefsMutation = useMutation({
    mutationFn: async (prefs: Partial<Preferences>) => {
      const res = await axios.put('/api/notifications/preferences', prefs)
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to update')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('บันทึกการตั้งค่าสำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'เกิดข้อผิดพลาด')
    }
  })

  // Reset preferences mutation
  const resetPrefsMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete('/api/notifications/preferences')
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to reset')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('รีเซ็ตเป็นค่าเริ่มต้นสำเร็จ')
    }
  })

  const handleSave = () => {
    updatePrefsMutation.mutate(localPrefs)
  }

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นหรือไม่?')) {
      resetPrefsMutation.mutate()
    }
  }

  const updatePref = (key: keyof Preferences, value: any) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <TheLayout>
        <div className="flex items-center justify-center h-screen">
          <ReactIconComponent icon="FaSpinner" setClass="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </TheLayout>
    )
  }

  return (
    <TheLayout>
      <PageHeader
        title="การตั้งค่าการแจ้งเตือน"
        icon="FaBell"
        description="กำหนดค่าการแจ้งเตือนในแอปและการแจ้งเตือนแบบ Push"
        gradient={true}
      />

      <div className="py-4 space-y-6">
        {/* Push Notification Settings */}
        <PushNotificationSettings />

        {/* In-App Notifications */}
        <div className="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <ReactIconComponent icon="FaDesktop" setClass="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">การแจ้งเตือนในแอป</h3>
                <p className="text-sm text-gray-600">จัดการการแจ้งเตือนภายในแอปพลิเคชัน</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">เปิดการแจ้งเตือนในแอป</h4>
                <p className="text-sm text-gray-600">แสดงการแจ้งเตือนในแอปพลิเคชัน</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPrefs.enableInApp ?? true}
                  onChange={(e) => updatePref('enableInApp', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {localPrefs.enableInApp && (
              <>
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h5 className="font-medium text-gray-900">ประเภทการแจ้งเตือน</h5>
                  
                  {/* Messages */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ReactIconComponent icon="FaComments" setClass="w-5 h-5 text-blue-600" />
                      <div>
                        <h6 className="text-sm font-medium text-gray-900">ข้อความใหม่</h6>
                        <p className="text-xs text-gray-600">แจ้งเตือนเมื่อมีข้อความใหม่</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.inAppMessages ?? true}
                      onChange={(e) => updatePref('inAppMessages', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>

                  {/* Conversations */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ReactIconComponent icon="FaInbox" setClass="w-5 h-5 text-green-600" />
                      <div>
                        <h6 className="text-sm font-medium text-gray-900">การสนทนาใหม่</h6>
                        <p className="text-xs text-gray-600">แจ้งเตือนเมื่อมีการสนทนาใหม่</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.inAppConversations ?? true}
                      onChange={(e) => updatePref('inAppConversations', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>

                  {/* Assignments */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ReactIconComponent icon="FaUserPlus" setClass="w-5 h-5 text-purple-600" />
                      <div>
                        <h6 className="text-sm font-medium text-gray-900">การมอบหมาย</h6>
                        <p className="text-xs text-gray-600">แจ้งเตือนเมื่อได้รับมอบหมาย</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.inAppAssignments ?? true}
                      onChange={(e) => updatePref('inAppAssignments', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>

                  {/* System */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ReactIconComponent icon="FaCog" setClass="w-5 h-5 text-gray-600" />
                      <div>
                        <h6 className="text-sm font-medium text-gray-900">ระบบ</h6>
                        <p className="text-xs text-gray-600">แจ้งเตือนระบบและอัพเดท</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.inAppSystem ?? true}
                      onChange={(e) => updatePref('inAppSystem', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Behavior Settings */}
        <div className="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <ReactIconComponent icon="FaCog" setClass="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">พฤติกรรมการแจ้งเตือน</h3>
                <p className="text-sm text-gray-600">กำหนดวิธีการแสดงการแจ้งเตือน</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ReactIconComponent icon="FaVolumeUp" setClass="w-5 h-5 text-blue-600" />
                <div>
                  <h6 className="text-sm font-medium text-gray-900">เสียงการแจ้งเตือน</h6>
                  <p className="text-xs text-gray-600">เล่นเสียงเมื่อมีการแจ้งเตือน</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.soundEnabled ?? true}
                onChange={(e) => updatePref('soundEnabled', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>

            {/* Group Similar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ReactIconComponent icon="FaLayerGroup" setClass="w-5 h-5 text-green-600" />
                <div>
                  <h6 className="text-sm font-medium text-gray-900">จัดกลุ่มการแจ้งเตือนที่คล้ายกัน</h6>
                  <p className="text-xs text-gray-600">รวมการแจ้งเตือนประเภทเดียวกัน</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.groupSimilar ?? true}
                onChange={(e) => updatePref('groupSimilar', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>

            {/* Desktop Only */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ReactIconComponent icon="FaDesktop" setClass="w-5 h-5 text-purple-600" />
                <div>
                  <h6 className="text-sm font-medium text-gray-900">เฉพาะเดสก์ท็อป</h6>
                  <p className="text-xs text-gray-600">แสดงการแจ้งเตือนเฉพาะบนเดสก์ท็อป</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.desktopOnly ?? false}
                onChange={(e) => updatePref('desktopOnly', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>

            {/* Quiet Hours */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ReactIconComponent icon="FaMoon" setClass="w-5 h-5 text-indigo-600" />
                  <div>
                    <h6 className="text-sm font-medium text-gray-900">ช่วงเวลาเงียบ</h6>
                    <p className="text-xs text-gray-600">ปิดการแจ้งเตือนในช่วงเวลาที่กำหนด</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.quietHoursEnabled ?? false}
                  onChange={(e) => updatePref('quietHoursEnabled', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>

              {localPrefs.quietHoursEnabled && (
                <div className="ml-8 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">เริ่มเวลา</label>
                    <input
                      type="time"
                      value={localPrefs.quietHoursStart || '22:00'}
                      onChange={(e) => updatePref('quietHoursStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">สิ้นสุดเวลา</label>
                    <input
                      type="time"
                      value={localPrefs.quietHoursEnd || '08:00'}
                      onChange={(e) => updatePref('quietHoursEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Max Per Hour */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ReactIconComponent icon="FaClock" setClass="w-5 h-5 text-red-600" />
                  <div>
                    <h6 className="text-sm font-medium text-gray-900">จำกัดการแจ้งเตือนต่อชั่วโมง</h6>
                    <p className="text-xs text-gray-600">จำนวนการแจ้งเตือนสูงสุดต่อชั่วโมง</p>
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localPrefs.maxPerHour || 20}
                  onChange={(e) => updatePref('maxPerHour', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl ring-1 ring-gray-200 shadow-sm p-6">
          <Button
            onClick={handleReset}
            disabled={resetPrefsMutation.isPending}
            variant="secondary"
            className="!border-gray-300 !text-gray-700"
          >
            {resetPrefsMutation.isPending ? (
              <>
                <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin mr-2" />
                กำลังรีเซ็ต...
              </>
            ) : (
              <>
                <ReactIconComponent icon="FaUndo" setClass="w-4 h-4 mr-2" />
                รีเซ็ตเป็นค่าเริ่มต้น
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={updatePrefsMutation.isPending}
            className="!bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white"
          >
            {updatePrefsMutation.isPending ? (
              <>
                <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin mr-2" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <ReactIconComponent icon="FaSave" setClass="w-4 h-4 mr-2" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </div>
      </div>
    </TheLayout>
  )
}

