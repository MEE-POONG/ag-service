import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AdjustBet, AdjustBetResponse } from '../../../types/adjustBet';

// GET - Get single adjust bet by ID
// PUT - Update adjust bet
// DELETE - Delete adjust bet
export default async function handler(req: NextApiRequest, res: NextApiResponse<AdjustBetResponse>) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID parameter'
    });
  }

  try {
    if (req.method === 'GET') {
      const adjustBet = await (prisma as any).adjustbets.findUnique({
        where: { id }
      });

      if (!adjustBet) {
        return res.status(404).json({
          success: false,
          error: 'Adjust Bet not found'
        });
      }

      // Transform data to match frontend expectations
      const transformedAdjustBet: AdjustBet = {
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
          lottoRCW: adjustBet.lottoRCW,
          lottoRDC: adjustBet.lottoRDC,
          cockfight: adjustBet.cockfight,
          muayStep: adjustBet.muayStep,
          virtualSports: adjustBet.virtualSports,
          createdBy: adjustBet.createdBy,
          updatedBy: adjustBet.updatedBy
        },
        createdAt: adjustBet.createdAt,
        updatedAt: adjustBet.updatedAt
      };

      return res.status(200).json({
        success: true,
        data: transformedAdjustBet
      });
    }

    if (req.method === 'PUT') {
      const updateData: any = req.body;

      // Check if adjust bet exists
      const existingAdjustBet = await (prisma as any).adjustbets.findUnique({
        where: { id }
      });

      if (!existingAdjustBet) {
        return res.status(404).json({
          success: false,
          error: 'Adjust Bet not found'
        });
      }

      // Prepare update data
      const finalUpdateData: any = {
        ...updateData,
        updatedAt: new Date()
      };

      // Update adjust bet
      const updatedAdjustBet = await (prisma as any).adjustbets.update({
        where: { id },
        data: finalUpdateData
      });

      return res.status(200).json({
        success: true,
        data: updatedAdjustBet as any,
        message: 'Adjust Bet updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Check if adjust bet exists
      const existingAdjustBet = await (prisma as any).adjustbets.findUnique({
        where: { id }
      });

      if (!existingAdjustBet) {
        return res.status(404).json({
          success: false,
          error: 'Adjust Bet not found'
        });
      }

      // Delete adjust bet
      await (prisma as any).adjustbets.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: 'Adjust Bet deleted successfully'
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
