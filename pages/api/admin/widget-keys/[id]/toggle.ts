/**
 * Toggle Widget Key Active Status
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface ToggleResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * PATCH - Toggle widget key active status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ToggleResponse>
) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { id } = req.query
    const { isActive } = req.body

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Widget key ID is required'
      })
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean'
      })
    }

    // Update widget key status
    const widgetKey = await prisma.chatWidgetKeyDB.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    return res.status(200).json({
      success: true,
      data: widgetKey,
      message: `Widget key ${isActive ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Toggle widget key error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle widget key status'
    })
  }
}
