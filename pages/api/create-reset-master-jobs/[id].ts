import { prisma } from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'
import { serializeBigIntToNumber } from '@/lib/bigintUtils'

type ApiResp<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id' })
    }

    const job = await prisma.createResetMasterJobsDB.findFirst({
      where: { id: String(id) },
    })

    if (!job) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' })
    }

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber(job)
    })
  } catch (error) {
    console.error('GET create-reset-master-jobs/[id] error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { id } = req.query
    const {
      adviser,
      insertedCount,
      limit,
      newPassword,
      status,
      updatedBy = 'system'
    } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id' })
    }

    const existing = await prisma.createResetMasterJobsDB.findFirst({
      where: { id: String(id) },
    })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const job = await tx.createResetMasterJobsDB.update({
        where: { id: String(id) },
        data: {
          ...(adviser && { adviser: String(adviser) }),
          ...(typeof insertedCount === 'number' && { insertedCount }),
          ...(typeof limit === 'number' && { limit }),
          ...(newPassword && { newPassword: String(newPassword) }),
          ...(status && { status: String(status) }),
          updatedAt: new Date(),
          ...(status === 'completed' && { processedAt: new Date() }),
        },
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'CreateResetMasterJobsDB',
        String(id),
        'UPDATE',
        existing,
        job,
        updatedBy,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return job
    })

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber(updated),
      message: 'แก้ไขงานรีเซ็ตรหัสผ่านสำเร็จ',
    })
  } catch (error) {
    console.error('PUT create-reset-master-jobs/[id] error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขงาน' })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { id } = req.query
    const { deletedBy = 'system' } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id' })
    }

    const existing = await prisma.createResetMasterJobsDB.findFirst({
      where: { id: String(id) },
    })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' })
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'CreateResetMasterJobsDB',
        String(id),
        'DELETE',
        existing,
        null,
        deletedBy,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      await tx.createResetMasterJobsDB.delete({
        where: { id: String(id) },
      })
    })

    return res.status(200).json({ success: true, message: 'ลบงานรีเซ็ตรหัสผ่านสำเร็จ' })
  } catch (error) {
    console.error('DELETE create-reset-master-jobs/[id] error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลบงาน' })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'PUT':
      return handlePut(req, res)
    case 'DELETE':
      return handleDelete(req, res)
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}