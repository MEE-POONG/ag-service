import { prisma } from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'
import { serializeBigIntToNumber } from '@/lib/bigintUtils'

type ApiResp<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      status = '',
      adviser = '',
      id = '',
    } = req.query

    if (id) {
      const record = await prisma.resetAgUserPasswordDB.findFirst({
        where: { id: String(id) },
      })
      if (!record) {
        return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' })
      }
      return res.status(200).json({ success: true, data: serializeBigIntToNumber(record) })
    }

    const pageNum = parseInt(String(page), 10) || 1
    const pageSizeNum = parseInt(String(pageSize), 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const where: any = {}

    if (keyword) {
      where.OR = [
        { adviser: { contains: String(keyword), mode: 'insensitive' } },
        { usernameAG: { contains: String(keyword), mode: 'insensitive' } },
        { position: { contains: String(keyword), mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = String(status)
    }

    if (adviser) {
      where.adviser = { contains: String(adviser), mode: 'insensitive' }
    }

    const [records, total] = await Promise.all([
      prisma.resetAgUserPasswordDB.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSizeNum,
      }),
      prisma.resetAgUserPasswordDB.count({ where }),
    ])

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber(records),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
    })
  } catch (error) {
    console.error('GET reset-ag-user-password error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const {
      adviser,
      usernameAG,
      newPassword,
      position,
      userId,
    } = req.body

    if (!adviser || !usernameAG || !newPassword || !position) {
      return res.status(400).json({ 
        success: false, 
        error: `กรุณากรอกข้อมูลให้ครบถ้วน (adviser: ${adviser}, usernameAG: ${usernameAG}, newPassword: ${newPassword}, position: ${position})` 
      })
    }

    const created = await prisma.$transaction(async (tx) => {
      const record = await tx.resetAgUserPasswordDB.create({
        data: {
          adviser: String(adviser),
          usernameAG: String(usernameAG),
          newPassword: String(newPassword),
          position: String(position),
          errorMessage: null,
          status: String('PENDING'),
          v: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          processedAt: new Date(),
        },
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ResetAgUserPasswordDB',
        userId,
        'CREATE',
        null,
        userId,
        userId,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return record
    })

    return res.status(201).json({
      success: true,
      data: serializeBigIntToNumber(created),
      message: 'สร้างคำขอรีเซ็ตรหัสผ่าน AG User สำเร็จ',
    })
  } catch (error) {
    console.error('POST reset-ag-user-password error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างคำขอ' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const {
      id,
      adviser,
      usernameAG,
      newPassword,
      position,
      errorMessage,
      status,
      updatedBy = 'system'
    } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id' })
    }

    const existing = await prisma.resetAgUserPasswordDB.findFirst({
      where: { id },
    })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.resetAgUserPasswordDB.update({
        where: { id },
        data: {
          ...(adviser && { adviser: String(adviser) }),
          ...(usernameAG && { usernameAG: String(usernameAG) }),
          ...(newPassword && { newPassword: String(newPassword) }),
          ...(position && { position: String(position) }),
          ...(errorMessage !== undefined && { errorMessage: errorMessage }),
          ...(status && { status: String(status) }),
          updatedAt: new Date(),
          ...(status === 'completed' && { processedAt: new Date() }),
        },
      })

      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ResetAgUserPasswordDB',
        id,
        'UPDATE',
        existing,
        record,
        updatedBy,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      )

      return record
    })

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber(updated),
      message: 'แก้ไขคำขอรีเซ็ตรหัสผ่าน AG User สำเร็จ',
    })
  } catch (error) {
    console.error('PUT reset-ag-user-password error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขคำขอ' })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { id, deletedBy = 'system' } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id' })
    }

    const existing = await prisma.resetAgUserPasswordDB.findFirst({
      where: { id },
    })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' })
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'ResetAgUserPasswordDB',
        id,
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

      await tx.resetAgUserPasswordDB.delete({
        where: { id },
      })
    })

    return res.status(200).json({ success: true, message: 'ลบคำขอรีเซ็ตรหัสผ่าน AG User สำเร็จ' })
  } catch (error) {
    console.error('DELETE reset-ag-user-password error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลบคำขอ' })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res)
    case 'PUT':
      return handlePut(req, res)
    case 'DELETE':
      return handleDelete(req, res)
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}

