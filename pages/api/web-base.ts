import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

// GET - ดึงข้อมูล WebBaseDB ทั้งหมด หรือตาม ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, search, status } = req.query;

    if (id) {
      // ดึงข้อมูลเฉพาะ ID
      const WebBaseDB = await prisma.webBaseDB.findUnique({
        where: { id: id as string },
        include: {
          AdminDB: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              tel: true,
              isActive: true,
            }
          },
        }
      });

      if (!WebBaseDB) {
        return res.status(404).json({ error: 'WebBaseDB not found' });
      }

      return res.status(200).json({
        success: true,
        data: WebBaseDB
      });
    }


    // ----- ดึงข้อมูลเฉพาะ Name (หารายการเดียว) -----
    if (name) {
      const WebBaseDB = await prisma.webBaseDB.findFirst({
        where: {
          name: {
            equals: name as string,
            mode: 'insensitive',
          },
        },
        include: {
          AdminDB: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              tel: true,
              isActive: true,
            }
          },
        }
      });

      if (!WebBaseDB) {
        return res.status(404).json({ error: 'WebBaseDB not found' });
      }

      return res.status(200).json({
        success: true,
        data: WebBaseDB
      });
    }

    // ดึงข้อมูลทั้งหมด (รองรับการค้นหาและกรอง)
    const where: any = {

    };

    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const webBases = await prisma.webBaseDB.findMany({
      where,
      include: {
        _count: {
          select: {
            AdminDB: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: webBases
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch WebBaseDB data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// POST - สร้าง WebBaseDB ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, passS, passM, passA, otpS, otpM, otpA, isActive = true, createdBy = 'system' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // ตรวจสอบว่าชื่อซ้ำหรือไม่
    const existingWebBase = await prisma.webBaseDB.findUnique({
      where: { name }
    });

    if (existingWebBase) {
      return res.status(400).json({ error: 'WebBaseDB name already exists' });
    }

    const newWebBase = await prisma.webBaseDB.create({
      data: {
        name,
        passS,
        passM,
        passA,
        otpS,
        otpM,
        otpA,
        isActive,
        createdBy,
        updatedBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }
    });

    return res.status(201).json({
      success: true,
      data: newWebBase,
      message: 'WebBaseDB created successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create WebBaseDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// PUT - อัพเดท WebBaseDB
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, passS, passM, passA, otpS, otpM, otpA, isActive, updatedBy = 'system' } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // ตรวจสอบว่า WebBaseDB มีอยู่หรือไม่
    const existingWebBase = await prisma.webBaseDB.findUnique({
      where: { id }
    });

    if (!existingWebBase) {
      return res.status(404).json({ error: 'WebBaseDB not found' });
    }

    // ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
    if (name && name !== existingWebBase.name) {
      const duplicateName = await prisma.webBaseDB.findUnique({
        where: { name }
      });

      if (duplicateName) {
        return res.status(400).json({ error: 'WebBaseDB name already exists' });
      }
    }

    const updatedWebBase = await prisma.webBaseDB.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(passS !== undefined && { passS }),
        ...(passM !== undefined && { passM }),
        ...(passA !== undefined && { passA }),
        ...(otpS !== undefined && { otpS }),
        ...(otpM !== undefined && { otpM }),
        ...(otpA !== undefined && { otpA }),
        ...(isActive !== undefined && { isActive }),
        updatedBy
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedWebBase,
      message: 'WebBaseDB updated successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update WebBaseDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// DELETE - ลบ WebBaseDB (Soft delete)
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, deleteBy = 'system' } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // ตรวจสอบว่า WebBaseDB มีอยู่หรือไม่
    const existingWebBase = await prisma.webBaseDB.findUnique({
      where: { id }
    });

    if (!existingWebBase) {
      return res.status(404).json({ error: 'WebBaseDB not found' });
    }

    // Soft delete
    const deleteWebBase = await prisma.webBaseDB.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      data: deleteWebBase,
      message: 'WebBaseDB delete successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete WebBaseDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
