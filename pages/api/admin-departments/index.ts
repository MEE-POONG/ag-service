import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth, hasPermission } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'
import { serializeBigIntToString } from '@/lib/bigintUtils'

interface DepartmentResponse {
  success?: boolean;
  data?: any;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  department?: any;
  error?: string;
  message?: string;
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
  // Check authentication and permissions
  // const currentAdmin = await requireAuth(req, res)
  // if (!currentAdmin) return

  // Check if user can view departments
  // if (!await hasPermission(req, 'department-management', 'canViews')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์ดูข้อมูลแผนก'
  //   })
  // }

  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      search = '',
      status = '',
      id = ''
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // ถ้าระบุ id ให้ค้นหาเฉพาะ id
    if (id) {
      const department = await prisma.adminDepartmentDB.findUnique({
        where: { id: id as string },
        include: {
          adminPositions: {
            where: {  },
            orderBy: [
              { priority: 'asc' },      // เรียงตาม priority
              { createdAt: 'asc' },     // tie-breaker กันค่า priority เท่ากัน
            ],
          },
        },
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบข้อมูลแผนกที่ต้องการ',
        });
      }

      return res.status(200).json(serializeBigIntToString({
        success: true,
        data: department,
        message: 'ดึงข้อมูลแผนกสำเร็จ',
      }));
    }

    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.AdminDepartmentDBWhereInput = {
      
      ...(status && status !== 'all' ? { isActive: status === 'active' } : {}),
      ...(searchKeyword
        ? {
          OR: [
            { name: { contains: searchKeyword, mode: 'insensitive' } },
            { description: { contains: searchKeyword, mode: 'insensitive' } },
          ],
        }
        : {}),
    };

    const [departments, totalDepartments] = await Promise.all([
      prisma.adminDepartmentDB.findMany({
        where: whereClause,
        include: {
          adminPositions: {
            where: {  },
            orderBy: [{ priority: 'asc' }],
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminDepartmentDB.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      data: departments,
      pagination: {
        totalItems: totalDepartments,
        totalPages: Math.ceil(totalDepartments / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลแผนกสำเร็จ',
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนก',
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
  // Check authentication and permissions
  // const currentAdmin = await requireAuth(req, res)
  // if (!currentAdmin) return

  // Check if user can create departments
  // if (!await hasPermission(req, 'department-management', 'canCreate')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์สร้างแผนกใหม่'
  //   })
  // }

  try {
    const { name, description, isActive, createdBy, updatedBy } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกชื่อแผนก' });
    }

    const exists = await prisma.adminDepartmentDB.findFirst({
      where: { name,  },
    });
    if (exists) {
      return res.status(400).json({ success: false, error: 'มีชื่อแผนกนี้อยู่แล้ว' });
    }

    const department = await prisma.$transaction(async (tx) => {
      const newDept = await tx.adminDepartmentDB.create({
        data: {
          name,
          description,
          isActive: typeof isActive === 'boolean' ? isActive : true,
          isDeleted: false,
          createdAt: new Date(),
          createdBy: createdBy || 'system',
          updatedAt: new Date(),
          updatedBy: updatedBy || 'system',
        },
      });

      // บันทึกประวัติ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminDepartmentDB',
        newDept.id,
        'CREATE',
        null,
        newDept,
        createdBy || 'system',
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return newDept;
    });

    return res.status(201).json({ success: true, department, message: 'สร้างแผนกสำเร็จ' });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างแผนก' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
  // Check authentication and permissions
  // const currentAdmin = await requireAuth(req, res)
  // if (!currentAdmin) return

  // Check if user can update departments
  // if (!await hasPermission(req, 'department-management', 'canUpdate')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์แก้ไขข้อมูลแผนก'
  //   })
  // }

  try {
    const { id, name, description, isActive, updatedBy } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ไม่พบ ID' });

    const existing = await prisma.adminDepartmentDB.findFirst({ where: { id,  } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบแผนกที่ต้องการแก้ไข' });
    }

    // unique name check if provided and changed
    if (name && name !== existing.name) {
      const duplicate = await prisma.adminDepartmentDB.findFirst({
        where: { name,  },
      });
      if (duplicate) {
        return res.status(400).json({ success: false, error: 'มีชื่อแผนกนี้อยู่แล้ว' });
      }
    }

    const department = await prisma.$transaction(async (tx) => {
      const updatedDept = await tx.adminDepartmentDB.update({
        where: { id },
        data: {
          name,
          description,
          isActive,
          updatedBy: updatedBy || 'system',
        },
      });

      // บันทึกประวัติ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminDepartmentDB',
        id,
        'UPDATE',
        existing,
        updatedDept,
        updatedBy || 'system',
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return updatedDept;
    });

    return res.status(200).json({ success: true, department, message: 'อัปเดตแผนกสำเร็จ' });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตแผนก' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
  // Check authentication and permissions
  // const currentAdmin = await requireAuth(req, res)
  // if (!currentAdmin) return

  // Check if user can delete departments
  // if (!await hasPermission(req, 'department-management', 'canDelete')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์ลบแผนก'
  //   })
  // }

  try {
    const { id, deletedBy } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ไม่พบ ID' });

    const existing = await prisma.adminDepartmentDB.findFirst({ 
      where: { id },
      include: { adminPositions: true }
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบแผนกที่ต้องการลบ' });
    }

    // Prevent delete if has positions (optional)
    const hasPositions = await prisma.adminPositionDB.findFirst({
      where: { adminDepartmentId: id },
    });
    if (hasPositions) {
      return res.status(400).json({ success: false, error: 'ไม่สามารถลบแผนกที่มีตำแหน่งใช้งานอยู่ได้' });
    }

    await prisma.$transaction(async (tx) => {
      // บันทึกประวัติก่อนลบ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminDepartmentDB',
        id,
        'DELETE',
        existing,
        null,
        deletedBy || 'system',
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      // Hard delete - ลบจริงออกจากฐานข้อมูล
      await tx.adminDepartmentDB.delete({
        where: { id },
      });
    });

    return res.status(200).json({ success: true, message: 'ลบแผนกสำเร็จ' });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลบแผนก' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
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
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Departments API error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}


