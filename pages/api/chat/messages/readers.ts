import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

interface Reader {
  id: string
  name: string
  username: string
  readAt: Date
}

interface ReadersResponse {
  success: boolean
  data?: Reader[]
  error?: string
}

/**
 * Get admin readers for a message
 * GET /api/chat/messages/readers?messageId=xxx
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadersResponse>
) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { messageId } = req.query

    if (!messageId || typeof messageId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'messageId is required'
      })
    }

    // Get readers for the message
    const readers = await prisma.chatMessageReadDB.findMany({
      where: {
        messageId: messageId
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        readAt: 'asc'
      }
    })

    const readerData = readers.map(reader => ({
      id: reader.admin.id,
      name: reader.admin.name,
      username: reader.admin.username,
      readAt: reader.readAt
    }))

    return res.status(200).json({
      success: true,
      data: readerData
    })
  } catch (error) {
    console.error('Get message readers error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get message readers'
    })
  }
}
