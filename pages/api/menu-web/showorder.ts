import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { serializeBigIntToNumber } from '@/lib/bigintUtils'

const prisma = new PrismaClient()

interface MenuWebResponse {
  success: boolean
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MenuWebResponse>
) {
  try {
    switch (req.method) {
      case 'GET':
        // ดึงเมนูทั้งหมดเรียงตาม showOrder
        const data = await prisma.menuWebDB.findMany({
          where: {
            
            isVisible: true
          },
          orderBy: [
            { showOrder: 'asc' },
            { createdAt: 'desc' }
          ]
        })

        return res.status(200).json({
          success: true,
          data: serializeBigIntToNumber(data),
          message: `ดึงข้อมูลเมนูทั้งหมดสำเร็จ จำนวน ${data.length} รายการ`
        })

      case 'PUT':
        const { updates, updatedBy } = req.body

        if (!Array.isArray(updates) || updates.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุข้อมูลการอัปเดตลำดับ (updates array)'
          })
        }

        if (!updatedBy || typeof updatedBy !== 'string' || updatedBy.trim() === '') {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุผู้แก้ไข'
          })
        }

        // Validate updates
        for (const update of updates) {
          if (!update.id || typeof update.id !== 'string') {
            return res.status(400).json({
              success: false,
              error: 'ข้อมูลการอัปเดตไม่ถูกต้อง: ต้องมี id ของเมนู'
            })
          }

          if (typeof update.showOrder !== 'number' || update.showOrder < 0) {
            return res.status(400).json({
              success: false,
              error: 'ข้อมูลการอัปเดตไม่ถูกต้อง: showOrder ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0'
            })
          }
        }

        interface UpdateItem {
          id: string;
          showOrder: number;
          parentId?: string;
        }

        // Group updates by parentId to check for duplicate showOrder
        const groupedUpdates = updates.reduce((acc, update: UpdateItem) => {
          const parentId = update.parentId || 'root'
          if (!acc[parentId]) {
            acc[parentId] = []
          }
          acc[parentId].push(update)
          return acc
        }, {} as Record<string, UpdateItem[]>)

        // Check for duplicate showOrder within each group
        for (const [parentId, groupUpdates] of Object.entries(groupedUpdates) as [string, UpdateItem[]][]) {
          const showOrders = groupUpdates.map(u => u.showOrder)
          const uniqueShowOrders = new Set(showOrders)

          if (showOrders.length !== uniqueShowOrders.size) {
            return res.status(400).json({
              success: false,
              error: `พบลำดับการแสดงซ้ำกันในกลุ่ม ${parentId === 'root' ? 'เมนูหลัก' : 'เมนูย่อย'}`
            })
          }
        }

        // Batch update using transaction
        await prisma.$transaction(
          updates.map(update =>
            prisma.menuWebDB.update({
              where: { id: update.id },
              data: {
                showOrder: update.showOrder,
                updatedBy: updatedBy.trim(),
                updatedAt: new Date()
              }
            })
          )
        )

        // Get updated menus
        const updatedMenus = await prisma.menuWebDB.findMany({
          orderBy: [
            { showOrder: 'asc' },
            { createdAt: 'desc' }
          ]
        })

        return res.status(200).json({
          success: true,
          data: serializeBigIntToNumber(updatedMenus),
          message: `อัปเดตลำดับการแสดงสำเร็จ จำนวน ${updates.length} รายการ`
        })

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`
        })
    }
  } catch (error) {
    console.error('ShowOrder API Error:', error)

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    })
  }
}

