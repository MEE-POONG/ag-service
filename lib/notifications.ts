/**
 * Notification Utility
 * Helper functions for creating in-app notifications
 */

import { prisma } from './prisma'
import { sendNotification } from './socket'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'conversation' | 'assignment'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: any
  expiresIn?: number // milliseconds
  sendSocketEvent?: boolean // Also send real-time notification via Socket.io
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const {
    userId,
    type,
    title,
    message,
    icon,
    actionUrl,
    actionLabel,
    metadata,
    expiresIn,
    sendSocketEvent = true
  } = params

  try {
    // Calculate expiration date if provided
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

    // Create notification in database
    const notification = await prisma.notificationDB.create({
      data: {
        userId,
        type,
        title,
        message,
        icon,
        actionUrl,
        actionLabel,
        metadata: metadata || null,
        expiresAt
      }
    })

    // Send real-time Socket.io notification if enabled
    if (sendSocketEvent) {
      sendNotification(userId, type as any, title, message, {
        notificationId: notification.id,
        actionUrl,
        actionLabel,
        ...metadata
      })
    }

    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    throw error
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationParams, 'userId'>
) {
  const promises = userIds.map(userId =>
    createNotification({ userId, ...notification })
  )
  
  return await Promise.allSettled(promises)
}

/**
 * Delete old notifications (cleanup utility)
 */
export async function deleteExpiredNotifications() {
  try {
    const result = await prisma.notificationDB.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    console.log(`Deleted ${result.count} expired notifications`)
    return result.count
  } catch (error) {
    console.error('Delete expired notifications error:', error)
    throw error
  }
}

/**
 * Delete old read notifications (cleanup utility)
 */
export async function deleteOldReadNotifications(daysOld: number = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notificationDB.deleteMany({
      where: {
        isRead: true,
        readAt: {
          lt: cutoffDate
        }
      }
    })

    console.log(`Deleted ${result.count} old read notifications`)
    return result.count
  } catch (error) {
    console.error('Delete old read notifications error:', error)
    throw error
  }
}

// ==================== Preset Notification Types ====================

/**
 * Create a new message notification
 */
export async function notifyNewMessage(params: {
  userId: string
  senderName: string
  messagePreview: string
  conversationId: string
}) {
  return createNotification({
    userId: params.userId,
    type: 'message',
    title: `ข้อความใหม่จาก ${params.senderName}`,
    message: params.messagePreview,
    icon: '💬',
    actionUrl: `/chat/agent/inbox?conversation=${params.conversationId}`,
    actionLabel: 'ดูข้อความ',
    metadata: {
      conversationId: params.conversationId
    },
    expiresIn: 24 * 60 * 60 * 1000 // 24 hours
  })
}

/**
 * Create a new conversation notification
 */
export async function notifyNewConversation(params: {
  userId: string
  customerName: string
  conversationId: string
}) {
  return createNotification({
    userId: params.userId,
    type: 'conversation',
    title: 'การสนทนาใหม่',
    message: `${params.customerName} เริ่มการสนทนาใหม่`,
    icon: '💬',
    actionUrl: `/chat/agent/inbox?conversation=${params.conversationId}`,
    actionLabel: 'ดูการสนทนา',
    metadata: {
      conversationId: params.conversationId
    },
    expiresIn: 24 * 60 * 60 * 1000 // 24 hours
  })
}

/**
 * Create a conversation assigned notification
 */
export async function notifyConversationAssigned(params: {
  userId: string
  assignedBy: string
  customerName: string
  conversationId: string
}) {
  return createNotification({
    userId: params.userId,
    type: 'assignment',
    title: 'มอบหมายการสนทนา',
    message: `${params.assignedBy} มอบหมายการสนทนากับ ${params.customerName} ให้คุณ`,
    icon: '👤',
    actionUrl: `/chat/agent/inbox?conversation=${params.conversationId}`,
    actionLabel: 'เปิดการสนทนา',
    metadata: {
      conversationId: params.conversationId,
      assignedBy: params.assignedBy
    },
    expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

/**
 * Create a system notification
 */
export async function notifySystem(params: {
  userIds: string[]
  title: string
  message: string
  type?: 'info' | 'warning' | 'error'
  actionUrl?: string
}) {
  return createBulkNotifications(params.userIds, {
    type: params.type || 'info',
    title: params.title,
    message: params.message,
    icon: params.type === 'error' ? '❌' : params.type === 'warning' ? '⚠️' : 'ℹ️',
    actionUrl: params.actionUrl,
    expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

