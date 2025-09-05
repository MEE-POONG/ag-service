import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await handleGet(req, res);
    case 'POST':
      return await handlePost(req, res);
    case 'PUT':
      return await handlePut(req, res);
    case 'DELETE':
      return await handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

// GET - ดึง setting ล่าสุด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const setting = await prisma.settingDB.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ setting, message: 'ดึงข้อมูลการตั้งค่าสำเร็จ' });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า' });
  }
}

// POST - สร้าง setting ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      logo,
      logoText,
      logoTextColor,
      logoTextSize,
      logoTextFont,
      logoTextFontSize,
      logoTextFontColor,
      facebook,
      instagram,
      line,
      youtube,
      website,
      address,
      tel,
      createdBy = 'system'
    } = req.body;

    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อเว็บไซต์' });

    const existing = await prisma.settingDB.findFirst();
    if (existing) {
      return res.status(400).json({ error: 'ข้อมูลการตั้งค่าถูกสร้างแล้ว กรุณาใช้การอัปเดตแทน' });
    }

    const setting = await prisma.settingDB.create({
      data: {
        name,
        logo,
        logoText,
        logoTextColor,
        logoTextSize: logoTextSize ? parseInt(logoTextSize) : undefined,
        logoTextFont,
        logoTextFontSize: logoTextFontSize ? parseInt(logoTextFontSize) : undefined,
        logoTextFontColor,
        facebook,
        instagram,
        line,
        youtube,
        website,
        address,
        tel,
        createdBy,
        updatedBy: createdBy,
      },
    });

    return res.status(201).json({ setting, message: 'สร้างการตั้งค่าสำเร็จ' });
  } catch (error) {
    console.error('Create settings error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างการตั้งค่า' });
  }
}

// PUT - อัปเดต setting
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, updatedBy = 'system', ...data } = req.body;

    if (!id) return res.status(400).json({ error: 'ไม่พบ id' });

    const setting = await prisma.settingDB.update({
      where: { id },
      data: {
        ...data,
        logoTextSize: data.logoTextSize ? parseInt(data.logoTextSize) : undefined,
        logoTextFontSize: data.logoTextFontSize ? parseInt(data.logoTextFontSize) : undefined,
        updatedBy
      },
    });

    return res.status(200).json({ setting, message: 'อัปเดตการตั้งค่าสำเร็จ' });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า' });
  }
}

// DELETE - ลบ setting
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ไม่พบ id' });

    await prisma.settingDB.delete({ where: { id } });

    return res.status(200).json({ message: 'ลบการตั้งค่าสำเร็จ' });
  } catch (error) {
    console.error('Delete settings error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบการตั้งค่า' });
  }
}
