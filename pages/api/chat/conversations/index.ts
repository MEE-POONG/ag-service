/**
 * Chat Conversations API
 * Handles conversation management for agent inbox
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'
import { 
  emitNewConversation, 
  emitConversationUpdated, 
  emitConversationDeleted,
  emitConversationAssigned 
} from '@/lib/socket'
import { notifyNewConversation, notifyConversationAssigned } from '@/lib/notifications'
import { pushNewConversation, pushConversationAssigned } from '@/lib/pushNotifications'

interface ConversationResponse {
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
 * GET - List conversations with filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<ConversationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      id = '',
      status = 'all',
      priority = 'all',
      assignedTo = '',
      unreadOnly = 'false'
    } = req.query

    // Single conversation by ID
    if (id) {
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' })
      }

      const conversation = await prisma.chatConversationDB.findUnique({
        where: { id: String(id) },
        include: {
          customer: {
            include: {
              tags: {
                include: {
                  tag: true
                }
              }
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true
            }
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      })

      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' })
      }

      // Mark as read when agent views
      if (conversation.isUnread && assignedTo === admin.id) {
        await prisma.chatConversationDB.update({
          where: { id: String(id) },
          data: {
            isUnread: false,
            unreadCount: 0
          }
        })
      }

      return res.status(200).json({
        success: true,
        data: conversation,
        message: 'Conversation retrieved successfully'
      })
    }

    // List with pagination
    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    // Build where clause
    const whereClause: Prisma.ChatConversationDBWhereInput = {
      ...(status !== 'all' && { status: status as string }),
      ...(priority !== 'all' && { priority: priority as string }),
      ...(assignedTo && { assignedAdminId: assignedTo as string }),
      ...(unreadOnly === 'true' && { isUnread: true }),
      ...(keyword ? {
        OR: [
          { subject: { contains: keyword as string, mode: 'insensitive' } },
          { lastMessage: { contains: keyword as string, mode: 'insensitive' } },
          { customer: { name: { contains: keyword as string, mode: 'insensitive' } } },
          { customer: { customerId: { contains: keyword as string, mode: 'insensitive' } } }
        ]
      } : {})
    }

    const [conversations, totalConversations] = await Promise.all([
      prisma.chatConversationDB.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
              lastSeenAt: true,
              tags: {
                include: {
                  tag: {
                    select: { id: true, name: true, color: true }
                  }
                }
              }
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: [
          { isUnread: 'desc' },
          { priority: 'desc' },
          { lastMessageAt: 'desc' }
        ]
      }),
      prisma.chatConversationDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        totalItems: totalConversations,
        totalPages: Math.ceil(totalConversations / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Conversations retrieved successfully'
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations'
    })
  }
}

/**
 * POST - Create new conversation
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<ConversationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      customerId,
      subject,
      priority = 'normal',
      assignedAdminId
    } = req.body

    // Validation
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      })
    }

    // Check if customer exists
    const customer = await prisma.chatCustomerDB.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      })
    }

    // Create conversation with transaction
    const conversation = await prisma.$transaction(async (tx) => {
      const newConversation = await tx.chatConversationDB.create({
        data: {
          customerId,
          subject,
          priority,
          status: assignedAdminId ? 'assigned' : 'open',
          assignedAdminId: assignedAdminId || null,
          isUnread: true,
          unreadCount: 0
        },
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      })

      // Record work history
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatConversationDB',
        newConversation.id,
        'CREATE',
        null,
        newConversation,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return newConversation
    })

    // Emit real-time event
    emitNewConversation(conversation)

    return res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    })
  }
}

/**
 * PUT - Update conversation (assign, change status, etc.)
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<ConversationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      id,
      status,
      priority,
      assignedAdminId,
      subject
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      })
    }

    // Check if conversation exists
    const existingConversation = await prisma.chatConversationDB.findUnique({
      where: { id }
    })

    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    // Update conversation with transaction
    const conversation = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        updatedAt: new Date()
      }

      if (status !== undefined) {
        updateData.status = status
        if (status === 'resolved') {
          updateData.resolvedAt = new Date()
        } else if (status === 'closed') {
          updateData.closedAt = new Date()
        }
      }

      if (priority !== undefined) updateData.priority = priority
      if (subject !== undefined) updateData.subject = subject

      if (assignedAdminId !== undefined) {
        updateData.assignedAdminId = assignedAdminId
        if (assignedAdminId && existingConversation.status === 'open') {
          updateData.status = 'assigned'
        }
      }

      const updatedConversation = await tx.chatConversationDB.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      })

      // Record work history
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatConversationDB',
        id,
        'UPDATE',
        existingConversation,
        updatedConversation,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return updatedConversation
    })

    // Emit real-time events
    emitConversationUpdated(conversation)
    
    // If assignment changed, emit specific assignment event and send notifications
    if (assignedAdminId !== undefined && assignedAdminId !== existingConversation.assignedAdminId) {
      emitConversationAssigned(
        conversation.id,
        assignedAdminId,
        conversation.assignedAdmin?.name,
        admin.username
      )

      // Send notifications to newly assigned agent
      if (assignedAdminId) {
        try {
          await notifyConversationAssigned({
            userId: assignedAdminId,
            assignedBy: admin.name || admin.username,
            customerName: conversation.customer?.name || 'ลูกค้า',
            conversationId: conversation.id
          })

          await pushConversationAssigned({
            userId: assignedAdminId,
            assignedBy: admin.name || admin.username,
            customerName: conversation.customer?.name || 'ลูกค้า',
            conversationId: conversation.id
          })
        } catch (error) {
          console.error('Failed to send assignment notification:', error)
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: conversation,
      message: 'Conversation updated successfully'
    })
  } catch (error) {
    console.error('Update conversation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update conversation'
    })
  }
}

/**
 * DELETE - Delete conversation
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ConversationResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      })
    }

    // Check if conversation exists
    const existingConversation = await prisma.chatConversationDB.findUnique({
      where: { id }
    })

    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    // Delete with transaction
    await prisma.$transaction(async (tx) => {
      // Record work history before deletion
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatConversationDB',
        id,
        'DELETE',
        existingConversation,
        null,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      // Delete conversation (cascade will handle messages)
      await tx.chatConversationDB.delete({
        where: { id }
      })
    })

    // Emit real-time event
    emitConversationDeleted(id, existingConversation.customerId)

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ConversationResponse>) {
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
    console.error('Chat conversations API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
