/**
 * Chat Tags API
 * Handles customer tagging for organization
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

interface TagResponse {
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

async function handleGet(req: NextApiRequest, res: NextApiResponse<TagResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      page = '1',
      pageSize = '50',
      keyword = '',
      id = '',
      isActive = ''
    } = req.query

    if (id) {
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' })
      }

      const tag = await prisma.chatTagDB.findUnique({
        where: { id: String(id) },
        include: {
          _count: {
            select: {
              customers: true
            }
          }
        }
      })

      if (!tag) {
        return res.status(404).json({ success: false, error: 'Tag not found' })
      }

      return res.status(200).json({
        success: true,
        data: tag,
        message: 'Tag retrieved successfully'
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 50
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.ChatTagDBWhereInput = {
      ...(isActive !== '' && { isActive: isActive === 'true' }),
      ...(keyword ? {
        OR: [
          { name: { contains: keyword as string, mode: 'insensitive' } },
          { description: { contains: keyword as string, mode: 'insensitive' } }
        ]
      } : {})
    }

    const [tags, totalTags] = await Promise.all([
      prisma.chatTagDB.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              customers: true
            }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.chatTagDB.count({ where: whereClause })
    ])

    return res.status(200).json({
      success: true,
      data: tags,
      pagination: {
        totalItems: totalTags,
        totalPages: Math.ceil(totalTags / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: 'Tags retrieved successfully'
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tags'
    })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<TagResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      name,
      color = '#3B82F6',
      description,
      isActive = true
    } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Tag name is required'
      })
    }

    const existing = await prisma.chatTagDB.findUnique({
      where: { name }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Tag with this name already exists'
      })
    }

    const tag = await prisma.$transaction(async (tx) => {
      const newTag = await tx.chatTagDB.create({
        data: {
          name,
          color,
          description,
          isActive,
          createdBy: admin.username,
          updatedBy: admin.username
        }
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatTagDB',
        newTag.id,
        'CREATE',
        null,
        newTag,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return newTag
    })

    return res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag created successfully'
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Tag with this name already exists'
        })
      }
    }
    console.error('Create tag error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create tag'
    })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<TagResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const {
      id,
      name,
      color,
      description,
      isActive
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Tag ID is required'
      })
    }

    const existingTag = await prisma.chatTagDB.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      })
    }

    if (name && name !== existingTag.name) {
      const duplicate = await prisma.chatTagDB.findFirst({
        where: {
          name,
          id: { not: id }
        }
      })

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: 'Tag with this name already exists'
        })
      }
    }

    const tag = await prisma.$transaction(async (tx) => {
      const updatedTag = await tx.chatTagDB.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(color !== undefined && { color }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          updatedBy: admin.username,
          updatedAt: new Date()
        }
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatTagDB',
        id,
        'UPDATE',
        existingTag,
        updatedTag,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return updatedTag
    })

    return res.status(200).json({
      success: true,
      data: tag,
      message: 'Tag updated successfully'
    })
  } catch (error) {
    console.error('Update tag error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update tag'
    })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<TagResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Tag ID is required'
      })
    }

    const existingTag = await prisma.chatTagDB.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      })
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ChatTagDB',
        id,
        'DELETE',
        existingTag,
        null,
        admin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      await tx.chatTagDB.delete({
        where: { id }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    })
  } catch (error) {
    console.error('Delete tag error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete tag'
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TagResponse>) {
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
    console.error('Chat tags API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
