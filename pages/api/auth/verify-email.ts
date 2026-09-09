import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { ADMIN_TOKEN_TYPES, hashAdminAuthToken } from '@/lib/adminAuthTokens'
import { isPermanentSuperAdminEmail, normalizeEmail } from '@/lib/adminIdentity'
import { REGISTRATION_STATUSES } from '@/lib/registration'

function isTokenShapeValid(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)
}

function getVerificationResult(admin: {
  email: string
  registrationStatus: string
}) {
  const isPermanentAdmin = isPermanentSuperAdminEmail(admin.email)
  const registrationStatus = isPermanentAdmin
    ? REGISTRATION_STATUSES.approved
    : admin.registrationStatus === REGISTRATION_STATUSES.pendingEmail
      ? REGISTRATION_STATUSES.pendingApproval
      : admin.registrationStatus
  const isAwaitingApproval = registrationStatus === REGISTRATION_STATUSES.pendingApproval

  return {
    isPermanentAdmin,
    registrationStatus,
    message: isAwaitingApproval
      ? 'ยืนยันอีเมลเรียบร้อยแล้ว บัญชีกำลังรอผู้ดูแลระบบอนุมัติ'
      : 'ยืนยันอีเมลเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้',
  }
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
      normalizeEmail(tokenRecord.email) !== normalizeEmail(tokenRecord.admin.email)
    ) {
      return res.status(400).json({ error: 'ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว' })
    }

    const verificationResult = getVerificationResult(tokenRecord.admin)

    // A completed verification is idempotent: reopening the same legitimate link
    // reports the current successful state instead of presenting it as a failure.
    if (tokenRecord.admin.emailVerifiedAt) {
      return res.status(200).json({
        message: verificationResult.message,
        status: verificationResult.registrationStatus,
        alreadyCompleted: true,
      })
    }

    if (tokenRecord.usedAt || tokenRecord.expiresAt <= now) {
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

    try {
      await prisma.adminDB.update({
        where: { id: tokenRecord.adminId },
        data: {
          email: normalizeEmail(tokenRecord.admin.email),
          emailVerifiedAt: now,
          ...(verificationResult.isPermanentAdmin ? { isActive: true } : {}),
          registrationStatus: verificationResult.registrationStatus,
          tokenVersion: { increment: 1 },
          updatedAt: now,
          updatedBy: 'email-verification',
        },
      })
    } catch (error) {
      // Do not burn a valid link when persisting the account change fails.
      await prisma.adminAuthTokenDB.updateMany({
        where: { id: tokenRecord.id, usedAt: now },
        data: { usedAt: null },
      }).catch(() => undefined)
      throw error
    }

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
      message: verificationResult.message,
      status: verificationResult.registrationStatus,
    })
  } catch (error) {
    console.error('Email verification failed:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' })
  }
}
