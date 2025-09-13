// pages/api/aguseraccounts/selectorigin.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import { extractUserInfo } from '@/utils/workHistoryUtils'

type Resp<T = any> = {
  success?: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

const POS_RANK = {
  agent: 1,
  master: 2,
  senior: 3,
} as const

type PositionKey = keyof typeof POS_RANK

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { origin = '', position = '', page = '1', pageSize = '10' } = req.query as Record<string, string>

    if (!origin && !position) {
      return res.status(400).json({
        success: false,
        error: 'ต้องระบุอย่างน้อยหนึ่งค่า: origin หรือ position',
      })
    }

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1)
    const sizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100)
    const skip = (pageNum - 1) * sizeNum

    // 1) หา originUser จาก username ที่ตรงกับ origin
    let originUser = null as any
    if (origin) {
      originUser = await prisma.agUserAccountDB.findFirst({
        where: { username: { equals: origin, mode: 'insensitive' } },
      })
    }

    // 2) หา users ที่ position สูงกว่าค่าที่ส่งมา
    let higherUsers: any[] = []
    let total = 0
    let pagination: Resp['pagination'] | undefined = undefined

    if (position) {
      const pos = String(position).toLowerCase() as PositionKey
      if (!(pos in POS_RANK)) {
        return res.status(400).json({
          success: false,
          error: 'position ไม่ถูกต้อง (ต้องเป็น agent, master หรือ senior)',
        })
      }

      const baseRank = POS_RANK[pos]
      const allowedPositions = (Object.keys(POS_RANK) as PositionKey[]).filter(
        (p) => POS_RANK[p] > baseRank
      )

      // ไม่มีใครสูงกว่า (เช่นส่ง senior มา)
      if (allowedPositions.length === 0) {
        higherUsers = []
        total = 0
        pagination = { totalItems: 0, totalPages: 0, currentPage: pageNum, pageSize: sizeNum }
      } else {
        [higherUsers, total] = await Promise.all([
          prisma.agUserAccountDB.findMany({
            where: { position: { in: allowedPositions as any } },
            skip,
            take: sizeNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.agUserAccountDB.count({
            where: { position: { in: allowedPositions as any } },
          }),
        ])

        pagination = {
          totalItems: total,
          totalPages: Math.ceil(total / sizeNum),
          currentPage: pageNum,
          pageSize: sizeNum,
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        originUser,   // อ็อบเจ็กต์ที่ username ตรงกับ origin (หรือ null ถ้าไม่พบ/ไม่ระบุ)
        higherUsers,  // รายการผู้ใช้ที่ตำแหน่งสูงกว่า position ที่ส่งมา (หรือ [] ถ้าไม่ระบุ/ไม่มี)
      },
      ...(pagination ? { pagination } : {}),
    })
  } catch (e) {
    console.error('aguseraccounts/selectorigin API error', e)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
