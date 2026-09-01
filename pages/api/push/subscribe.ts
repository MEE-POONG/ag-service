/**
 * Push Subscribe API
 * Saves push subscription to database
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import { serializeBigIntToString } from '@/lib/bigintUtils'

interface SubscribeResponse {
  success?: boolean
  data?: any
  error?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscribeResponse>
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
    const { subscription, userAgent } = req.body

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Subscription data is required'
      })
    }

    // admin.id exists for normal admins; superadmin returns JWT payload where id is in sub
    const adminId = admin.id || admin.sub
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'ไม่สามารถระบุตัวตนผู้ใช้' })
    }

    // Extract keys from subscription
    const keys = subscription.keys || {}

    // Upsert subscription (update if exists, create if not)
    const pushSubscription = await prisma.pushSubscriptionDB.upsert({
      where: {
        endpoint: subscription.endpoint
      },
      update: {
        keys: keys,
        userAgent: userAgent || null,
        isActive: true,
        failCount: 0,
        lastUsedAt: new Date()
      },
      create: {
        endpoint: subscription.endpoint,
        keys: keys,
        userAgent: userAgent || null,
        isActive: true,
        user: { connect: { id: adminId } }
      }
    })

    return res.status(200).json(serializeBigIntToString({
      success: true,
      data: pushSubscription,
      message: 'Push subscription saved successfully'
    }))
  } catch (error) {
    console.error('Save push subscription error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to save push subscription'
    })
  }
}

