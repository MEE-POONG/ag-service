/**
 * useSocket Hook - Real-time WebSocket Connection
 * Manages Socket.io connection and provides event handlers
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  SocketEvent,
  getRoomName,
  UserOnlinePayload,
  UserOfflinePayload,
  UserTypingPayload,
  ConversationPayload,
  ConversationAssignedPayload,
  MessagePayload,
  MessageReadPayload,
  CustomerUpdatedPayload,
  NotificationPayload,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@/types/socket'
import toast from 'react-hot-toast'

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

interface UseSocketOptions {
  userId?: string
  userType?: 'agent' | 'customer'
  username?: string
  autoConnect?: boolean
}

interface UseSocketReturn {
  socket: SocketType | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  
  // Room management
  joinConversationRoom: (conversationId: string) => void
  leaveConversationRoom: (conversationId: string) => void
  
  // Typing indicators
  emitTyping: (conversationId: string) => void
  emitStopTyping: (conversationId: string) => void
  
  // Event listeners
  onUserOnline: (callback: (payload: UserOnlinePayload) => void) => () => void
  onUserOffline: (callback: (payload: UserOfflinePayload) => void) => () => void
  onUserTyping: (callback: (payload: UserTypingPayload) => void) => () => void
  onUserStopTyping: (callback: (payload: UserTypingPayload) => void) => () => void
  onConversationNew: (callback: (payload: ConversationPayload) => void) => () => void
  onConversationUpdated: (callback: (payload: ConversationPayload) => void) => () => void
  onConversationDeleted: (callback: (payload: { conversationId: string; timestamp: Date }) => void) => () => void
  onConversationAssigned: (callback: (payload: ConversationAssignedPayload) => void) => () => void
  onMessageNew: (callback: (payload: MessagePayload) => void) => () => void
  onMessageUpdated: (callback: (payload: MessagePayload) => void) => () => void
  onMessageDeleted: (callback: (payload: { conversationId: string; messageId: string; timestamp: Date }) => void) => () => void
  onMessageRead: (callback: (payload: MessageReadPayload) => void) => () => void
  onCustomerUpdated: (callback: (payload: CustomerUpdatedPayload) => void) => () => void
  onNotification: (callback: (payload: NotificationPayload) => void) => () => void
}

/**
 * Custom hook for Socket.io real-time connection
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { userId, userType, username, autoConnect = true } = options
  
  const socketRef = useRef<SocketType | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    // Create socket connection with API route
    const socket: SocketType = io({
      path: '/api/socket',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 30000
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect' as any, () => {
      // console.log('[Socket] Connected:', socket.id)
      setIsConnected(true)

      // Authenticate user
      if (userId && userType && username) {
        socket.emit('authenticate' as any, { userId, userType, username })
      }
    })

    socket.on('disconnect' as any, () => {
      console.log('[Socket] Disconnected')
      setIsConnected(false)
    })

    socket.on('error' as any, (error: any) => {
      console.error('[Socket] Error:', error)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    })

    // Reconnect handler
    socket.io.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconnected after ${attempt} attempts`)
      toast.success('เชื่อมต่อสำเร็จ')
    })

    socket.io.on('reconnect_error', () => {
      console.error('[Socket] Reconnection failed')
    })

    socket.io.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed permanently')
      toast.error('ไม่สามารถเชื่อมต่อได้')
    })
  }, [userId, userType, username])

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && userId && userType && username) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, userId, userType, username, connect, disconnect])

  // ==================== Room Management ====================

  const joinConversationRoom = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) return
    const roomName = getRoomName.conversation(conversationId)
    socketRef.current.emit(SocketEvent.AGENT_JOIN_ROOM, roomName)
  }, [])

  const leaveConversationRoom = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) return
    const roomName = getRoomName.conversation(conversationId)
    socketRef.current.emit(SocketEvent.AGENT_LEAVE_ROOM, roomName)
  }, [])

  // ==================== Typing Indicators ====================

  const emitTyping = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected || !userId || !username || !userType) return
    
    socketRef.current.emit(SocketEvent.USER_TYPING, {
      conversationId,
      userId,
      userName: username,
      userType,
      timestamp: new Date(),
    })
  }, [userId, username, userType])

  const emitStopTyping = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected || !userId || !username || !userType) return
    
    socketRef.current.emit(SocketEvent.USER_STOP_TYPING, {
      conversationId,
      userId,
      userName: username,
      userType,
    })
  }, [userId, username, userType])

  // ==================== Event Listeners ====================

  const createEventListener = useCallback(
    <T,>(event: SocketEvent, callback: (payload: T) => void) => {
      if (!socketRef.current) return () => {}

      socketRef.current.on(event as any, callback as any)

      // Return cleanup function
      return () => {
        socketRef.current?.off(event as any, callback as any)
      }
    },
    []
  )

  const onUserOnline = useCallback(
    (callback: (payload: UserOnlinePayload) => void) =>
      createEventListener<UserOnlinePayload>(SocketEvent.USER_ONLINE, callback),
    [createEventListener]
  )

  const onUserOffline = useCallback(
    (callback: (payload: UserOfflinePayload) => void) =>
      createEventListener<UserOfflinePayload>(SocketEvent.USER_OFFLINE, callback),
    [createEventListener]
  )

  const onUserTyping = useCallback(
    (callback: (payload: UserTypingPayload) => void) =>
      createEventListener<UserTypingPayload>(SocketEvent.USER_TYPING, callback),
    [createEventListener]
  )

  const onUserStopTyping = useCallback(
    (callback: (payload: UserTypingPayload) => void) =>
      createEventListener<UserTypingPayload>(SocketEvent.USER_STOP_TYPING, callback),
    [createEventListener]
  )

  const onConversationNew = useCallback(
    (callback: (payload: ConversationPayload) => void) =>
      createEventListener<ConversationPayload>(SocketEvent.CONVERSATION_NEW, callback),
    [createEventListener]
  )

  const onConversationUpdated = useCallback(
    (callback: (payload: ConversationPayload) => void) =>
      createEventListener<ConversationPayload>(SocketEvent.CONVERSATION_UPDATED, callback),
    [createEventListener]
  )

  const onConversationDeleted = useCallback(
    (callback: (payload: { conversationId: string; timestamp: Date }) => void) =>
      createEventListener<{ conversationId: string; timestamp: Date }>(
        SocketEvent.CONVERSATION_DELETED,
        callback
      ),
    [createEventListener]
  )

  const onConversationAssigned = useCallback(
    (callback: (payload: ConversationAssignedPayload) => void) =>
      createEventListener<ConversationAssignedPayload>(SocketEvent.CONVERSATION_ASSIGNED, callback),
    [createEventListener]
  )

  const onMessageNew = useCallback(
    (callback: (payload: MessagePayload) => void) =>
      createEventListener<MessagePayload>(SocketEvent.MESSAGE_NEW, callback),
    [createEventListener]
  )

  const onMessageUpdated = useCallback(
    (callback: (payload: MessagePayload) => void) =>
      createEventListener<MessagePayload>(SocketEvent.MESSAGE_UPDATED, callback),
    [createEventListener]
  )

  const onMessageDeleted = useCallback(
    (callback: (payload: { conversationId: string; messageId: string; timestamp: Date }) => void) =>
      createEventListener<{ conversationId: string; messageId: string; timestamp: Date }>(
        SocketEvent.MESSAGE_DELETED,
        callback
      ),
    [createEventListener]
  )

  const onMessageRead = useCallback(
    (callback: (payload: MessageReadPayload) => void) =>
      createEventListener<MessageReadPayload>(SocketEvent.MESSAGE_READ, callback),
    [createEventListener]
  )

  const onCustomerUpdated = useCallback(
    (callback: (payload: CustomerUpdatedPayload) => void) =>
      createEventListener<CustomerUpdatedPayload>(SocketEvent.CUSTOMER_UPDATED, callback),
    [createEventListener]
  )

  const onNotification = useCallback(
    (callback: (payload: NotificationPayload) => void) =>
      createEventListener<NotificationPayload>(SocketEvent.NOTIFICATION, callback),
    [createEventListener]
  )

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinConversationRoom,
    leaveConversationRoom,
    emitTyping,
    emitStopTyping,
    onUserOnline,
    onUserOffline,
    onUserTyping,
    onUserStopTyping,
    onConversationNew,
    onConversationUpdated,
    onConversationDeleted,
    onConversationAssigned,
    onMessageNew,
    onMessageUpdated,
    onMessageDeleted,
    onMessageRead,
    onCustomerUpdated,
    onNotification,
  }
}

