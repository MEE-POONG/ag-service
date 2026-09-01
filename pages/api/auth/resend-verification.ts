import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { assertEmailDeliveryConfigured } from '@/lib/accountEmail'
import { isValidEmail, normalizeEmail } from '@/lib/adminIdentity'
import { sendVerificationForAdmin } from '@/lib/adminAuthTokens'

const GENERIC_MESSAGE = 'หากบัญชีนี้ยังไม่ได้ยืนยันอีเมล เราจะส่งลิงก์ยืนยันให้ทางอีเมล'

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

  try {
    assertEmailDeliveryConfigured()
  } catch (error) {
    console.error('Verification email configuration error:', error)
    return res.status(503).json({ error: 'ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ' })
  }

  try {
    const admin = await prisma.adminDB.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        emailVerifiedAt: null,
      },
      select: { id: true, email: true, name: true },
    })

    if (admin) {
      await sendVerificationForAdmin(admin)
    }
  } catch (error) {
    // Keep the response identical for existing and non-existing accounts.
    console.error('Verification email request failed:', error)
  }

  return res.status(200).json({ message: GENERIC_MESSAGE })
}
