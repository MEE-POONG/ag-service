/**
 * Push Unsubscribe API
 * Removes push subscription from database
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface UnsubscribeResponse {
  success?: boolean
  error?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UnsubscribeResponse>
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
    const { endpoint } = req.body

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint is required'
      })
    }

    // Deactivate subscription instead of deleting
    await prisma.pushSubscriptionDB.updateMany({
      where: {
        endpoint,
        userId: admin.id
      },
      data: {
        isActive: false
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Push subscription removed successfully'
    })
  } catch (error) {
    console.error('Remove push subscription error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to remove push subscription'
    })
  }
}

