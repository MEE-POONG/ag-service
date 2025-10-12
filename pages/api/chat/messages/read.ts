import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface ReadResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Mark message as read by admin
 * POST /api/chat/messages/read
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadResponse>
) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { messageIds } = req.body

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'messageIds array is required'
      })
    }

    // Retry logic for transaction conflicts
    let conversationIds: string[] = []
    let retries = 3
    
    while (retries > 0) {
      try {
        // Mark messages as read in transaction
        conversationIds = await prisma.$transaction(async (tx) => {
      // Create read tracking records (handle duplicates with try-catch for MongoDB)
      for (const messageId of messageIds) {
        try {
          await tx.chatMessageReadDB.create({
            data: {
              messageId,
              adminId: admin.id,
              readAt: new Date()
            }
          })
        } catch (createError: any) {
          // Ignore duplicate key errors (P2002), throw others
          if (createError?.code !== 'P2002') {
            throw createError
          }
          // If P2002 (unique constraint), just skip - record already exists
        }
      }

      // Update message isRead status
      await tx.chatMessageDB.updateMany({
        where: {
          id: { in: messageIds },
          senderType: 'customer' // Only mark customer messages as read
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      // Get conversation IDs from the messages to update unread counts
      const messages = await tx.chatMessageDB.findMany({
        where: { id: { in: messageIds } },
        select: { conversationId: true }
      })

      const conversationIds = [...new Set(messages.map(msg => msg.conversationId))]

      // Update unread counts for each conversation
      for (const conversationId of conversationIds) {
        const unreadCount = await tx.chatMessageDB.count({
          where: {
            conversationId,
            senderType: 'customer',
            isRead: false
          }
        })

        await tx.chatConversationDB.update({
          where: { id: conversationId },
          data: {
            unreadCount,
            isUnread: unreadCount > 0
          }
        })
      }
      
      return conversationIds
        })
        
        // Success - break retry loop
        break
      } catch (error: any) {
        retries--
        
        // Check if it's a transaction conflict error
        if (error?.code === 'P2034' && retries > 0) {
          console.log(`Transaction conflict, retrying... (${retries} retries left)`)
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * (3 - retries)))
          continue
        }
        
        // Not a conflict error or no more retries - throw
        throw error
      }
    }

    // Emit real-time event for conversation updates
    const { emitConversationUpdated } = await import('@/lib/socket')
    
    for (const conversationId of conversationIds) {
      const conversation = await prisma.chatConversationDB.findUnique({
        where: { id: conversationId },
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
      
      if (conversation) {
        emitConversationUpdated(conversation)
      }
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
