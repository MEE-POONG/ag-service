/**
 * Notification Count API
 * Returns unread notification count for current user
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface CountResponse {
  success?: boolean
  data?: {
    unreadCount: number
  }
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CountResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const unreadCount = await prisma.notificationDB.count({
      where: {
        userId: admin.id,
        isRead: false,
        // Filter out expired notifications
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      }
    })

    return res.status(200).json({
      success: true,
      data: { unreadCount }
    })
  } catch (error) {
    console.error('Get notification count error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get notification count'
    })
  }
}

