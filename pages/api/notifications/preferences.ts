/**
 * Notification Preferences API
 * Manages user notification settings
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface PreferencesResponse {
  success?: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * GET - Get user's notification preferences
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<PreferencesResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    // Get or create preferences
    let preferences = await prisma.notificationPreferencesDB.findUnique({
      where: { userId: admin.id }
    })

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.notificationPreferencesDB.create({
        data: {
          userId: admin.id
        }
      })
    }

    return res.status(200).json({
      success: true,
      data: preferences,
      message: 'Preferences retrieved successfully'
    })
  } catch (error) {
    console.error('Get preferences error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve preferences'
    })
  }
}

/**
 * PUT - Update notification preferences
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<PreferencesResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      // In-app settings
      enableInApp,
      inAppMessages,
      inAppConversations,
      inAppAssignments,
      inAppSystem,
      // Push settings
      enablePush,
      pushMessages,
      pushConversations,
      pushAssignments,
      pushSystem,
      // Behavior
      soundEnabled,
      desktopOnly,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      // Frequency
      groupSimilar,
      maxPerHour
    } = req.body

    // Validate quiet hours format if provided
    if (quietHoursStart && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(quietHoursStart)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quietHoursStart format. Use HH:mm'
      })
    }

    if (quietHoursEnd && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(quietHoursEnd)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quietHoursEnd format. Use HH:mm'
      })
    }

    // Upsert preferences
    const preferences = await prisma.notificationPreferencesDB.upsert({
      where: { userId: admin.id },
      update: {
        ...(enableInApp !== undefined && { enableInApp }),
        ...(inAppMessages !== undefined && { inAppMessages }),
        ...(inAppConversations !== undefined && { inAppConversations }),
        ...(inAppAssignments !== undefined && { inAppAssignments }),
        ...(inAppSystem !== undefined && { inAppSystem }),
        ...(enablePush !== undefined && { enablePush }),
        ...(pushMessages !== undefined && { pushMessages }),
        ...(pushConversations !== undefined && { pushConversations }),
        ...(pushAssignments !== undefined && { pushAssignments }),
        ...(pushSystem !== undefined && { pushSystem }),
        ...(soundEnabled !== undefined && { soundEnabled }),
        ...(desktopOnly !== undefined && { desktopOnly }),
        ...(quietHoursEnabled !== undefined && { quietHoursEnabled }),
        ...(quietHoursStart !== undefined && { quietHoursStart }),
        ...(quietHoursEnd !== undefined && { quietHoursEnd }),
        ...(groupSimilar !== undefined && { groupSimilar }),
        ...(maxPerHour !== undefined && { maxPerHour }),
        updatedAt: new Date()
      },
      create: {
        userId: admin.id,
        enableInApp: enableInApp ?? true,
        inAppMessages: inAppMessages ?? true,
        inAppConversations: inAppConversations ?? true,
        inAppAssignments: inAppAssignments ?? true,
        inAppSystem: inAppSystem ?? true,
        enablePush: enablePush ?? false,
        pushMessages: pushMessages ?? true,
        pushConversations: pushConversations ?? true,
        pushAssignments: pushAssignments ?? true,
        pushSystem: pushSystem ?? false,
        soundEnabled: soundEnabled ?? true,
        desktopOnly: desktopOnly ?? false,
        quietHoursEnabled: quietHoursEnabled ?? false,
        quietHoursStart,
        quietHoursEnd,
        groupSimilar: groupSimilar ?? true,
        maxPerHour: maxPerHour ?? 20
      }
    })

    return res.status(200).json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully'
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    })
  }
}

/**
 * DELETE - Reset to default preferences
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<PreferencesResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    // Delete existing preferences (will use defaults on next get)
    await prisma.notificationPreferencesDB.deleteMany({
      where: { userId: admin.id }
    })

    return res.status(200).json({
      success: true,
      message: 'Preferences reset to defaults'
    })
  } catch (error) {
    console.error('Reset preferences error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to reset preferences'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<PreferencesResponse>) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Notification preferences API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

