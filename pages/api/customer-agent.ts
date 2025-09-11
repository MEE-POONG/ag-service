import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// GET - ดึงข้อมูล customer-agent mapping
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { customerId, agentId } = req.query;

  try {
    if (customerId) {
      // ดึงข้อมูล agent ของลูกค้าคนนี้
      const customerAgent = await prisma.customerAgentDB.findUnique({
        where: { customerId: customerId as string },
        include: {
          agent: true
        }
      });

      return res.status(200).json({
        success: true,
        data: customerAgent
      });
    } else if (agentId) {
      // ดึงรายการลูกค้าทั้งหมดของ agent นี้
      const customerAgents = await prisma.customerAgentDB.findMany({
        where: { 
          agentId: agentId as string,
          isActive: true
        },
        include: {
          agent: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        success: true,
        data: customerAgents
      });
    } else {
      // ดึงข้อมูลทั้งหมด
      const customerAgents = await prisma.customerAgentDB.findMany({
        where: { isActive: true },
        include: {
          agent: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        success: true,
        data: customerAgents
      });
    }
  } catch (error) {
    console.error('GET Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer-agent mappings'
    });
  }
}

// POST - สร้าง customer-agent mapping ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { customerId, agentId, note } = req.body;

  if (!customerId || !agentId) {
    return res.status(400).json({
      success: false,
      error: 'customerId and agentId are required'
    });
  }

  try {
    // ตรวจสอบว่า agent มีอยู่จริง
    const agentExists = await prisma.agUserAccountDB.findUnique({
      where: { id: agentId }
    });

    if (!agentExists) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // ตรวจสอบว่าลูกค้านี้มี agent แล้วหรือยัง
    const existingMapping = await prisma.customerAgentDB.findUnique({
      where: { customerId }
    });

    if (existingMapping) {
      return res.status(409).json({
        success: false,
        error: 'Customer already has an agent assigned'
      });
    }

    // สร้าง mapping ใหม่
    const customerAgent = await prisma.customerAgentDB.create({
      data: {
        customerId,
        agentId,
        note: note || '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        updatedBy: 'current-user-id'
      },
      include: {
        agent: true
      }
    });

    return res.status(201).json({
      success: true,
      data: customerAgent,
      message: 'Customer-Agent mapping created successfully'
    });
  } catch (error) {
    console.error('POST Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create customer-agent mapping'
    });
  }
}

// PUT - อัพเดท customer-agent mapping
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { customerId, agentId, note } = req.body;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'customerId is required'
    });
  }

  try {
    // ตรวจสอบว่า mapping มีอยู่จริง
    const existingMapping = await prisma.customerAgentDB.findUnique({
      where: { customerId }
    });

    if (!existingMapping) {
      return res.status(404).json({
        success: false,
        error: 'Customer-Agent mapping not found'
      });
    }

    // อัพเดทข้อมูล
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: 'current-user-id' // TODO: Get from auth context
    };

    if (agentId) {
      // ตรวจสอบว่า agent ใหม่มีอยู่จริง
      const agentExists = await prisma.agUserAccountDB.findUnique({
        where: { id: agentId }
      });

      if (!agentExists) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      updateData.agentId = agentId;
    }

    if (note !== undefined) {
      updateData.note = note;
    }

    const customerAgent = await prisma.customerAgentDB.update({
      where: { customerId },
      data: updateData,
      include: {
        agent: true
      }
    });

    return res.status(200).json({
      success: true,
      data: customerAgent,
      message: 'Customer-Agent mapping updated successfully'
    });
  } catch (error) {
    console.error('PUT Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update customer-agent mapping'
    });
  }
}

// DELETE - ลบ customer-agent mapping (soft delete)
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'customerId is required'
    });
  }

  try {
    // ตรวจสอบว่า mapping มีอยู่จริง
    const existingMapping = await prisma.customerAgentDB.findUnique({
      where: { customerId: customerId as string }
    });

    if (!existingMapping) {
      return res.status(404).json({
        success: false,
        error: 'Customer-Agent mapping not found'
      });
    }

    // Soft delete
    await prisma.customerAgentDB.update({
      where: { customerId: customerId as string },
      data: {
        isActive: false,
        deleteAt: new Date(),
        deleteBy: 'current-user-id', // TODO: Get from auth context
        updatedBy: 'current-user-id'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Customer-Agent mapping deleted successfully'
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete customer-agent mapping'
    });
  }
}