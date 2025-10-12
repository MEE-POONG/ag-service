/**
 * API Endpoint: GET /api/auth/me
 *
 * 🎯 วัตถุประสงค์:
 * - ตรวจสอบสถานะการ login ของผู้ใช้ปัจจุบัน
 * - ดึงข้อมูลผู้ใช้และสิทธิ์การเข้าถึง
 * - ส่งข้อมูลเมนูที่ผู้ใช้สามารถเข้าถึงได้
 *
 * 🔄 Flow การทำงาน:
 * 1. ตรวจสอบ Token จาก Cookie
 * 2. Verify Token และดึง Payload
 * 3. Query ข้อมูลผู้ใช้จาก Database
 * 4. ตรวจสอบสถานะ Active ของผู้ใช้
 * 5. ดึงข้อมูล Menu ที่เปิดใช้งาน
 * 6. รวมข้อมูลและส่งกลับ Client
 *
 * 📤 Response Format:
 * - Success: { user: UserData, menuWeb: MenuData[] }
 * - Fail: { user: null }
 */

// /pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, sanitizeAdminForClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAuthToken } from '@/lib/cookieUtils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🍪 ขั้นตอนที่ 1: ดึง Authentication Token จาก Cookie
  const token = getAuthToken(req) // ใช้ helper function จาก cookieUtils.ts
  if (!token) {
    // ไม่มี token = ผู้ใช้ยังไม่ได้ login
    return res.status(200).json({ user: null })
  }

  // 🔐 ขั้นตอนที่ 2: ตรวจสอบความถูกต้องของ Token
  const payload = verifyToken(token)
  if (!payload) {
    // Token ไม่ถูกต้องหรือหมดอายุ = ต้อง login ใหม่
    return res.status(200).json({ user: null })
  }

  // 🗃️ ขั้นตอนที่ 3: ดึงข้อมูลผู้ใช้จาก Database พร้อมข้อมูลเพิ่มเติม
  const user = await prisma.adminDB.findUnique({
    where: { id: payload.sub }, // ใช้ User ID จาก Token Payload
    include: {
      adminPosition: {
        include: {
          adminDepartment: true, // ข้อมูลแผนก
          AdminDefaultPermissionDB: { // สิทธิ์การใช้งาน
            include: { menuPage: true } // รายละเอียดเมนูที่มีสิทธิ์
          },
        },
      },
      webBase: {
        include: {} // ข้อมูล Website Base (ถ้ามี)
      },
    },
  })
  console.log('user', user)
  // 🚫 ขั้นตอนที่ 4: ตรวจสอบสถานะของผู้ใช้
  if (!user || user.isActive === false) {
    // ไม่พบผู้ใช้หรือบัญชีถูกปิดใช้งาน
    return res.status(200).json({ user: null })
  }

  // 📋 ขั้นตอนที่ 5: ดึงข้อมูลเมนูทั้งหมดที่เปิดใช้งาน
  const menuWeb = await prisma.menuWebDB.findMany({
    where: {
      isVisible: true // เฉพาะเมนูที่เปิดให้ใช้งาน
    },
    orderBy: [
      { showOrder: 'asc' }, // เรียงตามลำดับการแสดงผล
    ]
  })

  // 🔗 ขั้นตอนที่ 6: รวมข้อมูลผู้ใช้และสิทธิ์
  const merged = {
    ...user, // ข้อมูลผู้ใช้ทั้งหมด
    role: payload.role, // บทบาทจาก Token
    permissions: (user.adminPosition?.AdminDefaultPermissionDB ?? [])
      .map((p: any) => p?.MenuPageWebDB?.name) // แปลงเป็นรายชื่อเมนูที่มีสิทธิ์
      .filter(Boolean), // กรองค่า null/undefined ออก
    tokenVersion: payload.tokenVersion ?? 0, // เวอร์ชั่น Token (สำหรับ revoke)
  }

  // 📤 ขั้นตอนที่ 7: ส่งข้อมูลกลับไปยัง Client
  return res.status(200).json({
    user: sanitizeAdminForClient(merged), // ลบข้อมูลที่ไม่ควรส่งไป Client
    menuWeb: menuWeb // ข้อมูลเมนูทั้งหมด (จะถูกกรองใน Frontend)
  })
}
