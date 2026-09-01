import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { assertEmailDeliveryConfigured, verifyEmailDelivery } from '@/lib/accountEmail'
import { isValidEmail, normalizeEmail } from '@/lib/adminIdentity'
import {
  createPasswordResetReference,
  sendPasswordResetOtpForAdmin,
} from '@/lib/adminAuthTokens'
import { checkRequestRateLimit } from '@/lib/requestRateLimit'

const GENERIC_MESSAGE = 'หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งรหัส OTP สำหรับตั้งรหัสผ่านใหม่ให้ทางอีเมล'

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

  const email = normalizeEmail(req.body?.email)
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลให้ถูกต้อง' })
  }

  const rateLimit = checkRequestRateLimit(`forgot-password:${getRequestIp(req)}`)
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    return res.status(429).json({ error: 'ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' })
  }

  try {
    assertEmailDeliveryConfigured()
    await verifyEmailDelivery()
  } catch (error) {
    console.error('Password reset email configuration error:', error)
    return res.status(503).json({ error: 'ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ' })
  }

  try {
    const admin = await prisma.adminDB.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isActive: true,
      },
      select: { id: true, email: true, name: true },
    })

    const referenceCode = admin
      ? (await sendPasswordResetOtpForAdmin(admin)).referenceCode
      : createPasswordResetReference()

    return res.status(200).json({ message: GENERIC_MESSAGE, referenceCode })
  } catch (error) {
    // Do not reveal whether the submitted email belongs to an account.
    console.error('Password reset request failed:', error)
    return res.status(503).json({ error: 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง' })
  }
}
