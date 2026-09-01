// /pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateAdmin, buildJwtPayload, generateToken, sanitizeAdminForClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setAuthCookie } from '@/lib/cookieUtils'
import { assertEmailDeliveryConfigured } from '@/lib/accountEmail'
import { sendVerificationForAdmin } from '@/lib/adminAuthTokens'
import { REGISTRATION_STATUSES } from '@/lib/registration'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { identifier, username, password } = req.body ?? {}
    const loginIdentifier = String(identifier ?? username ?? '').trim()

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลหรือชื่อผู้ใช้ และรหัสผ่าน' })
    }

    const user = await authenticateAdmin(loginIdentifier, password)
    if (!user) {
      return res.status(401).json({ error: 'อีเมล ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง' })
    }

    if (!user.emailVerifiedAt) {
      try {
        assertEmailDeliveryConfigured()
        await sendVerificationForAdmin({
          id: user.id,
          email: user.email,
          name: user.name,
        })
      } catch (emailError) {
        console.error('Login verification email failed:', emailError)
        return res.status(503).json({
          code: 'EMAIL_DELIVERY_UNAVAILABLE',
          error: 'บัญชียังไม่ได้ยืนยันอีเมล และระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
        })
      }

      return res.status(403).json({
        code: 'EMAIL_VERIFICATION_REQUIRED',
        error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ เราได้ส่งลิงก์ยืนยันให้แล้ว',
        email: user.email,
      })
    }

    const registrationStatus = user.registrationStatus || REGISTRATION_STATUSES.approved
    if (registrationStatus !== REGISTRATION_STATUSES.approved) {
      return res.status(403).json({
        code: 'ACCOUNT_PENDING_APPROVAL',
        error: 'ยืนยันอีเมลแล้ว บัญชีกำลังรอผู้ดูแลระบบอนุมัติ',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        code: 'ACCOUNT_DISABLED',
        error: 'บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
      })
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
