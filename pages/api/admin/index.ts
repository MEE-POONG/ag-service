import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { Prisma } from '@prisma/client'

interface AdminResponse {
  success?: boolean;
  data?: any;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  admin?: any;
  error?: string;
  message?: string;
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  try {
    const { page = '1', pageSize = '10', keyword = '', search = '', status = '', id = '' } = req.query;

    // ถ้ามี id ให้ดึงข้อมูลรายบุคคล
    if (id) {
      const admin = await prisma.adminDB.findFirst({
        where: {
          id: id as string,
          isDeleted: false,
        },
        include: {
          adminPosition: {
            include: {
              adminDepartment: true,
            },
          },
        },
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบข้อมูล Admin ที่ต้องการ',
        });
      }

      return res.status(200).json({
        success: true,
        data: admin,
        message: 'ดึงข้อมูล Admin สำเร็จ',
      });
    }

    // ใช้ `page` และ `pageSize` สำหรับ Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // เงื่อนไขการค้นหา
    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.AdminDBWhereInput = {
      isDeleted: false,
      ...(status && status !== 'all' ? { isActive: status === 'active' } : {}),
      ...(searchKeyword ? {
        OR: [
          { username: { contains: searchKeyword, mode: 'insensitive' } },
          { name: { contains: searchKeyword, mode: 'insensitive' } },
          { email: { contains: searchKeyword, mode: 'insensitive' } },
          { adminPosition: { name: { contains: searchKeyword, mode: 'insensitive' } } },
          { adminPosition: { adminDepartment: { name: { contains: searchKeyword, mode: 'insensitive' } } } }
        ]
      } : {})
    };

    // ดึงข้อมูล Admin พร้อม Pagination
    const [admins, totalAdmins] = await Promise.all([
      prisma.adminDB.findMany({
        where: whereClause,
        include: {
          adminPosition: {
            include: {
              adminDepartment: true,
            },
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminDB.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      data: admins,
      pagination: {
        totalItems: totalAdmins,
        totalPages: Math.ceil(totalAdmins / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลผู้ดูแลระบบสำเร็จ'
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ' 
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  try {
    const { username, password, name, email, tel, adminPositionId } = req.body;
    
    // Validation
    if (!username || !password || !name || !email || !adminPositionId) {
      return res.status(400).json({ 
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' 
      });
    }

    // Check for existing admin
    const existing = await prisma.adminDB.findFirst({
      where: { 
        OR: [{ username }, { email }], 
        isDeleted: false 
      },
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' 
      });
    }

    // Create admin
    const hashedPassword = await hashPassword(password);
    const admin = await prisma.adminDB.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
        tel,
        adminPositionId,
        createdBy: 'system',
        updatedBy: 'system',
      },
      include: {
        adminPosition: { 
          include: { adminDepartment: true } 
        },
      },
    });

    return res.status(201).json({ 
      success: true,
      admin, 
      message: 'สร้างผู้ดูแลระบบสำเร็จ' 
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างผู้ดูแลระบบ' 
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  try {
    const { id, username, name, email, tel, adminPositionId, isActive, updatedBy } = req.body;
    

    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ไม่พบ ID' 
      });
    }

    // Check if admin exists
    const existingAdmin = await prisma.adminDB.findFirst({
      where: { id, isDeleted: false }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ดูแลระบบที่ต้องการแก้ไข'
      });
    }

    // Check for duplicate username/email (excluding current admin)
    if (username && username !== existingAdmin.username) {
      const duplicateUsername = await prisma.adminDB.findFirst({
        where: { 
          username, 
          isDeleted: false,
          id: { not: id }
        }
      });
      
      if (duplicateUsername) {
        return res.status(400).json({
          success: false,
          error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
        });
      }
    }

    if (email && email !== existingAdmin.email) {
      const duplicateEmail = await prisma.adminDB.findFirst({
        where: { 
          email, 
          isDeleted: false,
          id: { not: id }
        }
      });
      
      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          error: 'อีเมลนี้มีอยู่ในระบบแล้ว'
        });
      }
    }

    // Update admin
    const admin = await prisma.adminDB.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(name && { name }),
        ...(email && { email }),
        ...(tel !== undefined && { tel }),
        ...(adminPositionId && { adminPositionId }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: updatedBy || 'system',
        updatedAt: new Date(),
      },
      include: {
        adminPosition: { 
          include: { adminDepartment: true } 
        },
      },
    });



    return res.status(200).json({ 
      success: true,
      data: admin, // เปลี่ยนจาก admin เป็น data เพื่อความสอดคล้อง
      message: 'อัปเดตผู้ดูแลระบบสำเร็จ' 
    });
  } catch (error) {
    console.error('Update admin error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตผู้ดูแลระบบ' 
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ไม่พบ ID' 
      });
    }

    // Check if admin exists
    const existingAdmin = await prisma.adminDB.findFirst({
      where: { id, isDeleted: false }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ดูแลระบบที่ต้องการลบ'
      });
    }

    // Soft delete
    await prisma.adminDB.update({
      where: { id },
      data: { 
        isDeleted: true, 
        updatedBy: 'system' 
      },
    });

    return res.status(200).json({ 
      success: true,
      message: 'ลบผู้ดูแลระบบสำเร็จ' 
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ' 
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
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
    console.error('Admins API error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
  }
} 
