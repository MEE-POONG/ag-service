// /pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateAdmin, buildJwtPayload, generateToken, sanitizeAdminForClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setAuthCookie } from '@/lib/cookieUtils'
import { getAuthBypassUser, isAuthBypassEnabled } from '@/lib/authBypass'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (isAuthBypassEnabled()) {
    res.setHeader('X-Auth-Bypass', 'enabled')
    return res.status(200).json({
      message: 'ข้ามการเข้าสู่ระบบชั่วคราว',
      user: getAuthBypassUser(),
    })
  }

  try {
    const { username, password } = req.body ?? {}
    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    }

    const user = await authenticateAdmin(username, password)
    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }

    // สร้าง JWT payload เล็ก ๆ แล้วเซ็ตเป็น HttpOnly cookie
    const payload = buildJwtPayload(user)
    const token = generateToken(payload)
    setAuthCookie(res, token)

    // Log กิจกรรมแบบไม่บล็อกการเข้าสู่ระบบ
    prisma.activityLogDB.create({
      data: {
        userId: user.id,
        userType: 'admin',
        action: 'login',
        ipAddress: Array.isArray(req.headers['x-forwarded-for'])
          ? req.headers['x-forwarded-for'][0]
          : (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || undefined,
        createdAt: new Date(),
      },
    }).catch((logError) => {
      console.warn('Login activity log failed:', logError)
    })

    // ส่งกลับเฉพาะข้อมูลที่ปลอดภัย (ไม่ต้องส่ง token ใน body)
    return res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: sanitizeAdminForClient(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
}
