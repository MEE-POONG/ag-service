import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ADMIN_TOKEN_TYPES, hashAdminAuthToken } from '@/lib/adminAuthTokens'
import { isPermanentSuperAdminEmail, normalizeEmail } from '@/lib/adminIdentity'
import { getPasswordValidationError } from '@/lib/passwordPolicy'

function isTokenShapeValid(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, password, confirmPassword } = req.body ?? {}
  if (!isTokenShapeValid(token)) {
    return res.status(400).json({ error: 'ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' })
  }

  const passwordError = getPasswordValidationError(password)
  if (passwordError) {
    return res.status(400).json({ error: passwordError })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน' })
  }

  try {
    const tokenRecord = await prisma.adminAuthTokenDB.findUnique({
      where: { tokenHash: hashAdminAuthToken(token) },
      include: { admin: true },
    })
    const now = new Date()

    if (
      !tokenRecord ||
      tokenRecord.type !== ADMIN_TOKEN_TYPES.passwordReset ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt <= now ||
      normalizeEmail(tokenRecord.email) !== normalizeEmail(tokenRecord.admin.email) ||
      (!tokenRecord.admin.isActive && !isPermanentSuperAdminEmail(tokenRecord.admin.email))
    ) {
      return res.status(400).json({ error: 'ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' })
    }

    const claimed = await prisma.adminAuthTokenDB.updateMany({
      where: { id: tokenRecord.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    })

    if (claimed.count !== 1) {
      return res.status(400).json({ error: 'ลิงก์ตั้งรหัสผ่านถูกใช้ไปแล้ว' })
    }

    const hashedPassword = await hashPassword(password)
    const isPermanentAdmin = isPermanentSuperAdminEmail(tokenRecord.admin.email)

    await prisma.adminDB.update({
      where: { id: tokenRecord.adminId },
      data: {
        password: hashedPassword,
        email: normalizeEmail(tokenRecord.admin.email),
        emailVerifiedAt: tokenRecord.admin.emailVerifiedAt || now,
        ...(isPermanentAdmin ? { isActive: true } : {}),
        tokenVersion: { increment: 1 },
        updatedAt: now,
        updatedBy: 'password-reset',
      },
    })

    await prisma.adminAuthTokenDB.updateMany({
      where: {
        adminId: tokenRecord.adminId,
        type: ADMIN_TOKEN_TYPES.passwordReset,
        usedAt: null,
      },
      data: { usedAt: now },
    })

    prisma.activityLogDB.create({
      data: {
        userId: tokenRecord.adminId,
        userType: 'admin',
        action: 'self_service_password_reset',
        tableName: 'AdminDB',
        recordId: tokenRecord.adminId,
        createdAt: now,
      },
    }).catch((logError) => console.warn('Password reset activity log failed:', logError))

    return res.status(200).json({ message: 'ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง' })
  } catch (error) {
    console.error('Password reset failed:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่' })
  }
}
