import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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
            where: { isDeleted: false },
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

      return res.status(200).json({
        success: true,
        data: department,
        message: 'ดึงข้อมูลแผนกสำเร็จ',
      });
    }

    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.AdminDepartmentDBWhereInput = {
      isDeleted: false,
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
            where: { isDeleted: false },
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
  try {
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกชื่อแผนก' });
    }

    const exists = await prisma.adminDepartmentDB.findFirst({
      where: { name, isDeleted: false },
    });
    if (exists) {
      return res.status(400).json({ success: false, error: 'มีชื่อแผนกนี้อยู่แล้ว' });
    }

    const department = await prisma.adminDepartmentDB.create({
      data: {
        name,
        description,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        createdBy: 'system',
        updatedBy: 'system',
      },
    });

    return res.status(201).json({ success: true, department, message: 'สร้างแผนกสำเร็จ' });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างแผนก' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
  try {
    const { id, name, description, isActive } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ไม่พบ ID' });

    const existing = await prisma.adminDepartmentDB.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบแผนกที่ต้องการแก้ไข' });
    }

    // unique name check if provided and changed
    if (name && name !== existing.name) {
      const duplicate = await prisma.adminDepartmentDB.findFirst({
        where: { name, isDeleted: false },
      });
      if (duplicate) {
        return res.status(400).json({ success: false, error: 'มีชื่อแผนกนี้อยู่แล้ว' });
      }
    }

    const department = await prisma.adminDepartmentDB.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        updatedBy: 'system',
      },
    });

    return res.status(200).json({ success: true, department, message: 'อัปเดตแผนกสำเร็จ' });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตแผนก' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<DepartmentResponse>) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ไม่พบ ID' });

    const existing = await prisma.adminDepartmentDB.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบแผนกที่ต้องการลบ' });
    }

    // Prevent delete if has positions (optional)
    const hasPositions = await prisma.adminPositionDB.findFirst({
      where: { adminDepartmentId: id, isDeleted: false },
    });
    if (hasPositions) {
      return res.status(400).json({ success: false, error: 'ไม่สามารถลบแผนกที่มีตำแหน่งใช้งานอยู่ได้' });
    }

    await prisma.adminDepartmentDB.update({
      where: { id },
      data: { isDeleted: true, updatedBy: 'system' },
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


