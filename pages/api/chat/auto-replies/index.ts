/**
 * Auto Reply Rules API
 * Handles automated response configuration
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

interface AutoReplyResponse {
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
 * GET - List auto-reply rules
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<AutoReplyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      id = '',
      triggerType = '',
      isActive = ''
    } = req.query

    // Single auto-reply by ID
    if (id) {
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' })
      }

      const autoReply = await prisma.chatAutoReplyDB.findUnique({
        where: { id: String(id) }
      })

      if (!autoReply) {
        return res.status(404).json({ success: false, error: 'Auto-reply not found' })
      }

      return res.status(200).json({
        success: true,
        data: autoReply,
        message: 'Auto-reply retrieved successfully'
      })
    }

    // List with pagination
    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.ChatAutoReplyDBWhereInput = {
      ...(triggerType && { triggerType: triggerType as string }),
      ...(isActive !== '' && { isActive: isActive === 'true' }),
      ...(keyword ? {
        OR: [
          { name: { contains: keyword as string, mode: 'insensitive' } },
          { description: { contains: keyword as string, mode: 'insensitive' } },
          { message: { contains: keyword as string, mode: 'insensitive' } }
        ]
      } : {})
    }

    const [autoReplies, totalAutoReplies] = await Promise.all([
      prisma.chatAutoReplyDB.findMany({
        where: whereClause,
        skip,
        take: pageSizeNum,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.chatAutoReplyDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: autoReplies,
      pagination: {
        totalItems: totalAutoReplies,
        totalPages: Math.ceil(totalAutoReplies / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Auto-replies retrieved successfully'
    })
  } catch (error) {
    console.error('Get auto-replies error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve auto-replies'
    })
  }
}

/**
 * POST - Create auto-reply rule
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<AutoReplyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      name,
      description,
      triggerType, // 'keyword', 'welcome', 'away', 'default'
      keywords = [],
      messageType = 'text',
      message,
      attachments,
      isActive = true,
      startTime,
      endTime,
      daysOfWeek = [],
      priority = 0
    } = req.body

    // Validation
    if (!name || !triggerType || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, triggerType, and message are required'
      })
    }

    if (triggerType === 'keyword' && (!keywords || keywords.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Keywords are required for keyword trigger type'
      })
    }

    const autoReply = await prisma.$transaction(async (tx) => {
      const newAutoReply = await tx.chatAutoReplyDB.create({
        data: {
          name,
          description,
          triggerType,
          keywords,
          messageType,
          message,
          attachments: attachments || null,
          isActive,
          startTime,
          endTime,
          daysOfWeek,
          priority,
          createdBy: admin.username,
          updatedBy: admin.username
        }
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatAutoReplyDB',
        newAutoReply.id,
        'CREATE',
        null,
        newAutoReply,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return newAutoReply
    })

    return res.status(201).json({
      success: true,
      data: autoReply,
      message: 'Auto-reply created successfully'
    })
  } catch (error) {
    console.error('Create auto-reply error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create auto-reply'
    })
  }
}

/**
 * PUT - Update auto-reply rule
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<AutoReplyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      id,
      name,
      description,
      triggerType,
      keywords,
      messageType,
      message,
      attachments,
      isActive,
      startTime,
      endTime,
      daysOfWeek,
      priority
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Auto-reply ID is required'
      })
    }

    const existingAutoReply = await prisma.chatAutoReplyDB.findUnique({
      where: { id }
    })

    if (!existingAutoReply) {
      return res.status(404).json({
        success: false,
        error: 'Auto-reply not found'
      })
    }

    const autoReply = await prisma.$transaction(async (tx) => {
      const updatedAutoReply = await tx.chatAutoReplyDB.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(triggerType !== undefined && { triggerType }),
          ...(keywords !== undefined && { keywords }),
          ...(messageType !== undefined && { messageType }),
          ...(message !== undefined && { message }),
          ...(attachments !== undefined && { attachments }),
          ...(isActive !== undefined && { isActive }),
          ...(startTime !== undefined && { startTime }),
          ...(endTime !== undefined && { endTime }),
          ...(daysOfWeek !== undefined && { daysOfWeek }),
          ...(priority !== undefined && { priority }),
          updatedBy: admin.username,
          updatedAt: new Date()
        }
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatAutoReplyDB',
        id,
        'UPDATE',
        existingAutoReply,
        updatedAutoReply,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return updatedAutoReply
    })

    return res.status(200).json({
      success: true,
      data: autoReply,
      message: 'Auto-reply updated successfully'
    })
  } catch (error) {
    console.error('Update auto-reply error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update auto-reply'
    })
  }
}

/**
 * DELETE - Delete auto-reply rule
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<AutoReplyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Auto-reply ID is required'
      })
    }

    const existingAutoReply = await prisma.chatAutoReplyDB.findUnique({
      where: { id }
    })

    if (!existingAutoReply) {
      return res.status(404).json({
        success: false,
        error: 'Auto-reply not found'
      })
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatAutoReplyDB',
        id,
        'DELETE',
        existingAutoReply,
        null,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      await tx.chatAutoReplyDB.delete({
        where: { id }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Auto-reply deleted successfully'
    })
  } catch (error) {
    console.error('Delete auto-reply error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete auto-reply'
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AutoReplyResponse>) {
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
    console.error('Chat auto-replies API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
