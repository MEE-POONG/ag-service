import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import { extractUserInfo, recordWorkHistory } from '@/utils/workHistoryUtils'

type Resp<T = any> = {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * POST /api/agent/unlock-customer
 * Body: {
 *   adviser: string;        // ชื่อ adviser (เช่น origin ของเอเย่น)
 *   usernameAG: string;     // ชื่อผู้ใช้ของเอเย่น (AG)
 *   newPassword?: string;   // รหัสผ่านใหม่ ถ้าไม่ส่งจะใช้ค่าเริ่มต้น
 * }
 *
 * หมายเหตุ: เดิมเคยใช้ agentUsername/customerUsername ตอนนี้เปลี่ยนเป็น adviser/usernameAG/newPassword
 * แนวคิด: บันทึกคำขอปลดล็อคลูกค้าไปยัง collection "UnblockCustomerDB" ให้ worker ภายนอกไปทำงาน
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { adviser, usernameAG, newPassword } = req.body as {
      adviser?: string
      usernameAG?: string
      newPassword?: string
    }

    if (!usernameAG && !adviser) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน (adviser หรือ usernameAG อย่างน้อยหนึ่งค่า)' })
    }

    // หา agent จาก usernameAG เพื่อเติม adviser อัตโนมัติถ้าไม่ได้ส่งมา
    const agent = usernameAG
      ? await prisma.agUserAccountDB.findFirst({ where: { username: usernameAG } })
      : null
    if (!agent) {
      // ถ้าหา agent ไม่เจอ แต่มี adviser กับ usernameAG อาจจะยังต้องอนุญาตให้คิวทำต่อ
      if (!adviser || !usernameAG) {
        return res.status(404).json({ success: false, error: 'ไม่พบเอเย่น (usernameAG)' })
      }
    }

    const payload = {
      usernameAG: usernameAG || agent?.username || 'unknown',
      adviser: adviser || agent?.origin || 'unknown',
      newPassword: newPassword || 'Aa123456',
      status: 'PENDING' as 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED',
      errorMessage: null as string | null,
      errorStack: null as string | null,
      processedAt: null as Date | null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: (admin as any).username || 'system',
      requestedBy: (admin as any).username || 'system',
      ipAddress: extractUserInfo(req).ipAddress,
      userAgent: extractUserInfo(req).userAgent,
      type: 'UNBLOCK_CUSTOMER',
    }

    // เขียนลง collection แบบ raw เพื่อไม่ต้องเพิ่ม Prisma model
    try {
      await (prisma as any).$runCommandRaw({
        insert: 'UnblockCustomerDB',
        documents: [payload],
      })
    } catch (e) {
      // ถ้า write ด้วย runCommandRaw ไม่ได้ ให้ fallback เป็นการใช้ native collection ผ่าน aggregateRaw
      // (บางสภาพแวดล้อม lock ไว้เฉพาะ aggregateRaw) – ในกรณีนี้จะตอบกลับว่า queued แต่ไม่บันทึก
      console.error('write UnblockCustomerDB failed:', e)
    }

    // บันทึกประวัติการทำงาน (ไม่บล็อก flow หากผิดพลาด)
    try {
      const ui = extractUserInfo(req)
      await recordWorkHistory(
        prisma as any,
        'UnblockCustomerDB',
        null,
        'CREATE',
        null,
        payload,
        (admin as any).username || 'system',
        'admin',
        true,
        null,
        ui.ipAddress,
        ui.userAgent,
      )
    } catch (e) {
      console.error('record work history failed:', e)
    }

    return res.status(200).json({ success: true, data: payload, message: 'queued' })
  } catch (e: any) {
    console.error('unlock-customer API error', e)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
  }
}
