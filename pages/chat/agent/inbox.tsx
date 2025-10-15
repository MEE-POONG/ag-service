import { TheLayout } from '@/components/TheLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { qk } from '@/lib/queryKeys'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import toast from 'react-hot-toast'
import PageHeader from '@/components/PageHeader'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'

type ChatConversation = {
  id: string
  customerId: string
  customer: {
    id: string
    customerId: string
    name?: string
    email?: string
    phone?: string
    avatarUrl?: string
  }
  assignedAdminId?: string
  assignedAdmin?: {
    id: string
    name: string
    username: string
  }
  status: string
  priority: string
  subject?: string
  lastMessage?: string
  lastMessageAt?: Date
  isUnread: boolean
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

type ChatMessage = {
  id: string
  conversationId: string
  content: string
  senderId: string
  senderType: 'customer' | 'agent'
  senderName?: string
  createdAt: Date
  attachments?: string[]
  isRead: boolean
  readAt?: Date
  readBy?: Array<{
    id: string
    name: string
    username: string
    readAt: Date
  }>
}

export default function AgentInboxPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'closed'>('all')
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}) // conversationId -> userName
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Client-side state for notification permission
  const [notificationPermission, setNotificationPermission] = useState<string>('default')
  const [isClient, setIsClient] = useState(false)

  // Push notification functions (memoized to prevent re-creation)
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined') {
      console.warn('[Notification] Window is not available (SSR)')
      return false
    }

    if (!('Notification' in window)) {
      console.warn('[Notification] This browser does not support notifications')
      return false
    }

   // console.log('[Notification] Current permission:', Notification.permission)

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted')
     // console.log('[Notification] Permission already granted')
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('[Notification] Permission denied - user needs to enable manually in browser settings')
      setNotificationPermission('denied')
      return false
    }

    // Request permission
   // console.log('[Notification] Requesting permission...')
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
   // console.log('[Notification] Permission result:', permission)
    return permission === 'granted'
  }, [])

  const sendPushNotification = useCallback((options: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: any
  }) => {
   // console.log('[Notification] Attempting to send notification:', options.title)
    
    if (typeof window === 'undefined') {
      console.warn('[Notification] Window is not available (SSR)')
      return
    }

    if (!('Notification' in window)) {
      console.warn('[Notification] This browser does not support notifications')
      return
    }

   // console.log('[Notification] Current permission state:', notificationPermission)

    if (notificationPermission === 'granted') {
     // console.log('[Notification] Creating notification...')
      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-72x72.png',
          tag: options.tag,
          data: options.data,
          requireInteraction: false // Changed to false to auto-close
        })

        notification.onclick = () => {
         // console.log('[Notification] Clicked!')
          window.focus()
          if (options.data?.conversationId) {
            setSelectedConversation(options.data.conversationId)
          }
          notification.close()
        }

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close()
        }, 5000)

       // console.log('[Notification] Notification sent successfully!')
      } catch (error) {
        console.error('[Notification] Error creating notification:', error)
      }
    } else {
      console.warn('[Notification] Permission not granted, current state:', notificationPermission)
      // Request permission if not granted
      requestNotificationPermission()
    }
  }, [notificationPermission, requestNotificationPermission])

  // Initialize Socket connection
  const socket = useSocket({
    userId: user?.id,
    userType: 'agent',
    username: user?.name || user?.username,
    autoConnect: !!user,
  })

  // Request notification permission on mount
  // Set client-side flag and check notification permission
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Request notification permission on component mount
  useEffect(() => {
    if (isClient && user) {
      requestNotificationPermission()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, user])

  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<ChatConversation[]>({
    queryKey: qk.chat.conversations(searchKeyword, filterStatus),
    queryFn: async () => {
      const res = await axios.get('/api/chat/conversations', {
        params: { keyword: searchKeyword, status: filterStatus !== 'all' ? filterStatus : undefined }
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูลล้มเหลว')
      return res.data.data || []
    },
    staleTime: 10 * 1000,
  })

  // Fetch messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: qk.chat.messages(selectedConversation || ''),
    queryFn: async () => {
      if (!selectedConversation) return []
      const res = await axios.get('/api/chat/messages', {
        params: { conversationId: selectedConversation }
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อความล้มเหลว')
      return res.data.data || []
    },
    enabled: !!selectedConversation,
    staleTime: 5 * 1000,
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { conversationId: string; content: string; customerId: string; senderType?: string }) => {
      const res = await axios.post('/api/chat/messages', payload)
      if (!res.data?.success) throw new Error(res.data?.error || 'ส่งข้อความไม่สำเร็จ')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.chat.messages(selectedConversation || '') })
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
      setMessageInput('')
      toast.success('ส่งข้อความสำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'เกิดข้อผิดพลาด')
    },
  })

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const res = await axios.post('/api/chat/messages/read', { messageIds })
      if (!res.data?.success) throw new Error(res.data?.error || 'Mark as read failed')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.chat.messages(selectedConversation || '') })
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
    },
    onError: (error: any) => {
      console.error('Mark as read error:', error)
    }
  })

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages && messages.length > 0) {
      const unreadCustomerMessages = messages.filter(msg => 
        msg.senderType === 'customer' && !msg.isRead
      )
      
      if (unreadCustomerMessages.length > 0) {
        const messageIds = unreadCustomerMessages.map(msg => msg.id)
        markAsReadMutation.mutate(messageIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation])

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && socket.isConnected) {
      socket.joinConversationRoom(selectedConversation)
      
      return () => {
        socket.leaveConversationRoom(selectedConversation)
      }
    }
  }, [selectedConversation, socket])

  // Real-time: New conversations
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onConversationNew((payload) => {
     // console.log('[Real-time] New conversation:', payload)
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
      toast.success('มีการสนทนาใหม่')
      
      // Send push notification for new conversation
      sendPushNotification({
        title: 'การสนทนาใหม่',
        body: `ลูกค้า ${payload.conversation.customer?.name || 'Guest'} เริ่มสนทนาใหม่`,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: `conversation-${payload.conversation.id}`,
        data: {
          conversationId: payload.conversation.id,
          type: 'new_conversation'
        }
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, queryClient, searchKeyword, filterStatus])

  // Real-time: Conversation updates
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onConversationUpdated((payload) => {
     // console.log('[Real-time] Conversation updated:', payload)
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
    })
  }, [socket, queryClient, searchKeyword, filterStatus])

  // Real-time: Conversation deleted
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onConversationDeleted((payload) => {
     // console.log('[Real-time] Conversation deleted:', payload)
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
      
      if (selectedConversation === payload.conversationId) {
        setSelectedConversation(null)
      }
    })
  }, [socket, queryClient, searchKeyword, filterStatus, selectedConversation])

  // Real-time: New messages
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onMessageNew((payload) => {
     // console.log('[Real-time] New message:', payload)
      
      // Update messages list if viewing this conversation
      if (selectedConversation === payload.conversationId) {
        queryClient.invalidateQueries({ queryKey: qk.chat.messages(payload.conversationId) })
      }
      
      // Always update conversations list to reflect last message
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
      
      // Show notification if message is from customer and not currently viewing
      if (payload.message.senderType === 'customer' && selectedConversation !== payload.conversationId) {
        toast('ข้อความใหม่จากลูกค้า', {
          icon: '💬',
        })
        
        // Send push notification
        sendPushNotification({
          title: 'ข้อความใหม่จากลูกค้า',
          body: payload.message.content.substring(0, 100),
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: `message-${payload.conversationId}`,
          data: {
            conversationId: payload.conversationId,
            messageId: payload.message.id,
            type: 'new_message'
          }
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, queryClient, selectedConversation, searchKeyword, filterStatus])

  // Real-time: Messages read
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onMessageRead((payload) => {
     // console.log('[Real-time] Messages read:', payload)
      
      if (selectedConversation === payload.conversationId) {
        queryClient.invalidateQueries({ queryKey: qk.chat.messages(payload.conversationId) })
      }
      
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
    })
  }, [socket, queryClient, selectedConversation, searchKeyword, filterStatus])

  // Real-time: User online/offline status
  useEffect(() => {
    if (!socket.isConnected) return
    
    const cleanupOnline = socket.onUserOnline((payload) => {
      setOnlineUsers(prev => new Set(Array.from(prev).concat(payload.userId)))
    })
    
    const cleanupOffline = socket.onUserOffline((payload) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(payload.userId)
        return next
      })
    })
    
    return () => {
      cleanupOnline()
      cleanupOffline()
    }
  }, [socket])

  // Real-time: Typing indicators
  useEffect(() => {
    if (!socket.isConnected) return
    
    const cleanupTyping = socket.onUserTyping((payload) => {
      if (payload.userType === 'customer' && payload.conversationId === selectedConversation) {
        setTypingUsers(prev => ({
          ...prev,
          [payload.conversationId]: payload.userName,
        }))
      }
    })
    
    const cleanupStopTyping = socket.onUserStopTyping((payload) => {
      if (payload.conversationId === selectedConversation) {
        setTypingUsers(prev => {
          const next = { ...prev }
          delete next[payload.conversationId]
          return next
        })
      }
    })
    
    return () => {
      cleanupTyping()
      cleanupStopTyping()
    }
  }, [socket, selectedConversation])

  // Real-time: Notifications
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onNotification((payload) => {
      if (payload.type === 'success') {
        toast.success(payload.message)
      } else if (payload.type === 'error') {
        toast.error(payload.message)
      } else {
        toast(payload.message)
      }
    })
  }, [socket])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !selectedConversationData) return
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    socket.emitStopTyping(selectedConversation)
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      customerId: selectedConversationData.customerId,
      content: messageInput.trim(),
      senderType: 'agent',
    })
  }

  const handleTyping = () => {
    if (!selectedConversation) return
    
    // Emit typing event
    socket.emitTyping(selectedConversation)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emitStopTyping(selectedConversation)
    }, 3000)
  }

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation)

  return (
    <TheLayout>
      <PageHeader
        title="Agent Inbox"
        icon='FaInbox'
        description="กล่องข้อความสำหรับเจ้าหน้าที่"
        gradient={true}
      />

      {/* Connection Status Indicator */}
      <div className="flex justify-end items-center mb-2">
        <div className="flex gap-4 items-center">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            socket.isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              socket.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            {socket.isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
          </div>
          
          {/* Notification Permission Button */}
          <button
            onClick={requestNotificationPermission}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              isClient && notificationPermission === 'granted'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
            title="การแจ้งเตือน"
          >
            <ReactIconComponent 
              icon={isClient && notificationPermission === 'granted' ? 'FaBell' : 'FaBellSlash'} 
              setClass="w-3 h-3" 
            />
            {isClient && notificationPermission === 'granted' ? 'เปิดแล้ว' : 'ขออนุญาต'}
          </button>

          {/* Test Notification Button (only show when granted) */}
          {isClient && notificationPermission === 'granted' && (
            <button
              onClick={() => {
               // console.log('[Test] Sending test notification...')
                sendPushNotification({
                  title: '🧪 ทดสอบการแจ้งเตือน',
                  body: 'หากคุณเห็นข้อความนี้ แสดงว่าระบบแจ้งเตือนทำงานได้ปกติ!',
                  icon: '/icon-192x192.png',
                  tag: 'test-notification',
                  data: { type: 'test' }
                })
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              title="ทดสอบการแจ้งเตือน"
            >
              <ReactIconComponent 
                icon="FaVial" 
                setClass="w-3 h-3" 
              />
              ทดสอบ
            </button>
          )}
        </div>
      </div>

      <div className="py-2">
        <div className="h-[calc(100vh-200px)] flex gap-4">
          {/* Conversation List - Left Sidebar */}
          <div className="flex flex-col w-80 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur bg-white/90">
            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="ค้นหาลูกค้า..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm mb-3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-[#A78BFA] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  กำลังสนทนา
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  รอดำเนินการ
                </button>
              </div>
            </div>

            {/* Conversation Items */}
            <div className="overflow-y-auto flex-1">
              {loadingConversations ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <ReactIconComponent icon="FaSpinner" setClass="w-6 h-6 animate-spin" />
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-[#A78BFA]/10 border-l-4 border-l-[#A78BFA]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#34D399] flex items-center justify-center text-white font-semibold">
                          {(conv.customer?.name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{conv.customer?.name || 'Guest'}</h3>
                          <p className="text-xs text-gray-500">{conv.customer?.phone || conv.customer?.email || '-'}</p>
                        </div>
                      </div>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'ไม่มีข้อความ'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' :
                        conv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {conv.status === 'active' ? 'กำลังสนทนา' :
                         conv.status === 'pending' ? 'รอดำเนินการ' : 'ปิดแล้ว'}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  ไม่พบการสนทนา
                </div>
              )}
            </div>
          </div>

          {/* Chat Area - Main Content */}
          <div className="flex flex-col flex-1 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur bg-white/90">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#A78BFA]/10 to-[#34D399]/10">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#34D399] flex items-center justify-center text-white font-semibold">
                        {(selectedConversationData?.customer?.name || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <h2 className="font-semibold text-gray-900">{selectedConversationData?.customer?.name || 'Guest'}</h2>
                          {/* Online Status Indicator */}
                          {selectedConversationData && onlineUsers.has(selectedConversationData.customerId) && (
                            <div className="flex gap-1 items-center text-xs text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span>ออนไลน์</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {selectedConversationData?.customer?.phone || selectedConversationData?.customer?.email || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="xs"
                        className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3"
                      >
                        <ReactIconComponent icon="FaEllipsisV" setClass="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      <ReactIconComponent icon="FaSpinner" setClass="w-6 h-6 animate-spin" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            msg.senderType === 'agent'
                              ? 'bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div className="mt-1">
                            <p
                              className={`text-xs ${
                                msg.senderType === 'agent' ? 'text-white/70' : 'text-gray-500'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {msg.senderType === 'customer' && msg.readBy && msg.readBy.length > 0 && (
                              <p className="mt-1 text-xs text-green-600">
                                ✓ อ่านโดย: {msg.readBy.map(r => r.name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      ยังไม่มีข้อความในการสนทนานี้
                    </div>
                  )}
                  
                  {/* Typing Indicator */}
                  {selectedConversation && typingUsers[selectedConversation] && (
                    <div className="flex justify-start mb-4">
                      <div className="px-4 py-2 bg-gray-100 rounded-2xl">
                        <div className="flex gap-2 items-center">
                          <span className="text-sm text-gray-600">
                            {typingUsers[selectedConversation]} กำลังพิมพ์
                          </span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex gap-2 items-end">
                    <Button
                      size="xs"
                      className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full p-2"
                    >
                      <ReactIconComponent icon="FaPaperclip" setClass="w-5 h-5" />
                    </Button>
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value)
                        handleTyping()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      onBlur={() => {
                        if (selectedConversation) {
                          socket.emitStopTyping(selectedConversation)
                        }
                      }}
                      placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
                      className="flex-1 px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm resize-none"
                      rows={2}
                    />
                    <Button
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      onClick={handleSendMessage}
                      className="!bg-gradient-to-r !from-[#A78BFA] !to-[#34D399] !text-white hover:opacity-90 rounded-full px-4 disabled:opacity-60"
                    >
                      {sendMessageMutation.isPending ? (
                        <ReactIconComponent icon="FaSpinner" setClass="w-5 h-5 animate-spin" />
                      ) : (
                        <ReactIconComponent icon="FaPaperPlane" setClass="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                <div className="text-center">
                  <ReactIconComponent icon="FaComments" setClass="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">เลือกการสนทนาเพื่อเริ่มต้น</p>
                  <p className="mt-2 text-sm">คลิกที่การสนทนาทางซ้ายเพื่อดูและตอบกลับข้อความ</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TheLayout>
  )
}
