/**
 * Chat Widget Initialization API
 * Public endpoint for external websites to initialize chat widget
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface InitResponse {
  success: boolean
  data?: {
    widgetId: string
    settings: any
    customerId?: string
    token?: string
  }
  error?: string
}

/**
 * Initialize chat widget for external website
 * POST /api/widget/init
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InitResponse>
) {
  // Enable CORS for external domains
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Widget-Key')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { widgetKey, customerInfo } = req.body

    // Validate widget key
    if (!widgetKey) {
      return res.status(400).json({
        success: false,
        error: 'Widget key is required'
      })
    }

    // Find and validate widget key
    const widgetKeyData = await prisma.chatWidgetKeyDB.findUnique({
      where: { key: widgetKey }
    })

    if (!widgetKeyData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid widget key'
      })
    }

    if (!widgetKeyData.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Widget key is disabled'
      })
    }

    // Update last used timestamp
    await prisma.chatWidgetKeyDB.update({
      where: { id: widgetKeyData.id },
      data: { lastUsedAt: new Date() }
    })

    const settings = widgetKeyData.settings as any

    // Widget init no longer creates customer or token
    // Customer must login/register to get authenticated token
    // Just return widget settings

    return res.status(200).json({
      success: true,
      data: {
        widgetId: widgetKeyData.id,
        settings: settings || getDefaultSettings()
        // No customer or token - user must authenticate
      }
    })
  } catch (error) {
    console.error('Widget init error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize widget'
    })
  }
}

/**
 * Default widget settings
 */
function getDefaultSettings() {
  return {
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
  }
}

