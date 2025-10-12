/**
 * In-app Notifications API
 * Handles CRUD operations for user notifications
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'

interface NotificationResponse {
  success?: boolean
  data?: any
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  error?: string
  message?: string
}

/**
 * GET - List notifications for current user
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<NotificationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '20',
      unreadOnly = 'false',
      type = ''
    } = req.query

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 20
    const skip = (pageNum - 1) * pageSizeNum

    // Build where clause
    const whereClause: Prisma.NotificationDBWhereInput = {
      userId: admin.id,
      ...(unreadOnly === 'true' && { isRead: false }),
      ...(type && { type: type as string }),
      // Filter out expired notifications
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    }

    const [notifications, totalNotifications] = await Promise.all([
      prisma.notificationDB.findMany({
        where: whereClause,
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notificationDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        totalItems: totalNotifications,
        totalPages: Math.ceil(totalNotifications / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Notifications retrieved successfully'
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications'
    })
  }
}

/**
 * POST - Create notification (admin only)
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<NotificationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      userId,
      type,
      title,
      message,
      icon,
      actionUrl,
      actionLabel,
      metadata,
      expiresAt
    } = req.body

    // Validation
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, type, title, and message are required'
      })
    }

    // Create notification
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
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    return res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    })
  } catch (error) {
    console.error('Create notification error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    })
  }
}

/**
 * PUT - Mark notifications as read
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<NotificationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { notificationIds, markAll = false } = req.body

    if (!markAll && (!notificationIds || !Array.isArray(notificationIds))) {
      return res.status(400).json({
        success: false,
        error: 'notificationIds array is required or set markAll=true'
      })
    }

    if (markAll) {
      // Mark all unread notifications as read
      await prisma.notificationDB.updateMany({
        where: {
          userId: admin.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    } else {
      // Mark specific notifications as read
      await prisma.notificationDB.updateMany({
        where: {
          id: { in: notificationIds },
          userId: admin.id, // Security: only update own notifications
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    })
  } catch (error) {
    console.error('Mark notifications read error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    })
  }
}

/**
 * DELETE - Delete notification(s)
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<NotificationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { notificationId, deleteAll = false } = req.body

    if (!deleteAll && !notificationId) {
      return res.status(400).json({
        success: false,
        error: 'notificationId is required or set deleteAll=true'
      })
    }

    if (deleteAll) {
      // Delete all read notifications
      await prisma.notificationDB.deleteMany({
        where: {
          userId: admin.id,
          isRead: true
        }
      })
    } else {
      // Delete specific notification
      const deleted = await prisma.notificationDB.deleteMany({
        where: {
          id: notificationId,
          userId: admin.id // Security: only delete own notifications
        }
      })

      if (deleted.count === 0) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification(s) deleted successfully'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<NotificationResponse>) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
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
    console.error('Notifications API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

