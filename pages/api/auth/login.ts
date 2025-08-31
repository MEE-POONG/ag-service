// /pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'
import { authenticateAdmin, generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ONE_DAY = 60 * 60 * 24
const SEVEN_DAYS = ONE_DAY * 7

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password, remember } = req.body ?? {}

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    }

    const user = await authenticateAdmin(username, password)
    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }

    // ออก JWT
    const token = generateToken(user)

    // Log กิจกรรม
    await prisma.activityLogDB.create({
      data: {
        userId: user.id,
        userType: 'admin',
        action: 'login',
        ipAddress: Array.isArray(req.headers['x-forwarded-for'])
          ? req.headers['x-forwarded-for'][0]
          : (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || undefined,
      },
    })

    // ตั้ง Cookie แบบ HttpOnly
    const maxAge = remember ? SEVEN_DAYS * 4 : SEVEN_DAYS // ตัวอย่าง: remember 28 วัน
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ใน production
        sameSite: 'lax', // ถ้าข้ามโดเมน/ซับโดเมน ต้องใช้ 'none' + secure:true
        path: '/',
        maxAge,
      })
    )

    // ไม่ต้องส่ง token กลับ ลดความเสี่ยง XSS
    const { passwordHash, ...safeUser } = (user as any) || {}
    return res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
}
