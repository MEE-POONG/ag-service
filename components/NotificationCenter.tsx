/**
 * Notification Center Component
 * Dropdown showing in-app notifications
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  icon?: string
  actionUrl?: string
  actionLabel?: string
  isRead: boolean
  createdAt: string
  metadata?: any
}

export function NotificationCenter() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const socket = useSocket({
    userId: user?.id,
    userType: 'agent',
    username: user?.name || user?.username,
    autoConnect: !!user,
  })

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', isOpen],
    queryFn: async () => {
      const res = await axios.get('/api/notifications', {
        params: { pageSize: 20 }
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to load')
      return res.data
    },
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false, // Refresh every 30s when open
  })

  // Fetch unread count
  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: async () => {
      const res = await axios.get('/api/notifications/count')
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to load count')
      return res.data.data
    },
    refetchInterval: 10000, // Refresh every 10s
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const res = await axios.put('/api/notifications', { notificationIds })
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to mark as read')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.put('/api/notifications', { markAll: true })
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('ทำเครื่องหมายทั้งหมดอ่านแล้ว')
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await axios.delete('/api/notifications', { data: { notificationId } })
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to delete')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Real-time: Listen for new notifications
  useEffect(() => {
    if (!socket.isConnected) return

    return socket.onNotification((payload) => {
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Show toast for new notification
      toast(payload.message, {
        icon: payload.type === 'success' ? '✅' : 
              payload.type === 'error' ? '❌' : 
              payload.type === 'warning' ? '⚠️' : 'ℹ️',
        duration: 5000,
      })
    })
  }, [socket, queryClient])

  const notifications: Notification[] = notificationsData?.data || []
  const unreadCount = countData?.unreadCount || 0

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate([notification.id])
    }

    // Navigate if has action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsOpen(false)
    }
  }

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon

    switch (notification.type) {
      case 'message':
        return '💬'
      case 'conversation':
        return '💬'
      case 'assignment':
        return '👤'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (notification: Notification) => {
    switch (notification.type) {
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'success':
        return 'text-green-600'
      case 'message':
      case 'conversation':
        return 'text-blue-600'
      case 'assignment':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'เมื่อสักครู่'
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    if (days < 7) return `${days} วันที่แล้ว`
    
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ReactIconComponent icon="FaBell" setClass="w-5 h-5 text-gray-600" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    ทำเครื่องหมายทั้งหมดอ่านแล้ว
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <ReactIconComponent icon="FaSpinner" setClass="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ReactIconComponent icon="FaBell" setClass="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-purple-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`text-2xl ${getNotificationColor(notification)} flex-shrink-0`}>
                          {getNotificationIcon(notification)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.actionLabel && (
                              <span className="text-xs text-purple-600 font-medium">
                                {notification.actionLabel} →
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotificationMutation.mutate(notification.id)
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        >
                          <ReactIconComponent icon="FaTimes" setClass="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    router.push('/notifications')
                    setIsOpen(false)
                  }}
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  ดูการแจ้งเตือนทั้งหมด
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

