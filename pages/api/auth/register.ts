import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { assertEmailDeliveryConfigured } from '@/lib/accountEmail'
import { isValidEmail, normalizeEmail } from '@/lib/adminIdentity'
import { sendVerificationForAdmin } from '@/lib/adminAuthTokens'
import { getPasswordValidationError } from '@/lib/passwordPolicy'
import {
  ensurePendingRegistrationPosition,
  getUsernameValidationError,
  normalizeUsername,
  REGISTRATION_STATUSES,
} from '@/lib/registration'
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

  const rateLimit = checkRequestRateLimit(`register:${getRequestIp(req)}`)
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    return res.status(429).json({ error: 'ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' })
  }

  const username = normalizeUsername(req.body?.username)
  const email = normalizeEmail(req.body?.email)
  const name = String(req.body?.name ?? '').trim()
  const tel = String(req.body?.tel ?? '').trim()
  const password = req.body?.password

  const usernameError = getUsernameValidationError(username)
  if (usernameError) return res.status(400).json({ error: usernameError })
  if (!isValidEmail(email)) return res.status(400).json({ error: 'กรุณากรอกอีเมลให้ถูกต้อง' })
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'ชื่อ-นามสกุลต้องมี 2-100 ตัวอักษร' })
  }
  if (tel.length > 30) return res.status(400).json({ error: 'เบอร์โทรยาวเกินไป' })

  const passwordError = getPasswordValidationError(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

  try {
    assertEmailDeliveryConfigured()
  } catch (error) {
    console.error('Registration email configuration error:', error)
    return res.status(503).json({ error: 'ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ' })
  }

  let createdAdminId: string | null = null

  try {
    const duplicate = await prisma.adminDB.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    })

    if (duplicate) {
      return res.status(409).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้ไม่สามารถใช้สมัครได้' })
    }

    const adminPositionId = await ensurePendingRegistrationPosition()
    const now = new Date()
    const admin = await prisma.adminDB.create({
      data: {
        username,
        password: await hashPassword(password),
        name,
        email,
        emailVerifiedAt: null,
        tel,
        adminPositionId,
        isActive: false,
        registrationStatus: REGISTRATION_STATUSES.pendingEmail,
        tokenVersion: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: 'public-registration',
        updatedBy: 'public-registration',
      },
      select: { id: true, email: true, name: true },
    })
    createdAdminId = admin.id

    await sendVerificationForAdmin(admin)

    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมล แล้วรอผู้ดูแลระบบอนุมัติบัญชี',
    })
  } catch (error) {
    if (createdAdminId) {
      await prisma.adminDB.delete({ where: { id: createdAdminId } }).catch((cleanupError) => {
        console.error('Failed to roll back incomplete registration:', cleanupError)
      })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้ไม่สามารถใช้สมัครได้' })
    }

    console.error('Registration failed:', error)
    return res.status(503).json({
      error: 'สมัครสมาชิกไม่สำเร็จ ระบบไม่สามารถส่งอีเมลยืนยันได้ กรุณาลองใหม่ภายหลัง',
    })
  }
}
