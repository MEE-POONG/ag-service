import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type PermissionItem = {
  AdminPositionId: string
  menuWebId?: string
  menuWebDBId?: string
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
      const { AdminPositionId } = req.query
      const where: any = {}
      if (typeof AdminPositionId === 'string' && AdminPositionId) {
        where.adminPositionId = AdminPositionId
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
        items.map((it) => {
          // รองรับทั้ง menuWebId และ menuWebDBId
          const menuId = it.menuWebId || it.menuWebDBId;
          if (!menuId) {
            throw new Error('ต้องระบุ menuWebId หรือ menuWebDBId');
          }

          return prisma.adminDefaultPermissionDB.upsert({
            where: {
              adminPositionId_menuWebId: {
                adminPositionId: it.AdminPositionId,
                menuWebId: menuId,
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
              adminPositionDB: {
                connect: {
                  id: it.AdminPositionId,
                },
              },
              menuWebDB: {
                connect: {
                  id: menuId,
                },
              },
              canAdvance: Boolean(it.canAdvance),
              canViews: Boolean(it.canViews),
              canCreate: Boolean(it.canCreate),
              canUpdate: Boolean(it.canUpdate),
              canDelete: Boolean(it.canDelete),
              isDeleted: false,
              createdAt: new Date(),
              createdBy: 'system',
              updatedAt: new Date(),
              updatedBy: 'system',
            },
          })
        })
      )

      return res.status(200).json({ success: true, message: 'บันทึกสิทธิ์สำเร็จ', updatedCount: items.length })
    }

    if (req.method === 'POST') {
      const it = req.body as PermissionItem
      const menuId = it?.menuWebId || it?.menuWebDBId;

      if (!it?.AdminPositionId || !menuId) {
        return res.status(400).json({ success: false, error: 'ต้องระบุ AdminPositionId และ menuWebId' })
      }

      const row = await prisma.adminDefaultPermissionDB.upsert({
        where: {
          adminPositionId_menuWebId: {
            adminPositionId: it.AdminPositionId,
            menuWebId: menuId,
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
          adminPositionDB: {
            connect: {
              id: it.AdminPositionId,
            },
          },
          menuWebDB: {
            connect: {
              id: menuId,
            },
          },
          canAdvance: Boolean(it.canAdvance),
          canViews: Boolean(it.canViews),
          canCreate: Boolean(it.canCreate),
          canUpdate: Boolean(it.canUpdate),
          canDelete: Boolean(it.canDelete),
          isDeleted: false,
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
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


