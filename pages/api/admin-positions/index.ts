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
    const { id, name, adminDepartmentId, priorityPositionId } = req.body as {
      id: string
      name: string
      adminDepartmentId: string
      priorityPositionId?: string // id ของตำแหน่งอ้างอิงในแผนกปลายทาง
    }

    if (!id || !name?.trim() || !adminDepartmentId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      })
    }

    // ตรวจสอบว่าตำแหน่งที่จะแก้ไขมีอยู่จริง
    const currentPosition = await prisma.adminPositionDB.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, name: true, adminDepartmentId: true, priority: true },
    })

    if (!currentPosition) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบตำแหน่งที่ต้องการแก้ไข',
      })
    }

    // กันชื่อซ้ำในแผนกปลายทาง (ยกเว้นตัวเอง)
    const dup = await prisma.adminPositionDB.findFirst({
      where: { 
        name: name.trim(), 
        adminDepartmentId, 
        isDeleted: false,
        id: { not: id } // ยกเว้นตัวเอง
      },
      select: { id: true },
    })
    if (dup) {
      return res.status(400).json({
        success: false,
        error: 'ตำแหน่งนี้มีอยู่ในแผนกปลายทางแล้ว',
      })
    }

    const position = await prisma.$transaction(async (tx) => {
      const oldDepartmentId = currentPosition.adminDepartmentId
      const isChangingDepartment = oldDepartmentId !== adminDepartmentId

      if (isChangingDepartment) {
        // ย้ายแผนก: ลบออกจากแผนกเดิม แล้วไปต่อท้ายหรือแทรกในแผนกใหม่
        
        // 1. ลบออกจากแผนกเดิม (ปรับ priority ของที่เหลือ)
        await tx.adminPositionDB.updateMany({
          where: {
            adminDepartmentId: oldDepartmentId,
            isDeleted: false,
            priority: { gt: currentPosition.priority },
          },
          data: { priority: { decrement: 1 } },
        })
        
        // 2. แทรกในแผนกใหม่
        let newPriority: number

        if (priorityPositionId) {
          // เลือกอ้างอิง → newPriority = target.priority - 1 (ขั้นต่ำ 1)
          const target = await tx.adminPositionDB.findFirst({
            where: { id: priorityPositionId, adminDepartmentId, isDeleted: false },
            select: { priority: true },
          })
          if (!target) {
            throw new Error('NOT_FOUND_REF')
          }

          newPriority = Math.max(1, (target.priority ?? 1) - 1)

          // ขยับของเดิมขึ้น 1 ตั้งแต่ newPriority ขึ้นไป
          await tx.adminPositionDB.updateMany({
            where: {
              adminDepartmentId,
              isDeleted: false,
              priority: { gte: newPriority },
            },
            data: { priority: { increment: 1 } },
          })
        } else {
          // ไม่เลือกอ้างอิง → ต่อท้าย (max + 1)
          const maxRow = await tx.adminPositionDB.findFirst({
            where: { adminDepartmentId, isDeleted: false },
            orderBy: { priority: 'desc' },
            select: { priority: true },
          })
          newPriority = (maxRow?.priority ?? 0) + 1
        }

        // อัพเดทตำแหน่งนี้
        await tx.adminPositionDB.update({
          where: { id },
          data: {
            name: name.trim(),
            adminDepartmentId,
            priority: newPriority,
            updatedBy: 'system',
          },
        })

        // รีซีเคว้นซ์ทั้ง 2 แผนก
        await resequenceDepartment(tx, oldDepartmentId!)
        await resequenceDepartment(tx, adminDepartmentId)

      } else {
        // แผนกเดิม: แค่ปรับ priority หรือชื่อ
        
        if (priorityPositionId && priorityPositionId !== id) {
          // มีการเลือกอ้างอิง และไม่ใช่ตัวเอง
          const target = await tx.adminPositionDB.findFirst({
            where: { id: priorityPositionId, adminDepartmentId, isDeleted: false },
            select: { priority: true },
          })
          if (!target) {
            throw new Error('NOT_FOUND_REF')
          }

          const newPriority = Math.max(1, (target.priority ?? 1) - 1)
          const oldPriority = currentPosition.priority

          if (newPriority !== oldPriority) {
            // ขยับของเดิมขึ้น 1 ตั้งแต่ newPriority ขึ้นไป (ยกเว้นตัวเอง)
            await tx.adminPositionDB.updateMany({
              where: {
                adminDepartmentId,
                isDeleted: false,
                priority: { gte: newPriority },
                id: { not: id },
              },
              data: { priority: { increment: 1 } },
            })

            // ปรับตัวเองให้เป็น newPriority
            await tx.adminPositionDB.update({
              where: { id },
              data: {
                name: name.trim(),
                priority: newPriority,
                updatedBy: 'system',
              },
            })

            // รีซีเคว้นซ์แผนกนี้
            await resequenceDepartment(tx, adminDepartmentId)
          } else {
            // priority ไม่เปลี่ยน แค่อัพเดทชื่อ
            await tx.adminPositionDB.update({
              where: { id },
              data: {
                name: name.trim(),
                updatedBy: 'system',
              },
            })
          }
        } else {
          // ไม่เลือกอ้างอิง หรือเลือกตัวเอง → แค่อัพเดทชื่อ
          await tx.adminPositionDB.update({
            where: { id },
            data: {
              name: name.trim(),
              updatedBy: 'system',
            },
          })
        }
      }

      // ดึงค่าล่าสุดหลังการอัพเดท
      const finalRow = await tx.adminPositionDB.findUnique({
        where: { id },
        include: { adminDepartment: true },
      })

      return finalRow!
    })

    return res.status(200).json({
      success: true,
      position,
      message: 'แก้ไขตำแหน่งสำเร็จ',
    })
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND_REF') {
      return res.status(400).json({ success: false, error: 'ไม่พบตำแหน่งอ้างอิงในแผนกปลายทาง' })
    }
    console.error('Update admin position error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง' })
  }
}


async function handleDelete(req: NextApiRequest, res: NextApiResponse<AdminPositionResponse>) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ไม่พบ ID' });
    }

    // ตรวจว่ามีตำแหน่งนี้จริงไหม (เอา adminDepartmentId มาด้วย)
    const existingPosition = await prisma.adminPositionDB.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, adminDepartmentId: true, priority: true },
    });

    if (!existingPosition) {
      return res.status(404).json({ success: false, error: 'ไม่พบตำแหน่งที่ต้องการลบ' });
    }

    // มีใครใช้อยู่ไหม
    const adminsUsingPosition = await prisma.adminDB.findFirst({
      where: { adminPositionId: id, isDeleted: false },
      select: { id: true },
    });

    if (adminsUsingPosition) {
      return res.status(400).json({
        success: false,
        error: 'ไม่สามารถลบตำแหน่งที่มีผู้ดูแลระบบใช้งานอยู่ได้',
      });
    }

    // ลบ + resequence ในทรานแซกชันเดียว (atomic)
    await prisma.$transaction(async (tx) => {
      // soft delete
      await tx.adminPositionDB.update({
        where: { id },
        data: { isDeleted: true, updatedBy: 'system' },
      });

      // จัดลำดับใหม่ในแผนกเดียวกันให้เป็น 1..N
      if (existingPosition.adminDepartmentId) {
        await resequenceDepartment(tx, existingPosition.adminDepartmentId);
      }
    });

    return res.status(200).json({ success: true, message: 'ลบตำแหน่งสำเร็จ' });
  } catch (error) {
    console.error('Delete admin position error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบตำแหน่ง',
    });
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
