import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type PermissionItem = {
  adminPositionDBId: string
  menuPageWebId: string
  canAdvance?: boolean
  canViews?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}

type ResponseData = {
  success: boolean
  message?: string
  error?: string
  data?: any
  updatedCount?: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    if (req.method === 'GET') {
      const { adminPositionDBId } = req.query
      const where: any = { isDeleted: false }
      if (typeof adminPositionDBId === 'string' && adminPositionDBId) {
        where.adminPositionDBId = adminPositionDBId
      }

      const rows = await prisma.adminDefaultPermissionDB.findMany({ where })
      return res.status(200).json({ success: true, data: rows })
    }

    if (req.method === 'PUT') {
      const { items } = req.body as { items: PermissionItem[] }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'ต้องระบุ items เป็น array ที่มีอย่างน้อย 1 รายการ' })
      }

      await prisma.$transaction(
        items.map((it) =>
          prisma.adminDefaultPermissionDB.upsert({
            where: {
              adminPositionDBId_menuPageWebId: {
                adminPositionDBId: it.adminPositionDBId,
                menuPageWebId: it.menuPageWebId,
              },
            },
            update: {
              canAdvance: Boolean(it.canAdvance),
              canViews: Boolean(it.canViews),
              canCreate: Boolean(it.canCreate),
              canUpdate: Boolean(it.canUpdate),
              canDelete: Boolean(it.canDelete),
              updatedBy: 'system',
            },
            create: {
              adminPositionDBId: it.adminPositionDBId,
              menuPageWebId: it.menuPageWebId,
              canAdvance: Boolean(it.canAdvance),
              canViews: Boolean(it.canViews),
              canCreate: Boolean(it.canCreate),
              canUpdate: Boolean(it.canUpdate),
              canDelete: Boolean(it.canDelete),
              createdBy: 'system',
              updatedBy: 'system',
            },
          })
        )
      )

      return res.status(200).json({ success: true, message: 'บันทึกสิทธิ์สำเร็จ', updatedCount: items.length })
    }

    if (req.method === 'POST') {
      const it = req.body as PermissionItem
      if (!it?.adminPositionDBId || !it?.menuPageWebId) {
        return res.status(400).json({ success: false, error: 'ต้องระบุ adminPositionDBId และ menuPageWebId' })
      }

      const row = await prisma.adminDefaultPermissionDB.upsert({
        where: {
          adminPositionDBId_menuPageWebId: {
            adminPositionDBId: it.adminPositionDBId,
            menuPageWebId: it.menuPageWebId,
          },
        },
        update: {
          canAdvance: Boolean(it.canAdvance),
          canViews: Boolean(it.canViews),
          canCreate: Boolean(it.canCreate),
          canUpdate: Boolean(it.canUpdate),
          canDelete: Boolean(it.canDelete),
          updatedBy: 'system',
        },
        create: {
          adminPositionDBId: it.adminPositionDBId,
          menuPageWebId: it.menuPageWebId,
          canAdvance: Boolean(it.canAdvance),
          canViews: Boolean(it.canViews),
          canCreate: Boolean(it.canCreate),
          canUpdate: Boolean(it.canUpdate),
          canDelete: Boolean(it.canDelete),
          createdBy: 'system',
          updatedBy: 'system',
        },
      })

      return res.status(200).json({ success: true, data: row, message: 'บันทึกสิทธิ์สำเร็จ' })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'POST'])
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('AdminDefaultPermissionDB API error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
  }
}


