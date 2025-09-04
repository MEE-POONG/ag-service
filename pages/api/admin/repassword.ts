import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetPasswordResponse>
) {
  // รองรับเฉพาะ POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { id, newPassword } = req.body;

    // Validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID ของผู้ดูแลระบบ'
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุรหัสผ่านใหม่'
      });
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
      });
    }

    // ตรวจสอบว่าผู้ดูแลระบบมีอยู่จริง
    const existingAdmin = await prisma.adminDB.findFirst({
      where: { 
        id, 
         
      },
      select: {
        id: true,
        username: true,
        isActive: true
      }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ดูแลระบบที่ต้องการ'
      });
    }

    // ตรวจสอบว่าบัญชียังใช้งานได้
    if (!existingAdmin.isActive) {
      return res.status(400).json({
        success: false,
        error: 'บัญชีผู้ดูแลระบบนี้ถูกปิดการใช้งาน'
      });
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await hashPassword(newPassword);

    // อัพเดทรหัสผ่าน
    await prisma.adminDB.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedBy: req.body.updatedBy || 'system', // รับจาก request หรือใช้ default
        updatedAt: new Date()
      }
    });

    // Log การเปลี่ยนรหัสผ่าน (optional)
    try {
      await prisma.activityLogDB.create({
        data: {
          userId: id,
          userType: 'admin',
          action: 'reset_password',
          tableName: 'AdminDB',
          recordId: id,
          newData: JSON.stringify({
            action: 'password_reset',
            timestamp: new Date().toISOString(),
            resetBy: 'system' // TODO: เปลี่ยนเป็น admin ที่ login
          }),
          createdAt: new Date()
        }
      });
    } catch (logError) {
      // Log error ไม่ควรทำให้การรีเซ็ตรหัสผ่านล้มเหลว
      console.error('Failed to create activity log:', logError);
    }

    return res.status(200).json({
      success: true,
      message: `รีเซ็ตรหัสผ่านสำหรับ ${existingAdmin.username} สำเร็จ`
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
  }
}
