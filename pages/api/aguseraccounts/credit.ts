import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

type Resp<T = any> = {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * TODO: บันทึกลงฐานข้อมูลด้วย
 * @description เติมเครดิตสำหรับ AG User
 * POST /api/aguseraccounts/credit
 * Body: { id?: string, username?: string, credit: number }
 * 
 * @description เติมเครดิตสำหรับ AG User
 * @param req.body.id - ID ของ AG User
 * @param req.body.username - Username ของ AG User
 * @param req.body.credit - จำนวนเครดิตที่จะเติม
 * 
 * @returns {success: boolean, data: any, error: string, message: string}
 * Creates a credit top-up request for an AG user.
 * For now, this endpoint validates input, enriches with agent info, and returns a
 * payload suitable for an external worker to use. If environment variables are provided
 * in the future, you can integrate the actual top-up call here.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { id, username, credit } = req.body as { id?: string; username?: string; credit: number }

    const amount = Number(credit)
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'จำนวนเครดิตไม่ถูกต้อง' })
    }

    // Locate agent by id or username
    const agent = await prisma.agUserDB.findFirst({
      where: {
        OR: [
          id ? { id } : undefined,
          username ? { username: { equals: String(username), mode: 'insensitive' } } : undefined,
        ].filter(Boolean) as any,
      },
    })


    if (!agent) {
      return res.status(404).json({ success: false, error: 'ไม่พบ AG User' })
    }

    const adviser = await prisma.agUserDB.findFirst({
      where: {
        username: agent.origin,
      },
    })

    if (!adviser) {
      return res.status(404).json({ success: false, error: 'ไม่พบ Adviser' })
    }

    // Compose payload expected by the automation/worker layer
    const now = new Date()
    const payload = {
      statusFlag: 'A',
      usernameAG: agent.username,
      adviser: agent.origin,
      credit: amount,
      status: agent.position, // position of the agent (e.g. master/agent/senior)
      createdBy: String((admin as any).id || admin.username),
      updatedBy: String((admin as any).id || admin.username),
      statusServe: 'PENDING' as 'PENDING' | 'SUCCESS' | 'FAILED',
      creditBy: admin.username,
      createdAt: now,
      updatedAt: now,
      statusAG: null as string | null,
    }

    // If you have an external service to call, do it here.
    // Example sketch (disabled by default):
    // const base = process.env.CREDIT_API_URL
    // if (base) {
    //   const r = await fetch(`${base}/credit/topup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    //   const resp = await r.json()
    //   // Map resp to payload/statusServe/statusAG as needed
    // }

    // For now, we just echo back a simulated result so the UI can proceed.
    // You can toggle success/failure via env if needed during development.
    // const simulate = String(process.env.CREDIT_SIMULATE || 'fail').toLowerCase()
    // if (simulate === 'success' || simulate === 'ok' || simulate === 'true') {
    //   payload.statusServe = 'SUCCESS'
    //   payload.statusAG = 'OK'
    // } else {
    //   payload.statusServe = 'FAILED'
    //   payload.statusAG = 'Error: Login failed'
    // }

    // บันทึกลงฐานข้อมูล: เก็บคำสั่งเติมเครดิตเป็นคิวงาน (Mongo collection แบบ raw)
    try {
      const doc = {
        ...payload,
        agentId: agent.id,
        agentLogin: agent.userLogin,
        webname: (agent as any).webname || null,
        type: 'CREDIT_TOPUP',
      }
      // ใช้ runCommandRaw เพื่อเขียนลง collection โดยไม่ต้องมี Prisma Model
      await (prisma as any).$runCommandRaw({
        insert: 'creditTopUp',
        documents: [doc],
      })
    } catch (e) {
      console.error('Failed to persist credit topup queue', e)
      // ไม่ throw เพื่อไม่ให้ flow หลักล้มเหลว
    }

    // Record work history (non-blocking on failure)
    const ui = extractUserInfo(req)
    await recordWorkHistory(prisma as any, 'CreditTopUp', agent.id, 'CREATE', null, payload, admin.username, 'admin', payload.statusServe === 'SUCCESS', payload.statusServe === 'SUCCESS' ? null : payload.statusAG, ui.ipAddress, ui.userAgent)

    return res.status(200).json({ success: true, data: payload, message: 'topup-queued' })
  } catch (e: any) {
    console.error('aguseraccounts/credit API error', e)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
