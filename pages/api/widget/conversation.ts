/**
 * Widget Conversation API
 * Public endpoint for widget to create/get conversations
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { emitNewConversation } from '@/lib/socket'
import jwt from 'jsonwebtoken'

interface ConversationResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Get or create conversation for widget
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversationResponse>
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
    
    // Validate token format
    if (!token || typeof token !== 'string') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      })
    }
    
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
      console.error('JWT verification error:', jwtError)
      console.error('Token received:', token)
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }

    // Find customer by MongoDB ObjectId
    const customer = await prisma.chatCustomerDB.findUnique({
      where: { id: customerId },
      select: { id: true }
    })

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      })
    }

    if (req.method === 'GET') {
      // Get active conversation for customer using MongoDB ObjectId
      const conversation = await prisma.chatConversationDB.findFirst({
        where: {
          customerId: customer.id,
          status: {
            in: ['open', 'assigned']
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              avatarUrl: true
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              username: true
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
            }
          }
        },
        orderBy: {
          lastMessageAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: conversation
      })
    } else if (req.method === 'POST') {
      // Create new conversation
      const { subject } = req.body

      // Widget key is not needed for conversation creation
      // const { widgetId } = JSON.parse(Buffer.from(token, 'base64').toString())
      
      const conversation = await prisma.chatConversationDB.create({
        data: {
          customerId: customer.id,
          widgetKeyId: null, // Skip widget key for now
          subject: subject || 'Chat from Widget',
          status: 'open',
          priority: 'normal',
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
          }
        }
      })

      // Emit real-time event
      emitNewConversation(conversation)

      return res.status(201).json({
        success: true,
        data: conversation
      })
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      })
    }
  } catch (error) {
    console.error('Widget conversation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return res.status(500).json({
      success: false,
      error: 'Failed to process conversation'
    })
  }
}

