import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils';
import { serializeBigIntToNumber } from '@/lib/bigintUtils';

type PositionRow = {
  id: string;
  name: string;
  description?: string | null;
  priority: number;
  adminDepartmentId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ApiResp<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

// ---------- Helpers ----------

// ดัน priority ของทั้งแผนกขึ้นเพื่อกันชน unique([adminDepartmentId, priority])
async function bumpDepartment(
  tx: Prisma.TransactionClient,
  adminDepartmentId: string
) {
  await tx.adminPositionDB.updateMany({
    where: { adminDepartmentId },
    data: { priority: { increment: 1000 } },
  });
}


// จัดลำดับใหม่ให้เป็น 1..N เรียงตาม priority เดิม -> createdAt -> id (กันชนซ้ำ)
async function resequenceDepartment(
  tx: Prisma.TransactionClient,
  adminDepartmentId: string
) {
  const rows = await tx.adminPositionDB.findMany({
    where: { adminDepartmentId },
    orderBy: [
      { priority: 'asc' },
      { createdAt: 'asc' },
      { id: 'asc' },
    ],
    select: { id: true },
  });

  for (let i = 0; i < rows.length; i++) {
    await tx.adminPositionDB.update({
      where: { id: rows[i].id },
      data: { priority: i + 1 },
    });
  }
}

function clampPriority(desired: number, maxPlusOne: number) {
  if (!Number.isFinite(desired) || desired <= 0) return 1;
  if (desired > maxPlusOne) return maxPlusOne;
  return Math.floor(desired);
}

// ---------- Handlers ----------

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      adminDepartmentId = '',
      id = '',
    } = req.query;

    // ดึงตัวเดียวโดย id
    if (id) {
      const row = await prisma.adminPositionDB.findFirst({
        where: { id: String(id) },
        include: { adminDepartment: true },
      });
      if (!row) {
        return res.status(404).json({ success: false, error: 'ไม่พบตำแหน่ง' });
      }
      return res.status(200).json({ success: true, data: serializeBigIntToNumber(row) });
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const pageSizeNum = parseInt(String(pageSize), 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    const where: Prisma.AdminPositionDBWhereInput = {
      ...(adminDepartmentId ? { adminDepartmentId: String(adminDepartmentId) } : {}),
      ...(keyword
        ? {
          OR: [
            { name: { contains: String(keyword), mode: 'insensitive' } },
            { adminDepartment: { name: { contains: String(keyword), mode: 'insensitive' } } },
          ],
        }
        : {}),
    };

    const [positions, total] = await Promise.all([
      prisma.adminPositionDB.findMany({
        where,
        orderBy: [{ priority: 'asc' }],
        skip,
        take: pageSizeNum,
        include: { adminDepartment: true },
      }),
      prisma.adminPositionDB.count({ where }),
    ]);
    const depMap = new Map<string, { id: string; name: string }>();
    for (const it of positions) {
      const dep = it.adminDepartment;
      if (dep?.id) {
        depMap.set(dep.id, { id: dep.id, name: dep.name });
      }
    }
    const departments = Array.from(depMap.values());

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber({
        positions,
        departments,
      }),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
    });
  } catch (error) {
    console.error('GET admin-positions error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { name, adminDepartmentId, priority, createdBy } = req.body as {
      name: string;
      adminDepartmentId: string;
      priority?: number; // แทรกที่ลำดับนี้ (1-based), ถ้าไม่ส่ง = ต่อท้าย
      createdBy: string;
    };

    if (!name?.trim() || !adminDepartmentId) {
      return res.status(400).json({ success: false, error: 'กรุณากรอก name และ adminDepartmentId' });
    }

    // กันชื่อซ้ำในแผนกเดียวกัน
    const dup = await prisma.adminPositionDB.findFirst({
      where: { name: name.trim(), adminDepartmentId },
      select: { id: true },
    });
    console.log(`name : `, name);
    console.log(`adminDepartmentId : `, adminDepartmentId);
    console.log(`dup : `, dup);

    if (dup) {
      return res.status(400).json({ success: false, error: 'ชื่อตำแหน่งซ้ำในแผนกนี้' });
    }

    const created = await prisma.$transaction(async (tx) => {
      // กันชน
      await bumpDepartment(tx, adminDepartmentId);

      // หา max เพื่อตัดสินใจว่าจะต่อท้าย หรือแทรก
      const maxRow = await tx.adminPositionDB.findFirst({
        where: { adminDepartmentId },
        orderBy: { priority: 'desc' },
        select: { priority: true },
      });
      const maxPlusOne = Number(maxRow?.priority ?? 0) + 1;

      const insertPriority =
        typeof priority === 'number'
          ? clampPriority(priority, maxPlusOne)
          : maxPlusOne;

      console.log(`insertPriority : `, insertPriority);

      // สร้าง
      const row = await tx.adminPositionDB.create({
        data: {
          name: name.trim(),
          adminDepartmentId,
          priority: insertPriority,
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          createdBy: createdBy,
          updatedAt: new Date(),
          updatedBy: createdBy,
        },
        include: { adminDepartment: true },
      });
      console.log(`row : `, row);

      // จัดลำดับ 1..N
      await resequenceDepartment(tx, adminDepartmentId);

      // ดึงผลลัพธ์ล่าสุด
      const finalRow = await tx.adminPositionDB.findUnique({
        where: { id: row.id },
        include: { adminDepartment: true },
      });

      // บันทึกประวัติ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminPositionDB',
        row.id,
        'CREATE',
        null,
        finalRow,
        createdBy,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return finalRow!;
    });

    return res.status(201).json({
      success: true,
      data: serializeBigIntToNumber(created),
      message: 'สร้างตำแหน่งสำเร็จ',
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      // unique key violation
      return res.status(400).json({ success: false, error: 'ข้อมูลซ้ำ (unique)' });
    }
    console.error('POST admin-positions error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างตำแหน่ง' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, adminDepartmentId: targetDeptId, priority, updatedBy = 'system' } = req.body as {
      id: string
      name?: string
      adminDepartmentId: string        // แผนกปลายทาง (อาจเท่าเดิมหรือเปลี่ยนก็ได้)
      priority?: number                // ลำดับที่ต้องการในแผนกปลายทาง (1-based), ไม่ส่ง = ต่อท้าย
      updatedBy?: string
    }

    if (!id || !targetDeptId) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id และ adminDepartmentId' })
    }

    const current = await prisma.adminPositionDB.findFirst({
      where: { id },
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
          where: { adminDepartmentId: targetDeptId },
          orderBy: { priority: 'desc' },
          select: { priority: true },
        })
        const maxPlusOne = Number(maxRow?.priority ?? 0) + 1
        const newPriority =
          typeof priority === 'number' ? clampPriority(priority, maxPlusOne) : maxPlusOne

        // ย้ายแผนก + ตั้งชื่อ/ลำดับใหม่
        await tx.adminPositionDB.update({
          where: { id },
          data: {
            name: nextName,
            adminDepartmentId: targetDeptId,
            priority: newPriority,
            updatedBy,
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
            where: { adminDepartmentId: targetDeptId },
            orderBy: { priority: 'desc' },
            select: { priority: true },
          })
          const maxPlusOne = Number(maxRow?.priority ?? 0) + 1
          const newPriority = clampPriority(priority, maxPlusOne)

          await tx.adminPositionDB.update({
            where: { id },
            data: {
              name: nextName,
              priority: newPriority,
              updatedBy,
            },
          })
        } else {
          // ไม่เปลี่ยนลำดับ → อัปเดตเฉพาะชื่อ (ถ้ามี)
          if (nextName !== current.name) {
            await tx.adminPositionDB.update({
              where: { id },
              data: { name: nextName, updatedBy },
            })
          }
        }

        await resequenceDepartment(tx, targetDeptId)
      }

      const updatedRecord = await tx.adminPositionDB.findUnique({
        where: { id },
        include: { adminDepartment: true },
      });

      // บันทึกประวัติ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminPositionDB',
        id,
        'UPDATE',
        current,
        updatedRecord,
        updatedBy,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return updatedRecord;
    })

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber(updated),
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


async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { id, deletedBy = 'system' } = req.body as { id: string; deletedBy?: string };
    if (!id) return res.status(400).json({ success: false, error: 'กรุณาระบุ id' });

    const existing = await prisma.adminPositionDB.findFirst({
      where: { id },
      include: { adminDepartment: true },
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
      where: { adminPositionId: id },
      select: { id: true },
    });
    if (inUse) {
      return res.status(400).json({ success: false, error: 'มีผู้ดูแลระบบใช้งานตำแหน่งนี้อยู่ ไม่สามารถลบได้' });
    }

    await prisma.$transaction(async (tx) => {
      // บันทึกประวัติก่อนลบ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminPositionDB',
        id,
        'DELETE',
        existing,
        null,
        deletedBy,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      // Hard delete - ลบจริงออกจากฐานข้อมูล
      await tx.adminPositionDB.delete({
        where: { id },
      });

      // จัดลำดับใหม่
      await resequenceDepartment(tx, deptId);
    });

    return res.status(200).json({ success: true, message: 'ลบตำแหน่งสำเร็จ' });
  } catch (error) {
    console.error('DELETE admin-positions error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลบตำแหน่ง' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
