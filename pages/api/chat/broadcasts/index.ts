/**
 * Chat Broadcast API
 * Handles mass messaging campaigns
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

interface BroadcastResponse {
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
 * GET - List broadcasts
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<BroadcastResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      id = '',
      status = 'all'
    } = req.query

    // Single broadcast by ID
    if (id) {
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' })
      }

      const broadcast = await prisma.chatBroadcastDB.findUnique({
        where: { id: String(id) },
        include: {
          segment: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          recipients: {
            include: {
              broadcast: false
            },
            take: 100,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              recipients: true
            }
          }
        }
      })

      if (!broadcast) {
        return res.status(404).json({ success: false, error: 'Broadcast not found' })
      }

      return res.status(200).json({
        success: true,
        data: broadcast,
        message: 'Broadcast retrieved successfully'
      })
    }

    // List with pagination
    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.ChatBroadcastDBWhereInput = {
      ...(status !== 'all' && { status: status as string }),
      ...(keyword ? {
        OR: [
          { name: { contains: keyword as string, mode: 'insensitive' } },
          { description: { contains: keyword as string, mode: 'insensitive' } },
          { message: { contains: keyword as string, mode: 'insensitive' } }
        ]
      } : {})
    }

    const [broadcasts, totalBroadcasts] = await Promise.all([
      prisma.chatBroadcastDB.findMany({
        where: whereClause,
        include: {
          segment: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              recipients: true
            }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.chatBroadcastDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: broadcasts,
      pagination: {
        totalItems: totalBroadcasts,
        totalPages: Math.ceil(totalBroadcasts / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Broadcasts retrieved successfully'
    })
  } catch (error) {
   // console.error('Get broadcasts error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve broadcasts'
    })
  }
}

/**
 * POST - Create broadcast and schedule/send
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<BroadcastResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      name,
      description,
      targetType, // 'all', 'segment', 'tag', 'custom'
      segmentId,
      customFilter,
      messageType = 'text',
      message,
      attachments,
      scheduledAt,
      sendNow = false
    } = req.body

    // Validation
    if (!name || !message || !targetType) {
      return res.status(400).json({
        success: false,
        error: 'Name, message, and targetType are required'
      })
    }

    // Create broadcast with transaction
    const broadcast = await prisma.$transaction(async (tx) => {
      // Determine target customers based on targetType
      let targetCustomers: any[] = []

      switch (targetType) {
        case 'all':
          targetCustomers = await tx.chatCustomerDB.findMany({
            where: { isActive: true, isBlocked: false },
            select: { id: true }
          })
          break

        case 'segment':
          if (!segmentId) {
            throw new Error('Segment ID is required for segment targeting')
          }
          const segment = await tx.chatSegmentDB.findUnique({
            where: { id: segmentId },
            include: {
              customers: {
                select: { customerId: true }
              }
            }
          })
          if (segment) {
            targetCustomers = segment.customers.map(c => ({ id: c.customerId }))
          }
          break

        case 'custom':
          if (customFilter) {
            targetCustomers = await tx.chatCustomerDB.findMany({
              where: {
                ...customFilter,
                isActive: true,
                isBlocked: false
              },
              select: { id: true }
            })
          }
          break
      }

      // Create broadcast
      const newBroadcast = await tx.chatBroadcastDB.create({
        data: {
          name,
          description,
          targetType,
          segmentId: segmentId || null,
          customFilter: customFilter || null,
          messageType,
          message,
          attachments: attachments || null,
          status: sendNow ? 'sending' : (scheduledAt ? 'scheduled' : 'draft'),
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          totalTarget: targetCustomers.length,
          totalSent: 0,
          totalFailed: 0,
          createdBy: admin.username,
          updatedBy: admin.username
        }
      })

      // Create recipient records
      if (targetCustomers.length > 0) {
        await tx.chatBroadcastRecipientDB.createMany({
          data: targetCustomers.map(customer => ({
            broadcastId: newBroadcast.id,
            customerId: customer.id,
            status: 'pending'
          }))
        })
      }

      // Record work history
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatBroadcastDB',
        newBroadcast.id,
        'CREATE',
        null,
        newBroadcast,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return newBroadcast
    })

    // If sendNow is true, trigger sending process
    // (In production, this would be handled by a queue/worker)
    if (sendNow) {
      // TODO: Implement async broadcast sending
      // This would typically be handled by a background job
     // console.log('Broadcast sending initiated:', broadcast.id)
    }

    return res.status(201).json({
      success: true,
      data: broadcast,
      message: 'Broadcast created successfully'
    })
  } catch (error) {
   // console.error('Create broadcast error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create broadcast'
    })
  }
}

/**
 * PUT - Update broadcast status or content
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<BroadcastResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      id,
      name,
      description,
      message,
      attachments,
      status,
      scheduledAt
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Broadcast ID is required'
      })
    }

    const existingBroadcast = await prisma.chatBroadcastDB.findUnique({
      where: { id }
    })

    if (!existingBroadcast) {
      return res.status(404).json({
        success: false,
        error: 'Broadcast not found'
      })
    }

    // Can only edit drafts or scheduled broadcasts
    if (!['draft', 'scheduled'].includes(existingBroadcast.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot edit broadcast that is already sent or sending'
      })
    }

    const broadcast = await prisma.$transaction(async (tx) => {
      const updatedBroadcast = await tx.chatBroadcastDB.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(message !== undefined && { message }),
          ...(attachments !== undefined && { attachments }),
          ...(status !== undefined && { status }),
          ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
          updatedBy: admin.username,
          updatedAt: new Date()
        }
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatBroadcastDB',
        id,
        'UPDATE',
        existingBroadcast,
        updatedBroadcast,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return updatedBroadcast
    })

    return res.status(200).json({
      success: true,
      data: broadcast,
      message: 'Broadcast updated successfully'
    })
  } catch (error) {
   // console.error('Update broadcast error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update broadcast'
    })
  }
}

/**
 * DELETE - Delete broadcast
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<BroadcastResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Broadcast ID is required'
      })
    }

    const existingBroadcast = await prisma.chatBroadcastDB.findUnique({
      where: { id }
    })

    if (!existingBroadcast) {
      return res.status(404).json({
        success: false,
        error: 'Broadcast not found'
      })
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatBroadcastDB',
        id,
        'DELETE',
        existingBroadcast,
        null,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      await tx.chatBroadcastDB.delete({
        where: { id }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Broadcast deleted successfully'
    })
  } catch (error) {
   // console.error('Delete broadcast error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete broadcast'
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<BroadcastResponse>) {
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
   // console.error('Chat broadcasts API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
