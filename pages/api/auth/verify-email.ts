import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { ADMIN_TOKEN_TYPES, hashAdminAuthToken } from '@/lib/adminAuthTokens'
import { isPermanentSuperAdminEmail, normalizeEmail } from '@/lib/adminIdentity'
import { REGISTRATION_STATUSES } from '@/lib/registration'

function isTokenShapeValid(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.body?.token
  if (!isTokenShapeValid(token)) {
    return res.status(400).json({ error: 'ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว' })
  }

  try {
    const tokenRecord = await prisma.adminAuthTokenDB.findUnique({
      where: { tokenHash: hashAdminAuthToken(token) },
      include: { admin: true },
    })
    const now = new Date()

    if (
      !tokenRecord ||
      tokenRecord.type !== ADMIN_TOKEN_TYPES.emailVerification ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt <= now ||
      normalizeEmail(tokenRecord.email) !== normalizeEmail(tokenRecord.admin.email)
    ) {
      return res.status(400).json({ error: 'ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว' })
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
      return res.status(400).json({ error: 'ลิงก์ยืนยันอีเมลถูกใช้ไปแล้ว' })
    }

    const isPermanentAdmin = isPermanentSuperAdminEmail(tokenRecord.admin.email)
    const isPublicRegistration =
      tokenRecord.admin.registrationStatus === REGISTRATION_STATUSES.pendingEmail
    const registrationStatus = isPermanentAdmin
      ? REGISTRATION_STATUSES.approved
      : isPublicRegistration
        ? REGISTRATION_STATUSES.pendingApproval
        : tokenRecord.admin.registrationStatus
    await prisma.adminDB.update({
      where: { id: tokenRecord.adminId },
      data: {
        email: normalizeEmail(tokenRecord.admin.email),
        emailVerifiedAt: now,
        ...(isPermanentAdmin ? { isActive: true } : {}),
        registrationStatus,
        tokenVersion: { increment: 1 },
        updatedAt: now,
        updatedBy: 'email-verification',
      },
    })

    await prisma.adminAuthTokenDB.updateMany({
      where: {
        adminId: tokenRecord.adminId,
        type: ADMIN_TOKEN_TYPES.emailVerification,
        OR: [
          { usedAt: null },
          { usedAt: { isSet: false } },
        ],
      },
      data: { usedAt: now },
    })

    return res.status(200).json({
      message: isPublicRegistration
        ? 'ยืนยันอีเมลสำเร็จ บัญชีกำลังรอผู้ดูแลระบบอนุมัติ'
        : 'ยืนยันอีเมลสำเร็จ คุณสามารถเข้าสู่ระบบได้แล้ว',
      status: registrationStatus,
    })
  } catch (error) {
    console.error('Email verification failed:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' })
  }
}
