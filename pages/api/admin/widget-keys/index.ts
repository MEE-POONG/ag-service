/**
 * Widget Keys Management API
 * จัดการ Widget Keys สำหรับ external websites
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface WidgetKeyResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * GET - List all widget keys
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<WidgetKeyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const widgetKeys = await prisma.chatWidgetKeyDB.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            conversations: true,
            messages: true
          }
        }
      }
    })

    // Transform data to include usage statistics
    const transformedKeys = widgetKeys.map(key => ({
      ...key,
      usage: {
        totalConversations: key._count.conversations,
        totalMessages: key._count.messages,
        lastUsedAt: key.lastUsedAt
      }
    }))

    return res.status(200).json({
      success: true,
      data: transformedKeys,
      message: 'Widget keys retrieved successfully'
    })
  } catch (error) {
    console.error('Get widget keys error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve widget keys'
    })
  }
}

/**
 * POST - Create new widget key
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<WidgetKeyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      name,
      domain,
      description,
      settings
    } = req.body

    // Validation
    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Name and domain are required'
      })
    }

    // Generate unique widget key
    const key = `wk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create widget key with default settings
    const widgetKey = await prisma.chatWidgetKeyDB.create({
      data: {
        name,
        key,
        domain,
        description: description || null,
        isActive: true,
        settings: settings || {
          primaryColor: '#3B82F6',
          accentColor: '#10B981',
          headerTitle: 'Chat with us',
          headerSubtitle: "We're here to help",
          welcomeMessage: 'Hello! How can we help you today?',
          placeholderText: 'Type a message...',
          position: 'bottom-right',
          autoOpen: false,
          showAgentAvatar: true,
          showTimestamp: true,
          enableFileUpload: true,
          enableEmoji: true
        },
        createdBy: admin.id
      }
    })

    return res.status(201).json({
      success: true,
      data: widgetKey,
      message: 'Widget key created successfully'
    })
  } catch (error) {
    console.error('Create widget key error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create widget key'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<WidgetKeyResponse>) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Widget keys API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
