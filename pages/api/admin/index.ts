  import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword, sanitizeAdminForClient } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { requireAuth, hasPermission } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'
import { serializeBigIntToString } from '@/lib/bigintUtils'
import {
  isPermanentSuperAdminEmail,
  isValidEmail,
  normalizeEmail,
} from '@/lib/adminIdentity'
import { assertEmailDeliveryConfigured } from '@/lib/accountEmail'
import { sendVerificationForAdmin } from '@/lib/adminAuthTokens'
import {
  isPendingRegistrationPosition,
  REGISTRATION_STATUSES,
} from '@/lib/registration'

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
  // Check authentication and permissions
  const admin = await requireAuth(req, res)
  if (!admin) return

  // Check if user can view admin data
  // if (!await hasPermission(req, 'admin-management', 'canViews')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์ดูข้อมูลผู้ดูแลระบบ'
  //   })
  // }

  try {
    const { page = '1', pageSize = '10', keyword = '', search = '', status = '', id = '' } = req.query;

    // ถ้ามี id ให้ดึงข้อมูลรายบุคคล
    if (id) {
      // 1) กันเคส id ไม่ใช่ ObjectId (ถ้าใช้ Mongo)
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'รูปแบบ id ไม่ถูกต้อง' })
      }

      // 2) ใช้ findUnique + SELECT เฉพาะฟิลด์ที่ฟอร์มต้องใช้
      const admin = await prisma.adminDB.findUnique({
        where: { id: String(id) },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          emailVerifiedAt: true,
          tel: true,
          isActive: true,
          registrationStatus: true,
          adminPositionId: true,      // ให้ฟอร์มรู้ตำแหน่งเดิม
          // ❌ ไม่ select password/passwordHash เพื่อความปลอดภัย + ลด payload
          adminPosition: {
            select: {
              id: true,
              name: true,
              priority: true,
              adminDepartmentId: true,
              adminDepartment: {
                select: { id: true, name: true }, // ดึงเฉพาะที่ใช้โชว์/derive
              },
            },
          },
        },
      })

      if (!admin) {
        return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล Admin ที่ต้องการ' })
      }

      // 3) (ออปชัน) ตั้ง cache header เล็กน้อยให้หน้าแก้ไขลื่นขึ้น (เฉพาะฝั่ง browser)
      res.setHeader('Cache-Control', 'private, max-age=30') // เบา ๆ 30 วินาที

      return res.status(200).json({
        success: true,
        data: admin,
        message: 'ดึงข้อมูล Admin สำเร็จ',
      })
    }

    // ใช้ `page` และ `pageSize` สำหรับ Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // เงื่อนไขการค้นหา
    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.AdminDBWhereInput = {

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
      data: admins.map((admin) => sanitizeAdminForClient(admin)),
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
  // Check authentication and permissions
  const currentAdmin = await requireAuth(req, res)
  if (!currentAdmin) return

  // Check if user can create admin
  // if (!await hasPermission(req, 'admin-management', 'canCreate')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์สร้างผู้ดูแลระบบใหม่'
  //   })
  // }

  try {
    const { username, password, name, email, tel, adminPositionId } = req.body;
    const normalizedEmail = normalizeEmail(email)

    // Validation
    if (!username || !password || !name || !email || !adminPositionId) {
      return res.status(400).json({
        success: false,
        error: `กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน username: ${username} password: ${password} name: ${name} email: ${email} tel: ${tel} adminPositionId: ${adminPositionId}`
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' })
    }

    // Check for existing admin
    const existing = await prisma.adminDB.findFirst({
      where: {
        OR: [
          { username },
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
        ],

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
    const newAdmin = await prisma.$transaction(async (tx) => {
      const admin = await tx.adminDB.create({
        data: {
          username,
          password: hashedPassword,
          name,
          email: normalizedEmail,
          emailVerifiedAt: null,
          tokenVersion: 0,
          registrationStatus: REGISTRATION_STATUSES.approved,
          tel,
          adminPositionId,
          isActive: true,
          createdAt: new Date(),
          createdBy: currentAdmin.username,
          updatedAt: new Date(),
          updatedBy: currentAdmin.username,
        },
      
      });

      // บันทึกประวัติ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminDB',
        admin.id,
        'CREATE',
        null,
        sanitizeAdminForClient(admin),
        currentAdmin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return admin;
    });

    let verificationMessage = 'กรุณาให้ผู้ใช้ตรวจอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ'
    try {
      assertEmailDeliveryConfigured()
      await sendVerificationForAdmin({
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
      })
    } catch (emailError) {
      console.error('New admin verification email failed:', emailError)
      verificationMessage = 'สร้างบัญชีแล้ว แต่ยังส่งอีเมลยืนยันไม่ได้ ผู้ใช้สามารถขอส่งใหม่จากหน้าเข้าสู่ระบบ'
    }

    return res.status(201).json({
      success: true,
      admin: sanitizeAdminForClient(newAdmin),
      message: `สร้างผู้ดูแลระบบสำเร็จ — ${verificationMessage}`
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // ชน unique
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta!.target.join(',') : String(error.meta?.target || '');
        return res.status(400).json({
          success: false,
          error: `ข้อมูลซ้ำ (unique: ${target})`,
        });
      }
      // FK ขัดกัน (เช่น มีคนใช้งานตำแหน่งนี้อยู่)
      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          error: `ไม่สามารถดำเนินการได้ เนื่องจากมีการอ้างอิงอยู่ (foreign key)`,
        });
      }
    }
    console.error('Create/Update/Delete admin position error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  // Check authentication and permissions
  const currentAdmin = await requireAuth(req, res)
  if (!currentAdmin) return

  // Check if user can update admin
  // if (!await hasPermission(req, 'admin-management', 'canUpdate')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์แก้ไขข้อมูลผู้ดูแลระบบ'
  //   })
  // }

  try {
    const { id, username, name, email, tel, adminPositionId, isActive } = req.body;



    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบ ID'
      });
    }

    // Check if admin exists
    const existingAdmin = await prisma.adminDB.findFirst({
      where: { id, }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ดูแลระบบที่ต้องการแก้ไข'
      });
    }

    const existingIsPermanentAdmin = isPermanentSuperAdminEmail(existingAdmin.email)
    const normalizedEmail = email === undefined ? undefined : normalizeEmail(email)

    if (normalizedEmail !== undefined && !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' })
    }

    if (
      existingIsPermanentAdmin &&
      normalizedEmail !== undefined &&
      normalizedEmail !== normalizeEmail(existingAdmin.email)
    ) {
      return res.status(403).json({
        success: false,
        error: 'ไม่สามารถเปลี่ยนอีเมลของผู้ดูแลระบบสูงสุดได้',
      })
    }

    if (existingIsPermanentAdmin && isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'ไม่สามารถปิดใช้งานผู้ดูแลระบบสูงสุดได้',
      })
    }

    // Check for duplicate username/email (excluding current admin)
    if (username && username !== existingAdmin.username) {
      const duplicateUsername = await prisma.adminDB.findFirst({
        where: {
          username,

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

    if (normalizedEmail && normalizedEmail !== normalizeEmail(existingAdmin.email)) {
      const duplicateEmail = await prisma.adminDB.findFirst({
        where: {
          email: { equals: normalizedEmail, mode: 'insensitive' },

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

    const emailChanged = Boolean(
      normalizedEmail && normalizedEmail !== normalizeEmail(existingAdmin.email)
    )

    const existingRegistrationStatus =
      existingAdmin.registrationStatus || REGISTRATION_STATUSES.approved
    const approvalRequested =
      existingRegistrationStatus !== REGISTRATION_STATUSES.approved && isActive === true

    if (approvalRequested) {
      if (!existingAdmin.emailVerifiedAt || emailChanged) {
        return res.status(400).json({
          success: false,
          error: 'ต้องยืนยันอีเมลปัจจุบันก่อนอนุมัติบัญชี',
        })
      }

      const targetPosition = await prisma.adminPositionDB.findUnique({
        where: { id: adminPositionId || existingAdmin.adminPositionId },
        include: { adminDepartment: true },
      })

      if (!targetPosition || isPendingRegistrationPosition(targetPosition)) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาเลือกแผนกและตำแหน่งจริงก่อนอนุมัติบัญชี',
        })
      }
    }

    // Update admin
    const admin = await prisma.$transaction(async (tx) => {
      const updatedAdmin = await tx.adminDB.update({
        where: { id },
        data: {
          ...(username && { username }),
          ...(name && { name }),
          ...(normalizedEmail && { email: normalizedEmail }),
          ...(emailChanged && {
            emailVerifiedAt: null,
            tokenVersion: { increment: 1 },
            ...(existingRegistrationStatus !== REGISTRATION_STATUSES.approved
              ? {
                  registrationStatus: REGISTRATION_STATUSES.pendingEmail,
                  isActive: false,
                }
              : {}),
          }),
          ...(tel !== undefined && { tel }),
          ...(adminPositionId && { adminPositionId: adminPositionId }),
          ...(isActive !== undefined && { isActive }),
          ...(approvalRequested && {
            registrationStatus: REGISTRATION_STATUSES.approved,
          }),
          updatedBy: currentAdmin.username,
          updatedAt: new Date(),
        },
        include: {
          adminPosition: {
            include: { adminDepartment: true }
          },
        },
      });

      // บันทึกประวัติ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminDB',
        id,
        'UPDATE',
        sanitizeAdminForClient(existingAdmin),
        sanitizeAdminForClient(updatedAdmin),
        currentAdmin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return updatedAdmin;
    });



    let message = emailChanged
      ? 'อัปเดตผู้ดูแลระบบสำเร็จ กรุณายืนยันอีเมลใหม่ก่อนเข้าสู่ระบบอีกครั้ง'
      : 'อัปเดตผู้ดูแลระบบสำเร็จ'

    if (emailChanged) {
      try {
        assertEmailDeliveryConfigured()
        await sendVerificationForAdmin({ id: admin.id, email: admin.email, name: admin.name })
      } catch (emailError) {
        console.error('Updated admin verification email failed:', emailError)
        message = 'อัปเดตผู้ดูแลระบบสำเร็จ แต่ยังส่งอีเมลยืนยันไม่ได้ กรุณาขอส่งใหม่จากหน้าเข้าสู่ระบบ'
      }
    }

    return res.status(200).json(serializeBigIntToString({
      success: true,
      data: sanitizeAdminForClient(admin), // เปลี่ยนจาก admin เป็น data เพื่อความสอดคล้อง
      message
    }));
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // ชน unique
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta!.target.join(',') : String(error.meta?.target || '');
        return res.status(400).json({
          success: false,
          error: `ข้อมูลซ้ำ (unique: ${target})`,
        });
      }
      // FK ขัดกัน (เช่น มีคนใช้งานตำแหน่งนี้อยู่)
      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          error: `ไม่สามารถดำเนินการได้ เนื่องจากมีการอ้างอิงอยู่ (foreign key)`,
        });
      }
    }
    console.error('Create/Update/Delete admin position error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  // Check authentication and permissions
  const currentAdmin = await requireAuth(req, res)
  if (!currentAdmin) return

  // Check if user can delete admin
  // if (!await hasPermission(req, 'admin-management', 'canDelete')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'ไม่มีสิทธิ์ลบผู้ดูแลระบบ'
  //   })
  // }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบ ID'
      });
    }

    // Check if admin exists and get data before deletion
    const existingAdmin = await prisma.adminDB.findFirst({
      where: { id },
      include: {
        adminPosition: {
          include: { adminDepartment: true }
        },
      },
    });
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ดูแลระบบที่ต้องการลบ',
      });
    }

    if (isPermanentSuperAdminEmail(existingAdmin.email)) {
      return res.status(403).json({
        success: false,
        error: 'ไม่สามารถลบผู้ดูแลระบบสูงสุดได้',
      })
    }

    // Hard delete with work history
    await prisma.$transaction(async (tx) => {
      // บันทึกประวัติก่อนลบ
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AdminDB',
        id,
        'DELETE',
        sanitizeAdminForClient(existingAdmin),
        null,
        currentAdmin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      // Hard delete - ลบจริงออกจากฐานข้อมูล
      await tx.adminDB.delete({
        where: { id },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'ลบผู้ดูแลระบบสำเร็จ'
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // ชน unique
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta!.target.join(',') : String(error.meta?.target || '');
        return res.status(400).json({
          success: false,
          error: `ข้อมูลซ้ำ (unique: ${target})`,
        });
      }
      // FK ขัดกัน (เช่น มีคนใช้งานตำแหน่งนี้อยู่)
      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          error: `ไม่สามารถดำเนินการได้ เนื่องจากมีการอ้างอิงอยู่ (foreign key)`,
        });
      }
    }
    console.error('Create/Update/Delete admin position error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' });
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

