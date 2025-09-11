import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AdjustBet, AdjustBetListResponse } from '../../../types/adjustBet';
// GET - List all adjust bets
export default async function handler(req: NextApiRequest, res: NextApiResponse<AdjustBetListResponse>) {
  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '10', search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for search
      const whereClause = search ? {
        OR: [
          { customer: { contains: search as string, mode: 'insensitive' } },
          { usernameAG: { contains: search as string, mode: 'insensitive' } },
          { agBaseUrl: { contains: search as string, mode: 'insensitive' } }
        ]
      } : {};

      // Get total count
      const total = await (prisma as any).adjustbets.count({ where: whereClause });

      // Get adjust bets with pagination
      const adjustBets = await (prisma as any).adjustbets.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' }
      });

      // Transform data to match frontend expectations
      const transformedAdjustBets = adjustBets.map((adjustBet: any) => ({
        id: adjustBet.id,
        name: `${adjustBet.customer} - ${adjustBet.usernameAG}`,
        description: `Adjust Bet for ${adjustBet.customer}`,
        data: {
          customer: adjustBet.customer,
          usernameAG: adjustBet.usernameAG,
          agBaseUrl: adjustBet.agBaseUrl,
          pinUsed: adjustBet.pinUsed,
          sportsbook: adjustBet.sportsbook,
          sexy: adjustBet.sexy,
          sa: adjustBet.sa,
          slotItp: adjustBet.slotItp,
          slotJoker: adjustBet.slotJoker,
          slotPlaystar: adjustBet.slotPlaystar,
          cockfight: adjustBet.cockfight,
          muayStep: adjustBet.muayStep,
          virtualSports: adjustBet.virtualSports,
          createdBy: adjustBet.createdBy,
          updatedBy: adjustBet.updatedBy
        },
        createdAt: adjustBet.createdAt,
        updatedAt: adjustBet.updatedAt
      }));

      return res.status(200).json({
        success: true,
        data: transformedAdjustBets,
        total,
        page: pageNum,
        limit: limitNum
      });
    }

    if (req.method === 'POST') {
      const { customer, usernameAG, agBaseUrl, pinUsed, sportsbook, sexy, sa, slotItp, slotJoker, slotPlaystar, cockfight, muayStep, virtualSports, overallStatus, attemptCount, createdBy, updatedBy, lastError }: any = req.body.data;
      console.log(req.body);
      console.log(customer, usernameAG, agBaseUrl, pinUsed, sportsbook, sexy, sa, slotItp, slotJoker, slotPlaystar, cockfight, muayStep, virtualSports, overallStatus, attemptCount, createdBy, updatedBy, lastError);
      // Validation
      if (!customer || !usernameAG) {
        return res.status(400).json({
          success: false,
          error: 'Customer, usernameAG are required'
        });
      }

      // Create new adjust bet
      const newAdjustBet = await (prisma as any).adjustbets.create({
        data: {
          customer,
          usernameAG,
          agBaseUrl,
          pinUsed,
          sportsbook: sportsbook || {},
          sexy: sexy || {},
          sa: sa || {},
          slotItp: slotItp || {},
          slotJoker: slotJoker || {},
          slotPlaystar: slotPlaystar || {},
          cockfight: cockfight || {},
          muayStep: muayStep || {},
          virtualSports: virtualSports || {},
          overAllStatus: 'PENDING',
          attemptCount: attemptCount || 0,
          createdBy: createdBy || 'system',
          updatedBy: updatedBy || 'system',
          lastError: lastError || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return res.status(201).json({
        success: true,
        data: newAdjustBet as any,
        message: 'Adjust Bet created successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });

  } catch (error: any) {
    console.error('Adjust Bet API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
