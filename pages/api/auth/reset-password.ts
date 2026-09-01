import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import {
  ADMIN_TOKEN_TYPES,
  comparePasswordResetOtp,
  getPasswordResetTokenPrefix,
  isPasswordResetOtp,
  isPasswordResetReference,
} from '@/lib/adminAuthTokens'
import { isPermanentSuperAdminEmail, normalizeEmail } from '@/lib/adminIdentity'
import { getPasswordValidationError } from '@/lib/passwordPolicy'
import { checkRequestRateLimit } from '@/lib/requestRateLimit'

function getRequestIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (Array.isArray(forwarded)) return forwarded[0] || 'unknown'
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const referenceCode = String(req.body?.referenceCode ?? '').trim().toUpperCase()
  const otp = String(req.body?.otp ?? '').trim()
  const password = req.body?.password

  if (!isPasswordResetReference(referenceCode) || !isPasswordResetOtp(otp)) {
    return res.status(400).json({ error: 'รหัส OTP หรือเลขอ้างอิงไม่ถูกต้อง' })
  }

  const passwordError = getPasswordValidationError(password)
  if (passwordError) {
    return res.status(400).json({ error: passwordError })
  }

  const rateLimit = checkRequestRateLimit(
    `reset-password-otp:${getRequestIp(req)}:${referenceCode}`,
    5,
    15 * 60 * 1000
  )
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    return res.status(429).json({ error: 'กรอก OTP ผิดเกินจำนวนที่กำหนด กรุณาขอรหัสใหม่' })
  }

  try {
    const tokenRecord = await prisma.adminAuthTokenDB.findFirst({
      where: {
        type: ADMIN_TOKEN_TYPES.passwordResetOtp,
        tokenHash: { startsWith: getPasswordResetTokenPrefix(referenceCode) },
        OR: [
          { usedAt: null },
          { usedAt: { isSet: false } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { admin: true },
    })
    const now = new Date()

    if (
      !tokenRecord ||
      tokenRecord.expiresAt <= now ||
      normalizeEmail(tokenRecord.email) !== normalizeEmail(tokenRecord.admin.email) ||
      (!tokenRecord.admin.isActive && !isPermanentSuperAdminEmail(tokenRecord.admin.email))
    ) {
      return res.status(400).json({ error: 'รหัส OTP หรือเลขอ้างอิงไม่ถูกต้องหรือหมดอายุแล้ว' })
    }

    const otpMatches = await comparePasswordResetOtp(tokenRecord.tokenHash, referenceCode, otp)
    if (!otpMatches) {
      return res.status(400).json({ error: 'รหัส OTP หรือเลขอ้างอิงไม่ถูกต้องหรือหมดอายุแล้ว' })
    }

    const claimed = await prisma.adminAuthTokenDB.updateMany({
      where: {
        id: tokenRecord.id,
        expiresAt: { gt: now },
        OR: [
          { usedAt: null },
          { usedAt: { isSet: false } },
        ],
      },
      data: { usedAt: now },
    })

    if (claimed.count !== 1) {
      return res.status(400).json({ error: 'รหัส OTP ถูกใช้ไปแล้ว กรุณาขอรหัสใหม่' })
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
        type: ADMIN_TOKEN_TYPES.passwordResetOtp,
        OR: [
          { usedAt: null },
          { usedAt: { isSet: false } },
        ],
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
