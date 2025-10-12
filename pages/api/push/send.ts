/**
 * Send Push Notification API
 * Manually send push notifications (admin only)
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/permissions'
import { sendPushToUser, sendPushToUsers } from '@/lib/pushNotifications'

interface SendPushResponse {
  success?: boolean
  data?: {
    sent: number
    failed: number
  }
  error?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendPushResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { userId, userIds, title, body, icon, data, actions } = req.body

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body are required'
      })
    }

    if (!userId && !userIds) {
      return res.status(400).json({
        success: false,
        error: 'Either userId or userIds is required'
      })
    }

    const payload = {
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-72x72.png',
      data,
      actions
    }

    let result

    if (userId) {
      // Send to single user
      result = await sendPushToUser(userId, payload)
    } else {
      // Send to multiple users
      result = await sendPushToUsers(userIds, payload)
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: `Push notification sent: ${result.sent} successful, ${result.failed} failed`
    })
  } catch (error) {
    console.error('Send push notification error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to send push notification'
    })
  }
}

