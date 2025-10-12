/**
 * Assign/Remove Tags from Customers
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface AssignTagResponse {
  success?: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * POST - Assign tags to customer
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<AssignTagResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { customerId, tagIds } = req.body

    if (!customerId || !tagIds || !Array.isArray(tagIds)) {
      return res.status(400).json({
        success: false,
        error: 'customerId and tagIds array are required'
      })
    }

    // Verify customer exists
    const customer = await prisma.chatCustomerDB.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      })
    }

    // Assign tags
    await prisma.$transaction(async (tx) => {
      // Remove existing tags
      await tx.chatCustomerTagDB.deleteMany({
        where: { customerId }
      })

      // Add new tags
      if (tagIds.length > 0) {
        await tx.chatCustomerTagDB.createMany({
          data: tagIds.map(tagId => ({
            customerId,
            tagId,
            createdBy: admin.username
          })),
          skipDuplicates: true
        })
      }
    })

    // Get updated customer with tags
    const updatedCustomer = await prisma.chatCustomerDB.findUnique({
      where: { id: customerId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      data: updatedCustomer,
      message: 'Tags assigned successfully'
    })
  } catch (error) {
    console.error('Assign tags error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to assign tags'
    })
  }
}

/**
 * DELETE - Remove tag from customer
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<AssignTagResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { customerId, tagId } = req.body

    if (!customerId || !tagId) {
      return res.status(400).json({
        success: false,
        error: 'customerId and tagId are required'
      })
    }

    await prisma.chatCustomerTagDB.deleteMany({
      where: {
        customerId,
        tagId
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Tag removed successfully'
    })
  } catch (error) {
    console.error('Remove tag error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to remove tag'
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AssignTagResponse>) {
  try {
    switch (req.method) {
      case 'POST':
        return await handlePost(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Assign tag API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
