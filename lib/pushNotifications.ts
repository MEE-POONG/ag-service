/**
 * Push Notifications Utility
 * Helper functions for sending Web Push notifications
 */

import webpush from 'web-push'
import { prisma } from './prisma'

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@example.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
}

/**
 * Send push notification to a user
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    // Get active subscriptions for user
    const subscriptions = await prisma.pushSubscriptionDB.findMany({
      where: {
        userId,
        isActive: true
      }
    })

    if (subscriptions.length === 0) {
      console.log(`[Push] No active subscriptions for user ${userId}`)
      return { sent: 0, failed: 0 }
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(sub => sendPushToSubscription(sub, payload))
    )

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return { sent, failed }
  } catch (error) {
    console.error('[Push] Error sending to user:', error)
    throw error
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushToUser(userId, payload))
  )

  const totalSent = results
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r: any) => sum + r.value.sent, 0)
  
  const totalFailed = results
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r: any) => sum + r.value.failed, 0)

  return { sent: totalSent, failed: totalFailed }
}

/**
 * Send push to a specific subscription
 */
async function sendPushToSubscription(subscription: any, payload: PushPayload) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys
    }

    const pushPayload = JSON.stringify(payload)

    await webpush.sendNotification(pushSubscription, pushPayload)

    // Update last used time
    await prisma.pushSubscriptionDB.update({
      where: { id: subscription.id },
      data: {
        lastUsedAt: new Date(),
        failCount: 0
      }
    })

    console.log(`[Push] Sent to subscription ${subscription.id}`)
  } catch (error: any) {
    console.error(`[Push] Failed to send to subscription ${subscription.id}:`, error)

    // Handle specific errors
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is no longer valid
      await prisma.pushSubscriptionDB.update({
        where: { id: subscription.id },
        data: { isActive: false }
      })
    } else {
      // Increment fail count
      await prisma.pushSubscriptionDB.update({
        where: { id: subscription.id },
        data: {
          failCount: { increment: 1 }
        }
      })

      // Deactivate after too many failures
      const updated = await prisma.pushSubscriptionDB.findUnique({
        where: { id: subscription.id }
      })

      if (updated && updated.failCount >= 5) {
        await prisma.pushSubscriptionDB.update({
          where: { id: subscription.id },
          data: { isActive: false }
        })
      }
    }

    throw error
  }
}

// ==================== Preset Push Notifications ====================

/**
 * Send new message push notification
 */
export async function pushNewMessage(params: {
  userId: string
  senderName: string
  messagePreview: string
  conversationId: string
}) {
  return sendPushToUser(params.userId, {
    title: `ข้อความใหม่จาก ${params.senderName}`,
    body: params.messagePreview,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: `message-${params.conversationId}`,
    data: {
      url: `/chat/agent/inbox?conversation=${params.conversationId}`,
      conversationId: params.conversationId
    },
    actions: [
      {
        action: 'open',
        title: 'เปิด'
      },
      {
        action: 'close',
        title: 'ปิด'
      }
    ]
  })
}

/**
 * Send new conversation push notification
 */
export async function pushNewConversation(params: {
  userId: string
  customerName: string
  conversationId: string
}) {
  return sendPushToUser(params.userId, {
    title: 'การสนทนาใหม่',
    body: `${params.customerName} เริ่มการสนทนาใหม่`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: `conversation-${params.conversationId}`,
    data: {
      url: `/chat/agent/inbox?conversation=${params.conversationId}`,
      conversationId: params.conversationId
    },
    actions: [
      {
        action: 'open',
        title: 'ดูการสนทนา'
      }
    ],
    requireInteraction: true
  })
}

/**
 * Send assignment push notification
 */
export async function pushConversationAssigned(params: {
  userId: string
  assignedBy: string
  customerName: string
  conversationId: string
}) {
  return sendPushToUser(params.userId, {
    title: 'มอบหมายการสนทนา',
    body: `${params.assignedBy} มอบหมายการสนทนากับ ${params.customerName} ให้คุณ`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: `assignment-${params.conversationId}`,
    data: {
      url: `/chat/agent/inbox?conversation=${params.conversationId}`,
      conversationId: params.conversationId
    },
    actions: [
      {
        action: 'open',
        title: 'เปิดการสนทนา'
      }
    ],
    requireInteraction: true
  })
}

