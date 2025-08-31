import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface Response {
  success: boolean;
  message?: string;
  error?: string;
  position?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'รูปแบบ ID ไม่ถูกต้อง' });
  }

  if (req.method === 'PATCH') {
    try {
      const { isActive } = req.body as { isActive?: boolean };
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ success: false, error: 'ต้องระบุค่า isActive เป็น boolean' });
      }

      const exists = await prisma.adminPositionDB.findFirst({ where: { id, isDeleted: false } });
      if (!exists) {
        return res.status(404).json({ success: false, error: 'ไม่พบตำแหน่ง' });
      }

      const position = await prisma.adminPositionDB.update({
        where: { id },
        data: { isActive, updatedBy: 'system' },
      });

      return res.status(200).json({ success: true, message: 'อัปเดตสถานะสำเร็จ', position });
    } catch (error) {
      console.error('Update position isActive error:', error);
      return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}


