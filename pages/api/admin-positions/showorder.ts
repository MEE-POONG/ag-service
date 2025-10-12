import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { serializeBigIntToNumber } from '@/lib/bigintUtils';

const prisma = new PrismaClient();

interface ShowOrderResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShowOrderResponse>
) {
  try {
    switch (req.method) {
      // GET: ดึงตำแหน่งตามแผนก (ถ้าส่ง adminDepartmentId) หรือทั้งหมดเรียงตาม priority
      case 'GET': {
        const { adminDepartmentId } = req.query;

        const whereClause: any = {};
        if (typeof adminDepartmentId === 'string' && adminDepartmentId.trim() !== '') {
          whereClause.adminDepartmentId = adminDepartmentId.trim();
        }

        const positions = await prisma.adminPositionDB.findMany({
          where: whereClause,
          orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });

        return res.status(200).json({
          success: true,
          data: serializeBigIntToNumber(positions),
          message: `ดึงข้อมูลตำแหน่งสำเร็จ จำนวน ${positions.length} รายการ`,
        });
      }

      // PUT: รับ updates = [{ id, showOrder }] แล้วอัปเดต priority แบบ batch
      case 'PUT': {
        const { updates, updatedBy } = req.body as {
          updates: Array<{ id: string; showOrder: number }>;
          updatedBy: string;
        };

        if (!Array.isArray(updates) || updates.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุข้อมูลการอัปเดตลำดับ (updates array)',
          });
        }

        if (!updatedBy || typeof updatedBy !== 'string' || updatedBy.trim() === '') {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุผู้แก้ไข',
          });
        }

        // ตรวจรูปแบบเบื้องต้น
        for (const u of updates) {
          if (!u.id || typeof u.id !== 'string') {
            return res.status(400).json({
              success: false,
              error: 'ข้อมูลการอัปเดตไม่ถูกต้อง: ต้องมี id ของตำแหน่ง',
            });
          }
          if (typeof u.showOrder !== 'number' || u.showOrder <= 0) {
            return res.status(400).json({
              success: false,
              error: 'ข้อมูลการอัปเดตไม่ถูกต้อง: showOrder ต้องเป็นตัวเลข > 0',
            });
          }
        }

        // ดึงรายการที่ถูกอัปเดตทั้งหมด (เพื่อรู้ว่าแต่ละ id อยู่แผนกไหน)
        const ids = updates.map(u => u.id);
        const currentRows = await prisma.adminPositionDB.findMany({
          where: { id: { in: ids } },
          select: { id: true, adminDepartmentId: true },
        });

        // ตรวจว่ามี id ไหนหาไม่เจอ
        const foundIds = new Set(currentRows.map(r => r.id));
        const notFound = ids.find(x => !foundIds.has(x));
        if (notFound) {
          return res.status(404).json({
            success: false,
            error: `ไม่พบตำแหน่ง id=${notFound}`,
          });
        }

        // จัดกลุ่ม updates ตาม adminDepartmentId ของปัจจุบัน
        const updateByDept: Record<string, Array<{ id: string; showOrder: number }>> = {};
        for (const u of updates) {
          const row = currentRows.find(r => r.id === u.id)!;
          const key = row.adminDepartmentId ?? 'root';
          if (!updateByDept[key]) updateByDept[key] = [];
          updateByDept[key].push(u);
        }

        // ตรวจลำดับซ้ำภายในแต่ละแผนก
        for (const [dept, group] of Object.entries(updateByDept)) {
          const orders = group.map(g => g.showOrder);
          const uniq = new Set(orders);
          if (orders.length !== uniq.size) {
            return res.status(400).json({
              success: false,
              error: `พบลำดับ (priority) ซ้ำกันในกลุ่ม ${dept === 'root' ? 'ไม่มีแผนก' : `แผนก ${dept}`}`,
            });
          }
        }

        // ทำธุรกรรม: อัปเดต priority (ใช้ BigInt รองรับคอลัมน์ Prisma ที่เป็น BigInt)
        await prisma.$transaction(
          updates.map(u =>
            prisma.adminPositionDB.update({
              where: { id: u.id },
              data: {
                // priority เป็น BigInt ใน DB -> แปลงเป็น bigint
                priority: u.showOrder,
                updatedBy: updatedBy.trim(),
                updatedAt: new Date(),
              },
            })
          )
        );

        // ส่งข้อมูลล่าสุดกลับ (optional: สามารถจำกัดเฉพาะแผนกเดียวได้ถ้าคุณส่ง department มากับ body)
        const updated = await prisma.adminPositionDB.findMany({
          where: { id: { in: ids } },
          orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });

        return res.status(200).json({
          success: true,
          data: serializeBigIntToNumber(updated),
          message: `อัปเดตลำดับการแสดง (priority) สำเร็จ จำนวน ${updates.length} รายการ`,
        });
      }

      default: {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`,
        });
      }
    }
  } catch (err) {
    console.error('AdminPositionDB ShowOrder API Error:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
}
