/**
 * Chat Customer Management API
 * Handles CRUD operations for chat customers
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

interface CustomerResponse {
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
 * GET - List customers with pagination and search
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<CustomerResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      id = '',
      status = 'all',
      language = '',
      hasTag = '',
      hasSegment = ''
    } = req.query

    // Single customer by ID
    if (id) {
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' })
      }

      const customer = await prisma.chatCustomerDB.findUnique({
        where: { id: String(id) },
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          segments: {
            include: {
              segment: true
            }
          },
          conversations: {
            orderBy: { lastMessageAt: 'desc' },
            take: 5,
            include: {
              assignedAdmin: {
                select: { id: true, name: true, username: true }
              }
            }
          },
          _count: {
            select: {
              messages: true,
              conversations: true
            }
          }
        }
      })

      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' })
      }

      return res.status(200).json({
        success: true,
        data: customer,
        message: 'Customer retrieved successfully'
      })
    }

    // List with pagination
    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    // Build where clause
    const whereClause: Prisma.ChatCustomerDBWhereInput = {
      ...(status === 'active' && { isActive: true }),
      ...(status === 'blocked' && { isBlocked: true }),
      ...(language && { language: language as string }),
      ...(hasTag && {
        tags: {
          some: {
            tagId: hasTag as string
          }
        }
      }),
      ...(hasSegment && {
        segments: {
          some: {
            segmentId: hasSegment as string
          }
        }
      }),
      ...(keyword ? {
        OR: [
          { customerId: { contains: keyword as string, mode: 'insensitive' } },
          { name: { contains: keyword as string, mode: 'insensitive' } },
          { email: { contains: keyword as string, mode: 'insensitive' } },
          { phone: { contains: keyword as string, mode: 'insensitive' } }
        ]
      } : {})
    }

    const [customers, totalCustomers] = await Promise.all([
      prisma.chatCustomerDB.findMany({
        where: whereClause,
        include: {
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, color: true }
              }
            }
          },
          _count: {
            select: {
              messages: true,
              conversations: true
            }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: { lastSeenAt: 'desc' }
      }),
      prisma.chatCustomerDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        totalItems: totalCustomers,
        totalPages: Math.ceil(totalCustomers / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Customers retrieved successfully'
    })
  } catch (error) {
    console.error('Get customers error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve customers'
    })
  }
}

/**
 * POST - Create new customer
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<CustomerResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      customerId,
      name,
      email,
      phone,
      avatarUrl,
      language = 'th',
      timezone = 'Asia/Bangkok',
      metadata
    } = req.body

    // Validation
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      })
    }

    // Check for existing customer
    const existing = await prisma.chatCustomerDB.findUnique({
      where: { customerId }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID already exists'
      })
    }

    // Create customer with transaction
    const customer = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.chatCustomerDB.create({
        data: {
          customerId,
          name,
          email,
          phone,
          avatarUrl,
          language,
          timezone,
          metadata: metadata || {},
          isActive: true,
          isBlocked: false
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      })

      // Record work history
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatCustomerDB',
        newCustomer.id,
        'CREATE',
        null,
        newCustomer,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return newCustomer
    })

    return res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Customer with this ID already exists'
        })
      }
    }
    console.error('Create customer error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    })
  }
}

/**
 * PUT - Update customer
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse<CustomerResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      id,
      name,
      email,
      phone,
      avatarUrl,
      language,
      timezone,
      isActive,
      isBlocked,
      blockedReason,
      metadata
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      })
    }

    // Check if customer exists
    const existingCustomer = await prisma.chatCustomerDB.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      })
    }

    // Update customer with transaction
    const customer = await prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.chatCustomerDB.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(language !== undefined && { language }),
          ...(timezone !== undefined && { timezone }),
          ...(isActive !== undefined && { isActive }),
          ...(isBlocked !== undefined && { isBlocked }),
          ...(blockedReason !== undefined && { blockedReason }),
          ...(metadata !== undefined && { metadata }),
          updatedAt: new Date()
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          segments: {
            include: {
              segment: true
            }
          }
        }
      })

      // Record work history
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatCustomerDB',
        id,
        'UPDATE',
        existingCustomer,
        updatedCustomer,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return updatedCustomer
    })

    return res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    })
  }
}

/**
 * DELETE - Delete customer
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse<CustomerResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      })
    }

    // Check if customer exists
    const existingCustomer = await prisma.chatCustomerDB.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      })
    }

    // Delete with transaction
    await prisma.$transaction(async (tx) => {
      // Record work history before deletion
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatCustomerDB',
        id,
        'DELETE',
        existingCustomer,
        null,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      // Delete customer (cascade will handle related records)
      await tx.chatCustomerDB.delete({
        where: { id }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    })
  } catch (error) {
    console.error('Delete customer error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<CustomerResponse>) {
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
    console.error('Chat customers API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
