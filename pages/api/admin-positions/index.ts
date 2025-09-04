import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface AdminPositionResponse {
  success?: boolean;
  data?: any;
  departments?: any;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  position?: any;
  error?: string;
  message?: string;
}

function clampPriority(priority: number, maxAllowed: number): number {
  return Math.max(1, Math.min(priority, maxAllowed));
}

async function resequenceDepartment(
  tx: Prisma.TransactionClient,
  adminDepartmentId: string
) {
  // กันชน: ถ้า priority มี unique constraint ต่อแผนก ให้ดันค่าออกก่อน
  await tx.adminPositionDB.updateMany({
    where: { adminDepartmentId, isDeleted: false },
    data: { priority: { increment: 1000 } },
  })

  const rows = await tx.adminPositionDB.findMany({
    where: { adminDepartmentId, isDeleted: false },
    orderBy: [
      { priority: 'asc' },       // รักษา order เดิมตาม priority ปัจจุบัน
      { createdAt: 'asc' },      // tie-breaker
      { id: 'asc' },             // กันค่าซ้ำ
    ],
    select: { id: true },
  })

  // เซ็ตใหม่ให้เป็น 1..N เรียงตาม order ข้างบน
  for (let i = 0; i < rows.length; i++) {
    await tx.adminPositionDB.update({
      where: { id: rows[i].id },
      data: { priority: i + 1 },
    })
  }
}

// ดัน priority ของทั้งแผนกขึ้นเพื่อกันชน unique([adminDepartmentId, priority])
async function bumpDepartment(
  tx: Prisma.TransactionClient,
  adminDepartmentId: string
) {
  await tx.adminPositionDB.updateMany({
    where: { adminDepartmentId, isDeleted: false },
    data: { priority: { increment: 1000 } },
  });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<AdminPositionResponse>) {
  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      search = '',
      status = '',
      // ใหม่
      departmentId = '',
      id = '',
    } = req.query;

    // ถ้ามี id ให้ดึงตัวเดียวและข้าม pagination
    if (id) {
      const position = await prisma.adminPositionDB.findFirst({
        where: {
          id: id as string,
          isDeleted: false,
        },
        include: { adminDepartment: true },
      });

      if (!position) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบข้อมูลตำแหน่งที่ต้องการ',
        });
      }

      return res.status(200).json({
        success: true,
        data: position,
        message: 'ดึงข้อมูลตำแหน่งสำเร็จ',
      });
    }

    // ใช้ page และ pageSize สำหรับ Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // เงื่อนไขการค้นหา
    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.AdminPositionDBWhereInput = {
      isDeleted: false,
      ...(status && status !== 'all' ? { isActive: status === 'active' } : {}),
      // ใหม่: กรองตามแผนก
      ...(departmentId ? { adminDepartmentId: departmentId as string } : {}),
      ...(searchKeyword
        ? {
          OR: [
            { name: { contains: searchKeyword, mode: 'insensitive' } },
            { adminDepartment: { name: { contains: searchKeyword, mode: 'insensitive' } } },
          ],
        }
        : {}),
    };

    // ดึงข้อมูลตำแหน่งพร้อม Pagination
    const [positions, totalPositions] = await Promise.all([
      prisma.adminPositionDB.findMany({
        where: whereClause,
        include: { adminDepartment: true },
        skip,
        take: pageSizeNum,
        orderBy: { priority: 'asc' },
      }),
      prisma.adminPositionDB.count({ where: whereClause }),
    ]);

    // ดึงข้อมูลแผนกสำหรับ dropdown (ไม่ต้อง pagination)
    const departments = await prisma.adminDepartmentDB.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: positions,
      departments,
      pagination: {
        totalItems: totalPositions,
        totalPages: Math.ceil(totalPositions / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลตำแหน่งสำเร็จ',
    });
  } catch (error) {
    console.error('Get admin positions error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง/แผนก',
    });
  }

}

// เพิ่ม: รองรับ priorityPositionId และเลื่อนลำดับให้ถูกต้อง
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, adminDepartmentId, priorityPositionId } = req.body as {
      name: string
      adminDepartmentId: string
      priorityPositionId?: string // id ของตำแหน่งอ้างอิง
    }

    if (!name?.trim() || !adminDepartmentId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      })
    }

    // กันชื่อซ้ำในแผนกเดียวกัน
    const dup = await prisma.adminPositionDB.findFirst({
      where: { name: name.trim(), adminDepartmentId, isDeleted: false },
      select: { id: true },
    })
    if (dup) {
      return res.status(400).json({
        success: false,
        error: 'ตำแหน่งนี้มีอยู่ในแผนกนี้แล้ว',
      })
    }

    const position = await prisma.$transaction(async (tx) => {
      let createdId: string

      if (priorityPositionId) {
        // เลือกอ้างอิง → newPriority = target.priority - 1 (ขั้นต่ำ 1)
        const target = await tx.adminPositionDB.findFirst({
          where: { id: priorityPositionId, adminDepartmentId, isDeleted: false },
          select: { priority: true },
        })
        if (!target) {
          throw new Error('NOT_FOUND_REF')
        }

        const newPriority = Math.max(1, (target.priority ?? 1) - 1)

        // ขยับของเดิมขึ้น 1 ตั้งแต่ newPriority ขึ้นไป
        await tx.adminPositionDB.updateMany({
          where: {
            adminDepartmentId,
            isDeleted: false,
            priority: { gte: newPriority },
          },
          data: { priority: { increment: 1 } },
        })

        const created = await tx.adminPositionDB.create({
          data: {
            name: name.trim(),
            adminDepartmentId,
            priority: newPriority,
            createdBy: 'system',
            updatedBy: 'system',
          },
        })
        createdId = created.id
      } else {
        // ไม่เลือกอ้างอิง → ต่อท้าย (max + 1)
        const maxRow = await tx.adminPositionDB.findFirst({
          where: { adminDepartmentId, isDeleted: false },
          orderBy: { priority: 'desc' },
          select: { priority: true },
        })
        const newPriority = (maxRow?.priority ?? 0) + 1

        const created = await tx.adminPositionDB.create({
          data: {
            name: name.trim(),
            adminDepartmentId,
            priority: newPriority,
            createdBy: 'system',
            updatedBy: 'system',
          },
        })
        createdId = created.id
      }

      // ❗ สำคัญ: รีซีเคว้นซ์ให้เป็น 1..N แบบติดกันเสมอ
      await resequenceDepartment(tx, adminDepartmentId)

      // ดึงค่าหลังรีซีเคว้นซ์ เพื่อได้ priority ล่าสุดที่ถูก normalize แล้ว
      const finalRow = await tx.adminPositionDB.findUnique({
        where: { id: createdId },
        include: { adminDepartment: true },
      })

      return finalRow!
    })

    return res.status(201).json({
      success: true,
      position,
      message: 'สร้างตำแหน่งสำเร็จ',
    })
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND_REF') {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบตำแหน่งอ้างอิงในแผนกนี้',
      })
    }
    console.error('Create admin position error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างตำแหน่ง',
    })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, adminDepartmentId: targetDeptId, priority } = req.body as {
      id: string
      name?: string
      adminDepartmentId: string        // แผนกปลายทาง (อาจเท่าเดิมหรือเปลี่ยนก็ได้)
      priority?: number                // ลำดับที่ต้องการในแผนกปลายทาง (1-based), ไม่ส่ง = ต่อท้าย
    }

    if (!id || !targetDeptId) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id และ adminDepartmentId' })
    }

    const current = await prisma.adminPositionDB.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, name: true, priority: true, adminDepartmentId: true },
    })
    if (!current) {
      return res.status(404).json({ success: false, error: 'ไม่พบตำแหน่ง' })
    }
    const oldDeptId = current.adminDepartmentId
    if (!oldDeptId) {
      return res.status(400).json({ success: false, error: 'ตำแหน่งนี้ไม่มีแผนกเดิม (adminDepartmentId เป็น null)' })
    }

    const nextName = typeof name === 'string' && name.trim() ? name.trim() : current.name
    const isChangingDepartment = oldDeptId !== targetDeptId

    // ชื่อต้องไม่ซ้ำใน "แผนกปลายทาง"
    const dup = await prisma.adminPositionDB.findFirst({
      where: {
        adminDepartmentId: targetDeptId,
        name: nextName,
        isDeleted: false,
        id: { not: id },
      },
      select: { id: true },
    })
    if (dup) {
      return res.status(400).json({ success: false, error: 'ชื่อตำแหน่งซ้ำในแผนกปลายทาง' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      // กันชน unique([adminDepartmentId, priority]) ก่อนปรับ
      if (isChangingDepartment) {
        await bumpDepartment(tx, oldDeptId)
        await bumpDepartment(tx, targetDeptId)

        // คำนวณ priority ใหม่ในแผนกปลายทาง (clamp 1..max+1)
        const maxRow = await tx.adminPositionDB.findFirst({
          where: { adminDepartmentId: targetDeptId, isDeleted: false },
          orderBy: { priority: 'desc' },
          select: { priority: true },
        })
        const maxPlusOne = (maxRow?.priority ?? 0) + 1
        const newPriority = typeof priority === 'number' ? clampPriority(priority, maxPlusOne) : maxPlusOne

        // ย้ายแผนก + ตั้งชื่อ/ลำดับใหม่
        await tx.adminPositionDB.update({
          where: { id },
          data: {
            name: nextName,
            adminDepartmentId: targetDeptId,
            priority: newPriority,
            updatedBy: 'system',
          },
        })

        // จัดลำดับทั้งสองแผนก
        await resequenceDepartment(tx, oldDeptId)
        await resequenceDepartment(tx, targetDeptId)
      } else {
        // ยังอยู่แผนกเดิม
        await bumpDepartment(tx, targetDeptId)

        if (typeof priority === 'number') {
          const maxRow = await tx.adminPositionDB.findFirst({
            where: { adminDepartmentId: targetDeptId, isDeleted: false },
            orderBy: { priority: 'desc' },
            select: { priority: true },
          })
          const maxPlusOne = (maxRow?.priority ?? 0) + 1
          const newPriority = clampPriority(priority, maxPlusOne)

          await tx.adminPositionDB.update({
            where: { id },
            data: {
              name: nextName,
              priority: newPriority,
              updatedBy: 'system',
            },
          })
        } else {
          // ไม่เปลี่ยนลำดับ → อัปเดตเฉพาะชื่อ (ถ้ามี)
          if (nextName !== current.name) {
            await tx.adminPositionDB.update({
              where: { id },
              data: { name: nextName, updatedBy: 'system' },
            })
          }
        }

        await resequenceDepartment(tx, targetDeptId)
      }

      return await tx.adminPositionDB.findUnique({
        where: { id },
        include: { adminDepartment: true },
      })
    })

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'แก้ไขตำแหน่งสำเร็จ',
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'ข้อมูลซ้ำ (unique)' })
    }
    console.error('PUT admin-positions (move) error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง' })
  }
}


async function handleDelete(req: NextApiRequest, res: NextApiResponse<AdminPositionResponse>) {
  try {
    const { id } = req.body as { id: string };
    if (!id) return res.status(400).json({ success: false, error: 'กรุณาระบุ id' });

    const existing = await prisma.adminPositionDB.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบตำแหน่งที่ต้องการลบ' });
    }
    const deptId = existing.adminDepartmentId!;
    if (!deptId) {
      return res.status(400).json({ success: false, error: 'ตำแหน่งนี้ไม่มีแผนก (adminDepartmentId เป็น null)' });
    }

    // ป้องกันการลบถ้ามีผู้ดูแลระบบใช้งานอยู่ (เอาออกได้ถ้าอยาก force delete)
    const inUse = await prisma.adminDB.findFirst({
      where: { adminPositionId: id, isDeleted: false },
      select: { id: true },
    });
    if (inUse) {
      return res.status(400).json({ success: false, error: 'มีผู้ดูแลระบบใช้งานตำแหน่งนี้อยู่ ไม่สามารถลบได้' });
    }

    await prisma.$transaction(async (tx) => {
      // ก่อน resequence ต้อง soft delete ก่อนเพื่อให้ unique constraint ไม่ชน
      await tx.adminPositionDB.update({
        where: { id },
        data: { isDeleted: true, updatedBy: 'system' },
      });

      // จัดลำดับใหม่ (จะไม่รวม record ที่ isDeleted = true)
      await resequenceDepartment(tx, deptId);
    });

    return res.status(200).json({ success: true, message: 'ลบตำแหน่งสำเร็จ' });
  } catch (error) {
    console.error('DELETE admin-positions error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลบตำแหน่ง' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AdminPositionResponse>) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Admin positions API error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
  }
} 
