import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth, hasPermission } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'
import { serializeBigIntToString } from '@/lib/bigintUtils'

interface WorkQueueResponse {
  success?: boolean;
  data?: any;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  error?: string;
  message?: string;
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<WorkQueueResponse>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  try {
    const { page = '1', pageSize = '10', keyword = '', search = '', status = '', type = '', id = '' } = req.query;

    if (id) {
      if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
        return res.status(400).json({ success: false, error: 'รูปแบบ id ไม่ถูกต้อง' })
      }

      const workQueue = await prisma.agQueueJobDB.findUnique({
        where: { id: String(id) },
      })

      if (!workQueue) {
        return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล Work Queue ที่ต้องการ' })
      }

      res.setHeader('Cache-Control', 'private, max-age=30')

      return res.status(200).json({
        success: true,
        data: workQueue,
        message: 'ดึงข้อมูล Work Queue สำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    const searchKeyword = (keyword || search) as string;
    const whereClause: Prisma.AgQueueJobDBWhereInput = {
      ...(status && status !== 'all' ? { status: status as string } : {}),
      ...(type && type !== 'all' ? { type: type as string } : {}),
      ...(searchKeyword ? {
        OR: [
          { jobId: { contains: searchKeyword, mode: 'insensitive' } },
          { type: { contains: searchKeyword, mode: 'insensitive' } },
          { eventDocId: { contains: searchKeyword, mode: 'insensitive' } },
          { errorMessage: { contains: searchKeyword, mode: 'insensitive' } }
        ]
      } : {})
    };

    const [workQueues, totalWorkQueues] = await Promise.all([
      prisma.agQueueJobDB.findMany({
        where: whereClause,
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agQueueJobDB.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      data: workQueues,
      pagination: {
        totalItems: totalWorkQueues,
        totalPages: Math.ceil(totalWorkQueues / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูล Work Queue สำเร็จ'
    });
  } catch (error) {
    console.error('Get work queues error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Work Queue'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<WorkQueueResponse>) {
  const currentAdmin = await requireAuth(req, res)
  if (!currentAdmin) return

  try {
    const { jobId, type, priority, status, eventDocId, queueSize, errorMessage } = req.body;

    if (!jobId || !type || priority === undefined) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (jobId, type, priority)'
      });
    }

    const existing = await prisma.agQueueJobDB.findFirst({
      where: { jobId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'jobId นี้มีอยู่ในระบบแล้ว'
      });
    }

    const newWorkQueue = await prisma.$transaction(async (tx) => {
      const workQueue = await tx.agQueueJobDB.create({
        data: {
          jobId,
          type,
          priority,
          status: status || 'PENDING',
          eventDocId,
          queueSize,
          errorMessage,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AgQueueJobDB',
        workQueue.id,
        'CREATE',
        null,
        workQueue,
        currentAdmin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return workQueue;
    });

    return res.status(201).json({
      success: true,
      data: newWorkQueue,
      message: 'สร้าง Work Queue สำเร็จ'
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta!.target.join(',') : String(error.meta?.target || '');
        return res.status(400).json({
          success: false,
          error: `ข้อมูลซ้ำ (unique: ${target})`,
        });
      }
    }
    console.error('Create work queue error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<WorkQueueResponse>) {
  const currentAdmin = await requireAuth(req, res)
  if (!currentAdmin) return

  try {
    const { id, jobId, type, priority, status, eventDocId, queueSize, errorMessage } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบ ID'
      });
    }

    const existingWorkQueue = await prisma.agQueueJobDB.findFirst({
      where: { id }
    });

    if (!existingWorkQueue) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบ Work Queue ที่ต้องการแก้ไข'
      });
    }

    if (jobId && jobId !== existingWorkQueue.jobId) {
      const duplicateJobId = await prisma.agQueueJobDB.findFirst({
        where: {
          jobId,
          id: { not: id }
        }
      });

      if (duplicateJobId) {
        return res.status(400).json({
          success: false,
          error: 'jobId นี้มีอยู่ในระบบแล้ว'
        });
      }
    }

    const workQueue = await prisma.$transaction(async (tx) => {
      const updatedWorkQueue = await tx.agQueueJobDB.update({
        where: { id },
        data: {
          ...(jobId && { jobId }),
          ...(type && { type }),
          ...(priority !== undefined && { priority }),
          ...(status && { status }),
          ...(eventDocId !== undefined && { eventDocId }),
          ...(queueSize !== undefined && { queueSize }),
          ...(errorMessage !== undefined && { errorMessage }),
          updatedAt: new Date(),
        },
      });

      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AgQueueJobDB',
        id,
        'UPDATE',
        existingWorkQueue,
        updatedWorkQueue,
        currentAdmin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      return updatedWorkQueue;
    });

    return res.status(200).json(serializeBigIntToString({
      success: true,
      data: workQueue,
      message: 'อัปเดต Work Queue สำเร็จ'
    }));
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta!.target.join(',') : String(error.meta?.target || '');
        return res.status(400).json({
          success: false,
          error: `ข้อมูลซ้ำ (unique: ${target})`,
        });
      }
    }
    console.error('Update work queue error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<WorkQueueResponse>) {
  const currentAdmin = await requireAuth(req, res)
  if (!currentAdmin) return

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบ ID'
      });
    }

    const existingWorkQueue = await prisma.agQueueJobDB.findFirst({
      where: { id },
    });

    if (!existingWorkQueue) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบ Work Queue ที่ต้องการลบ',
      });
    }

    await prisma.$transaction(async (tx) => {
      const userInfo = extractUserInfo(req);
      await recordWorkHistory(
        tx,
        'AgQueueJobDB',
        id,
        'DELETE',
        existingWorkQueue,
        null,
        currentAdmin.username,
        'admin',
        true,
        null,
        userInfo.ipAddress,
        userInfo.userAgent
      );

      await tx.agQueueJobDB.delete({
        where: { id },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'ลบ Work Queue สำเร็จ'
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          error: `ไม่สามารถดำเนินการได้ เนื่องจากมีการอ้างอิงอยู่ (foreign key)`,
        });
      }
    }
    console.error('Delete work queue error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<WorkQueueResponse>) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Work Queue API error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
  }
}