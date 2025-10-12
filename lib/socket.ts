/**
 * Socket.io Utility for Backend API Routes
 * Provides helper functions to emit real-time events
 */

import { Server as SocketIOServer } from 'socket.io'
import {
  SocketEvent,
  getRoomName,
  ConversationPayload,
  ConversationAssignedPayload,
  MessagePayload,
  MessageReadPayload,
  CustomerUpdatedPayload,
  NotificationPayload,
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '@/types/socket'

// Global Socket.io instance (injected by custom server)
declare global {
  var io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData> | undefined
}

/**
 * Get Socket.io instance
 * Returns undefined if Socket.io is not initialized (e.g., during build)
 */
export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData> | undefined {
  return global.io
}

/**
 * Check if Socket.io is available
 */
export function isSocketAvailable(): boolean {
  return !!global.io
}

// ==================== Conversation Events ====================

/**
 * Emit new conversation event
 */
export function emitNewConversation(conversation: any) {
  const io = getIO()
  if (!io) return

  const payload: ConversationPayload = {
    conversationId: conversation.id,
    conversation,
    timestamp: new Date(),
  }

  // Emit to all agents
  io.to(getRoomName.allAgents()).emit(SocketEvent.CONVERSATION_NEW, payload)

  // Emit to assigned agent if exists
  if (conversation.assignedAdminId) {
    io.to(getRoomName.agent(conversation.assignedAdminId)).emit(SocketEvent.CONVERSATION_NEW, payload)
  }

  // Emit to customer
  if (conversation.customerId) {
    io.to(getRoomName.customer(conversation.customerId)).emit(SocketEvent.CONVERSATION_NEW, payload)
  }
}

/**
 * Emit conversation updated event
 */
export function emitConversationUpdated(conversation: any) {
  const io = getIO()
  if (!io) return

  const payload: ConversationPayload = {
    conversationId: conversation.id,
    conversation,
    timestamp: new Date(),
  }

  // Emit to all agents
  io.to(getRoomName.allAgents()).emit(SocketEvent.CONVERSATION_UPDATED, payload)

  // Emit to specific conversation room
  io.to(getRoomName.conversation(conversation.id)).emit(SocketEvent.CONVERSATION_UPDATED, payload)

  // Emit to customer
  if (conversation.customerId) {
    io.to(getRoomName.customer(conversation.customerId)).emit(SocketEvent.CONVERSATION_UPDATED, payload)
  }
}

/**
 * Emit conversation deleted event
 */
export function emitConversationDeleted(conversationId: string, customerId?: string) {
  const io = getIO()
  if (!io) return

  const payload = {
    conversationId,
    timestamp: new Date(),
  }

  // Emit to all agents
  io.to(getRoomName.allAgents()).emit(SocketEvent.CONVERSATION_DELETED, payload)

  // Emit to specific conversation room
  io.to(getRoomName.conversation(conversationId)).emit(SocketEvent.CONVERSATION_DELETED, payload)

  // Emit to customer if provided
  if (customerId) {
    io.to(getRoomName.customer(customerId)).emit(SocketEvent.CONVERSATION_DELETED, payload)
  }
}

/**
 * Emit conversation assigned event
 */
export function emitConversationAssigned(
  conversationId: string,
  assignedToId: string | null,
  assignedToName: string | undefined,
  assignedBy: string
) {
  const io = getIO()
  if (!io) return

  const payload: ConversationAssignedPayload = {
    conversationId,
    assignedToId,
    assignedToName,
    assignedBy,
    timestamp: new Date(),
  }

  // Emit to all agents
  io.to(getRoomName.allAgents()).emit(SocketEvent.CONVERSATION_ASSIGNED, payload)

  // Emit to assigned agent
  if (assignedToId) {
    io.to(getRoomName.agent(assignedToId)).emit(SocketEvent.CONVERSATION_ASSIGNED, payload)
  }
}

// ==================== Message Events ====================

/**
 * Emit new message event
 */
export function emitNewMessage(conversationId: string, message: any) {
  const io = getIO()
  if (!io) return

  const payload: MessagePayload = {
    conversationId,
    message,
    timestamp: new Date(),
  }

  // Emit to all agents
  io.to(getRoomName.allAgents()).emit(SocketEvent.MESSAGE_NEW, payload)

  // Emit to specific conversation room
  io.to(getRoomName.conversation(conversationId)).emit(SocketEvent.MESSAGE_NEW, payload)

  // Emit to customer
  if (message.customerId) {
    io.to(getRoomName.customer(message.customerId)).emit(SocketEvent.MESSAGE_NEW, payload)
  }
}

/**
 * Emit message updated event
 */
export function emitMessageUpdated(conversationId: string, message: any) {
  const io = getIO()
  if (!io) return

  const payload: MessagePayload = {
    conversationId,
    message,
    timestamp: new Date(),
  }

  io.to(getRoomName.conversation(conversationId)).emit(SocketEvent.MESSAGE_UPDATED, payload)
  io.to(getRoomName.allAgents()).emit(SocketEvent.MESSAGE_UPDATED, payload)
}

/**
 * Emit message deleted event
 */
export function emitMessageDeleted(conversationId: string, messageId: string) {
  const io = getIO()
  if (!io) return

  const payload = {
    conversationId,
    messageId,
    timestamp: new Date(),
  }

  io.to(getRoomName.conversation(conversationId)).emit(SocketEvent.MESSAGE_DELETED, payload)
  io.to(getRoomName.allAgents()).emit(SocketEvent.MESSAGE_DELETED, payload)
}

/**
 * Emit messages read event
 */
export function emitMessagesRead(
  conversationId: string,
  messageIds: string[] | undefined,
  readBy: string,
  readByType: 'agent' | 'customer'
) {
  const io = getIO()
  if (!io) return

  const payload: MessageReadPayload = {
    conversationId,
    messageIds,
    readBy,
    readByType,
    timestamp: new Date(),
  }

  io.to(getRoomName.conversation(conversationId)).emit(SocketEvent.MESSAGE_READ, payload)
  io.to(getRoomName.allAgents()).emit(SocketEvent.MESSAGE_READ, payload)
}

// ==================== Customer Events ====================

/**
 * Emit customer updated event
 */
export function emitCustomerUpdated(customer: any) {
  const io = getIO()
  if (!io) return

  const payload: CustomerUpdatedPayload = {
    customerId: customer.id,
    customer,
    timestamp: new Date(),
  }

  io.to(getRoomName.allAgents()).emit(SocketEvent.CUSTOMER_UPDATED, payload)
  io.to(getRoomName.customer(customer.id)).emit(SocketEvent.CUSTOMER_UPDATED, payload)
}

// ==================== Notification Events ====================

/**
 * Send notification to specific user
 */
export function sendNotification(
  userId: string,
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  data?: any
) {
  const io = getIO()
  if (!io) return

  const payload: NotificationPayload = {
    type,
    title,
    message,
    data,
    timestamp: new Date(),
  }

  io.to(getRoomName.agent(userId)).emit(SocketEvent.NOTIFICATION, payload)
}

/**
 * Broadcast notification to all agents
 */
export function broadcastNotification(
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  data?: any
) {
  const io = getIO()
  if (!io) return

  const payload: NotificationPayload = {
    type,
    title,
    message,
    data,
    timestamp: new Date(),
  }

  io.to(getRoomName.allAgents()).emit(SocketEvent.NOTIFICATION, payload)
}

