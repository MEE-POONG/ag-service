import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { Prisma } from '@prisma/client'

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', pageSize = '10', keyword = '', search = '', status = '' } = req.query;

    // ใช้ `page` และ `pageSize` สำหรับ Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // เงื่อนไขการค้นหา
    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.UserDBWhereInput = {

      ...(status && status !== 'all' ? { isActive: status === 'active' } : {}),
      ...(searchKeyword ? {
        OR: [
          { username: { contains: searchKeyword, mode: 'insensitive' } },
          { firstname: { contains: searchKeyword, mode: 'insensitive' } },
          { lastname: { contains: searchKeyword, mode: 'insensitive' } },
          { email: { contains: searchKeyword, mode: 'insensitive' } }
        ]
      } : {})
    };

    // ดึงข้อมูล Users พร้อม Pagination
    const [users, totalUsers] = await Promise.all([
      prisma.userDB.findMany({
        where: whereClause,
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          firstname: true,
          lastname: true,
          email: true,
          tel: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.userDB.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ'
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    try {
      const { username, password, firstname, lastname, email, tel } = req.body
      if (!username || !password || !firstname || !lastname || !email) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' })
      }
      const existingUser = await prisma.userDB.findFirst({
        where: {
          OR: [{ username }, { email }],

        },
      })
      if (existingUser) {
        return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' })
      }
      const hashedPassword = await hashPassword(password)
      const user = await prisma.userDB.create({
        data: {
          username,
          password: hashedPassword,
          firstname,
          lastname,
          email,
          tel,
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          isDeleted: false,
        },
      })
      return res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          tel: user.tel,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        message: 'สร้างผู้ใช้สำเร็จ',
      })
    } catch (error) {
      console.error('Create user error:', error)
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, firstname, lastname, email, tel, isActive } = req.body
      if (!id) return res.status(400).json({ error: 'ไม่พบ id' })
      const user = await prisma.userDB.update({
        where: { id },
        data: {
          firstname,
          lastname,
          email,
          tel,
          isActive,
          updatedBy: 'system',
        },
      })
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          tel: user.tel,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        message: 'อัปเดตผู้ใช้สำเร็จ',
      })
    } catch (error) {
      console.error('Update user error:', error)
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'ไม่พบ id' })
      await prisma.userDB.update({
        where: { id },
        data: { updatedBy: 'system' },
      })
      return res.status(200).json({ message: 'ลบผู้ใช้สำเร็จ' })
    } catch (error) {
      console.error('Delete user error:', error)
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
} 
