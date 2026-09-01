import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

interface SetZeroRequest {
  customerId: string;
  agentId: string;
  createdBy?: string;
}

interface SetZeroResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

interface SetZeroListResponse {
  success: boolean;
  data?: any[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<SetZeroResponse | SetZeroListResponse>
) {
  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '10', search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for search
      const whereClause = search ? {
        OR: [
          { customerId: { contains: search as string, mode: 'insensitive' } },
          { agent: { username: { contains: search as string, mode: 'insensitive' } } }
        ]
      } : {};

      // Get total count
      const total = await (prisma as any).setZero.count({ where: whereClause });

      // Get SetZero records with pagination
      const setZeros = await (prisma as any).setZero.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        include: {
          agent: {
            select: {
              username: true,
              userLogin: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: setZeros,
        total,
        page: pageNum,
        limit: limitNum
      });
    }

    if (req.method === 'POST') {
      const { customerId, agentId, createdBy }: SetZeroRequest = req.body;

      // Validation
      if (!customerId || !agentId) {
        return res.status(400).json({
          success: false,
          error: 'customerId and agentId are required'
        });
      }

      // Check if agent exists
      const agent = await (prisma as any).agUserDB.findUnique({
        where: { id: agentId }
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // Create new SetZero record
      const newSetZero = await (prisma as any).setZero.create({
        data: {
          customerId,
          agentId,
          status: 'PENDING',
          createdBy: createdBy || 'system',
          updatedBy: createdBy || 'system'
        },
        include: {
          agent: {
            select: {
              username: true,
              userLogin: true
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: newSetZero,
        message: 'SetZero record created successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });

  } catch (error: any) {
    console.error('SetZero API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
