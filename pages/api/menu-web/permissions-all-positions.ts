import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type Body = {
  menuWebDBId: string;
  canAdvance?: boolean;
  canViews?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

type Response = {
  success: boolean;
  message?: string;
  error?: string;
  updatedCount?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { menuWebDBId, canAdvance, canViews, canCreate, canUpdate, canDelete } = req.body as Body;

  if (!menuWebDBId || typeof menuWebDBId !== 'string') {
    return res.status(400).json({ success: false, error: 'ต้องระบุ menuWebDBId' });
  }

  try {
    // verify menu exists
    const menu = await prisma.menuWebDB.findFirst({ where: { id: menuWebDBId, } });
    if (!menu) {
      return res.status(404).json({ success: false, error: 'ไม่พบเมนู' });
    }

    const positions = await prisma.adminPositionDB.findMany({ where: {} });
    if (!positions.length) {
      return res.status(200).json({ success: true, updatedCount: 0, message: 'ไม่มีตำแหน่งสำหรับอัปเดต' });
    }

    const updates = positions.map((position) =>
      prisma.adminDefaultPermissionDB.upsert({
        where: {
          adminPositionId_menuWebId: {
            adminPositionId: position.id,
            menuWebId: menuWebDBId,
          },
        },
        update: {
          canAdvance: Boolean(canAdvance),
          canViews: Boolean(canViews),
          canCreate: Boolean(canCreate),
          canUpdate: Boolean(canUpdate),
          canDelete: Boolean(canDelete),
          updatedBy: 'system',
        },
        create: {
          adminPositionDB: {
            connect: {
              id: position.id,
            },
          },
          menuWebDB: {
            connect: {
              id: menuWebDBId,
            },
          },
          canAdvance: Boolean(canAdvance),
          canViews: Boolean(canViews),
          canCreate: Boolean(canCreate),
          canUpdate: Boolean(canUpdate),
          canDelete: Boolean(canDelete),
          isDeleted: false,
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
          updatedBy: 'system',
        },
      })
    );

    await prisma.$transaction(updates);

    return res.status(200).json({ success: true, message: 'อัปเดตสิทธิ์ให้ทุกตำแหน่งสำเร็จ', updatedCount: positions.length });
  } catch (error) {
    console.error('Bulk permissions apply error:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตสิทธิ์' });
  }
}


