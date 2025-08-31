import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateAdmin, generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    }
    const user = await authenticateAdmin(username, password)
    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }
    const token = generateToken(user)
    // Log activity
    await prisma.activityLogDB.create({
      data: {
        userId: user.id,
        userType: 'admin', // Admin-only system
        action: 'login',
        ipAddress: Array.isArray(req.headers['x-forwarded-for']) 
          ? req.headers['x-forwarded-for'][0] 
          : req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    })
    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`)
    return res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', user, token })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
} 
