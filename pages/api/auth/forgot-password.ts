import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { assertEmailDeliveryConfigured } from '@/lib/accountEmail'
import { isValidEmail, normalizeEmail } from '@/lib/adminIdentity'
import { sendPasswordResetForAdmin } from '@/lib/adminAuthTokens'

const GENERIC_MESSAGE = 'หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทางอีเมล'

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

    if (admin) {
      await sendPasswordResetForAdmin(admin)
    }
  } catch (error) {
    // Do not reveal whether the submitted email belongs to an account.
    console.error('Password reset request failed:', error)
  }

  return res.status(200).json({ message: GENERIC_MESSAGE })
}
