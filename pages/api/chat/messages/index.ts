/**
 * Chat Messages API
 * Handles sending and retrieving messages
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { 
  emitNewMessage, 
  emitMessageUpdated, 
  emitMessageDeleted,
  emitMessagesRead 
} from '@/lib/socket'
import { notifyNewMessage } from '@/lib/notifications'
import { pushNewMessage } from '@/lib/pushNotifications'

interface MessageResponse {
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
 * GET - List messages for a conversation
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<MessageResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '50',
      conversationId,
      customerId,
      messageType = '',
      unreadOnly = 'false'
    } = req.query

    if (!conversationId && !customerId) {
      return res.status(400).json({
        success: false,
        error: 'Either conversationId or customerId is required'
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 50
    const skip = (pageNum - 1) * pageSizeNum

    // Build where clause
    const whereClause: Prisma.ChatMessageDBWhereInput = {
      ...(conversationId && { conversationId: conversationId as string }),
      ...(customerId && { customerId: customerId as string }),
      ...(messageType && { messageType: messageType as string }),
      ...(unreadOnly === 'true' && { isRead: false })
    }

    const [messages, totalMessages] = await Promise.all([
      prisma.chatMessageDB.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              avatarUrl: true
            }
          },
          readBy: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                  username: true
                }
              }
            }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'asc' }
      }),
      prisma.chatMessageDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        totalItems: totalMessages,
        totalPages: Math.ceil(totalMessages / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Messages retrieved successfully'
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve messages'
    })
  }
}

/**
 * POST - Send a new message
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<MessageResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      conversationId,
      customerId,
      senderType, // 'agent' or 'system'
      content,
      messageType = 'text',
      attachments,
      metadata
    } = req.body

    // Validation
    if (!conversationId || !customerId || !content) {
      return res.status(400).json({
        success: false,
        error: 'conversationId, customerId, and content are required'
      })
    }

    // Verify conversation exists
    const conversation = await prisma.chatConversationDB.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    // Create message with transaction
    const message = await prisma.$transaction(async (tx) => {
      // Create the message
      const newMessage = await tx.chatMessageDB.create({
        data: {
          conversationId,
          customerId,
          senderType: senderType || 'agent',
          senderId: admin.id,
          senderName: admin.name || admin.username,
          messageType,
          content,
          attachments: attachments || null,
          metadata: metadata || null,
          isRead: false,
          isSent: true,
          isAutoReply: false
        },
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      })

      // Get current unread count before updating
      const currentUnreadCount = await tx.chatMessageDB.count({
        where: {
          conversationId,
          senderType: 'customer',
          isRead: false
        }
      })

      // Update conversation with last message info
      await tx.chatConversationDB.update({
        where: { id: conversationId },
        data: {
          lastMessage: content.substring(0, 200),
          lastMessageAt: new Date(),
          updatedAt: new Date(),
          status: 'active', // Set status to active when agent responds
          isUnread: currentUnreadCount > 0,
          unreadCount: currentUnreadCount
        }
      })

      return newMessage
    })

    // Emit real-time event
    emitNewMessage(conversationId, { ...message, customerId })

    // Create in-app notification for assigned agent (if not sender)
    if (conversation.assignedAdminId && conversation.assignedAdminId !== admin.id) {
      try {
        await notifyNewMessage({
          userId: conversation.assignedAdminId,
          senderName: message.senderName || 'Unknown',
          messagePreview: content.substring(0, 100),
          conversationId
        })

        // Send push notification
        await pushNewMessage({
          userId: conversation.assignedAdminId,
          senderName: message.senderName || 'Unknown',
          messagePreview: content.substring(0, 100),
          conversationId
        })
      } catch (error) {
        console.error('Failed to send notification:', error)
        // Don't fail the request if notification fails
      }
    }

    return res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Send message error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to send message'
    })
  }
}

/**
 * PUT - Mark messages as read
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<MessageResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { messageIds, conversationId } = req.body

    if (!messageIds && !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Either messageIds or conversationId is required'
      })
    }

    await prisma.$transaction(async (tx) => {
      // Mark specific messages as read
      if (messageIds && Array.isArray(messageIds)) {
        await tx.chatMessageDB.updateMany({
          where: {
            id: { in: messageIds },
            isRead: false
          },
          data: {
            isRead: true,
            readAt: new Date()
          }
        })
      }

      // Mark all messages in conversation as read
      if (conversationId) {
        await tx.chatMessageDB.updateMany({
          where: {
            conversationId,
            isRead: false,
            senderType: 'customer' // Only mark customer messages as read
          },
          data: {
            isRead: true,
            readAt: new Date()
          }
        })

        // Update conversation unread count
        const remainingUnreadCount = await tx.chatMessageDB.count({
          where: {
            conversationId,
            senderType: 'customer',
            isRead: false
          }
        })

        await tx.chatConversationDB.update({
          where: { id: conversationId },
          data: {
            isUnread: remainingUnreadCount > 0,
            unreadCount: remainingUnreadCount
          }
        })
      }
    })

    // Emit real-time event
    if (conversationId) {
      emitMessagesRead(conversationId, messageIds, admin.id, 'agent')
    }

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    })
  } catch (error) {
    console.error('Mark messages read error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    })
  }
}

/**
 * DELETE - Delete a message
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<MessageResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Message ID is required'
      })
    }

    // Check if message exists
    const existingMessage = await prisma.chatMessageDB.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

    // Delete message
    await prisma.chatMessageDB.delete({
      where: { id }
    })

    // Emit real-time event
    emitMessageDeleted(existingMessage.conversationId, id)

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<MessageResponse>) {
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
    console.error('Chat messages API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
