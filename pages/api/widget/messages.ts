/**
 * Widget Messages API
 * Public endpoint for widget to send/receive messages
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { emitNewMessage } from '@/lib/socket'
import jwt from 'jsonwebtoken'

interface MessageResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Get messages or send a new message
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse>
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Widget-Token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const token = req.headers['x-widget-token'] as string
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Widget token required'
      })
    }

    // Decode JWT token to get customer ID
    const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'
    let customerId: string
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      customerId = decoded.customerId
      
      if (!customerId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token: missing customerId'
        })
      }
    } catch (jwtError) {
     // console.error('JWT verification error:', jwtError)
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }

    if (req.method === 'GET') {
      // Get messages for conversation
      const { conversationId } = req.query

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: 'Conversation ID required'
        })
      }

      const messages = await prisma.chatMessageDB.findMany({
        where: {
          conversationId: conversationId as string
        },
        include: {
          customer: {
            select: {
              id: true,
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
        orderBy: { createdAt: 'asc' },
        take: 100
      })

      return res.status(200).json({
        success: true,
        data: messages
      })
    } else if (req.method === 'POST') {
      // Send new message
      const {
        conversationId,
        content,
        messageType = 'text',
        attachments
      } = req.body

      if (!conversationId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Conversation ID and content are required'
        })
      }

      // Verify conversation belongs to customer
      const conversation = await prisma.chatConversationDB.findFirst({
        where: {
          id: conversationId,
          customerId
        }
      })

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        })
      }

      // Get customer info
      const customer = await prisma.chatCustomerDB.findUnique({
        where: { id: customerId }
      })

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        })
      }

      // Widget key is not needed for message sending
      // const { widgetId } = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Create message with retry logic for P2034 conflicts
      let message
      let retries = 3
      
      while (retries > 0) {
        try {
          message = await prisma.$transaction(async (tx) => {
            const newMessage = await tx.chatMessageDB.create({
              data: {
                conversationId,
                customerId,
                widgetKeyId: null, // Skip widget key for now
                senderType: 'customer',
                senderId: customerId,
                senderName: customer.name || 'Guest',
                messageType,
                content,
                attachments: attachments || null,
                isRead: false,
                isSent: true
              },
              include: {
                customer: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true
                  }
                }
              }
            })

            // Update conversation
            const currentUnreadCount = await tx.chatMessageDB.count({
              where: {
                conversationId,
                senderType: 'customer',
                isRead: false
              }
            })

            await tx.chatConversationDB.update({
              where: { id: conversationId },
              data: {
                lastMessage: content.substring(0, 200),
                lastMessageAt: new Date(),
                updatedAt: new Date(),
                isUnread: true,
                unreadCount: currentUnreadCount + 1, // +1 for the new message
                status: 'pending' // Set status to pending when customer sends message
              }
            })

            return newMessage
          })
          
          // Success - break retry loop
          break
        } catch (error: any) {
          retries--
          
          // Check if it's a transaction conflict error
          if (error?.code === 'P2034' && retries > 0) {
           // console.log(`[Widget Messages] Transaction conflict, retrying... (${retries} retries left)`)
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 100 * (3 - retries)))
            continue
          }
          
          // Not a conflict error or no more retries - throw
          throw error
        }
      }

      // Emit real-time event
      emitNewMessage(conversationId, message)

      return res.status(201).json({
        success: true,
        data: message
      })
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      })
    }
  } catch (error) {
   // console.error('Widget message error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to process message'
    })
  }
}

