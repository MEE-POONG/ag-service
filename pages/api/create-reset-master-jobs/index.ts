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
      const job = await prisma.createResetMasterJobsDB.findFirst({
        where: { id: String(id) },
      })
      if (!job) {
        return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' })
      }
      return res.status(200).json({ success: true, data: serializeBigIntToNumber(job) })
    }

    const pageNum = parseInt(String(page), 10) || 1
    const pageSizeNum = parseInt(String(pageSize), 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const where: any = {}

    if (keyword) {
      where.OR = [
        { adviser: { contains: String(keyword), mode: 'insensitive' } },
        { status: { contains: String(keyword), mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = String(status)
    }

    if (adviser) {
      where.adviser = { contains: String(adviser), mode: 'insensitive' }
    }

    const [jobs, total] = await Promise.all([
      prisma.createResetMasterJobsDB.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSizeNum,
      }),
      prisma.createResetMasterJobsDB.count({ where }),
    ])

    return res.status(200).json({
      success: true,
      data: serializeBigIntToNumber(jobs),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
    })
  } catch (error) {
    console.error('GET create-reset-master-jobs error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const {
      adviser,
      position,
      webname,
      userId,
    } = req.body

    if (!adviser) {
      return res.status(400).json({ success: false, error: 'กรุณากรอก adviser และ newPassword' })
    }
    const WebBaseDB = await prisma.webBaseDB.findUnique({
      where: { name: webname },
    });
    if (!WebBaseDB) {
      return res.status(400).json({ success: false, error: 'ไม่เจอฐานข้อมูลของเว็บ' })
    }

    let password = '';

    switch (position) {
      case 'master':
        password = WebBaseDB.passA ?? '';
        break;
      case 'senior':
        password = WebBaseDB.passM ?? '';
        break;
    }
    const created = await prisma.$transaction(async (tx) => {
      const job = await tx.createResetMasterJobsDB.create({
        data: {
          adviser: String(adviser),
          insertedCount: Number(0),
          limit: Number(0),
          newPassword: String(password),
          status: String(`PENDING`),
          v: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          processedAt: new Date(),
        },
      })

      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'CreateResetMasterJobsDB',
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
      );

      return job
    })

    return res.status(201).json({
      success: true,
      data: serializeBigIntToNumber(created),
      message: 'สร้างงานรีเซ็ตรหัสผ่านสำเร็จ',
    })
  } catch (error) {
    console.error('POST create-reset-master-jobs error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างงาน' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const {
      id,
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
      where: { id },
    })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const job = await tx.createResetMasterJobsDB.update({
        where: { id },
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
        id,
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
    console.error('PUT create-reset-master-jobs error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขงาน' })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { id, deletedBy = 'system' } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ id' })
    }

    const existing = await prisma.createResetMasterJobsDB.findFirst({
      where: { id },
    })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' })
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req)
      await recordWorkHistory(
        tx,
        'CreateResetMasterJobsDB',
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

      await tx.createResetMasterJobsDB.delete({
        where: { id },
      })
    })

    return res.status(200).json({ success: true, message: 'ลบงานรีเซ็ตรหัสผ่านสำเร็จ' })
  } catch (error) {
    console.error('DELETE create-reset-master-jobs error:', error)
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลบงาน' })
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