/**
 * Individual Widget Key Management API
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
 * PUT - Update widget key
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<WidgetKeyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.query
    const updateData = req.body

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Widget key ID is required'
      })
    }

    // Update widget key
    const widgetKey = await prisma.chatWidgetKeyDB.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return res.status(200).json({
      success: true,
      data: widgetKey,
      message: 'Widget key updated successfully'
    })
  } catch (error) {
    console.error('Update widget key error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update widget key'
    })
  }
}

/**
 * DELETE - Delete widget key
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<WidgetKeyResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Widget key ID is required'
      })
    }

    // Delete widget key
    await prisma.chatWidgetKeyDB.delete({
      where: { id }
    })

    return res.status(200).json({
      success: true,
      message: 'Widget key deleted successfully'
    })
  } catch (error) {
    console.error('Delete widget key error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete widget key'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<WidgetKeyResponse>) {
  try {
    switch (req.method) {
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
    console.error('Widget key API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
