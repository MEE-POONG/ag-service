import { PrismaClient, Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'GET':
            await handleGet(req, res);
            break;
        case 'POST':
            await handlePost(req, res);
            break;
        case 'PUT':
            await handlePut(req, res);
            break;
        case 'DELETE':
            await handleDelete(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

// 🟢 **ดึงข้อมูลรูปภาพทั้งหมด (GET)**
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { page = '1', pageSize = '10', keyword = "" } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    try {
        const whereClause: Prisma.ImageListWhereInput = {
            deleteBy: '',
            nameFile: {
                contains: keyword as string,
                mode: 'insensitive',
            }
        };

        const [images, totalImages] = await Promise.all([
            prisma.imageList.findMany({
                where: whereClause,
                skip,
                take: pageSizeNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.imageList.count({ where: whereClause }),
        ]);

        res.status(200).json({
            success: true,
            images,
            pagination: {
                total: totalImages,
                totalPages: Math.ceil(totalImages / pageSizeNum),
                currentPage: pageNum,
                pageSize: pageSizeNum,
            },
        });
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ success: false, error: "Error fetching images." });
    }
}

// 🟢 **เพิ่มรูปภาพใหม่ (POST)**
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { imageUrl, modelName, nameFile, createdBy } = req.body;

    if (!imageUrl || !nameFile) {
        return res.status(400).json({ success: false, error: "imageUrl และ nameFile เป็นข้อมูลที่จำเป็น!" });
    }

    try {
        const newImage = await prisma.imageList.create({
            data: {
                imageUrl,
                modelName,
                nameFile,
                createdAt: new Date(),  // ✅ เพิ่มค่า createdAt
                updatedAt: new Date(),  // ✅ เพิ่มค่า updatedAt
                createdBy,
                updatedBy: createdBy || '',
                deleteBy: '',
                isDeleted: false,
            },
        });

        res.status(201).json({ success: true, newImage });
    } catch (error) {
        console.error("Error creating new image:", error);
        res.status(500).json({ success: false, error: "Error creating new image." });
    }
}


// 🟢 **แก้ไขข้อมูลรูปภาพ (PUT)**
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    const { id, imageUrl, modelName, nameFile, updatedBy } = req.body;

    if (!id || !imageUrl || !nameFile) {
        return res.status(400).json({ success: false, error: "id, imageUrl และ nameFile เป็นข้อมูลที่จำเป็น!" });
    }

    try {
        const updatedImage = await prisma.imageList.update({
            where: { id },
            data: {
                imageUrl,
                modelName,
                nameFile,
                updatedBy,
            },
        });

        res.status(200).json({ success: true, updatedImage });
    } catch (error) {
        console.error("Error updating image:", error);
        res.status(500).json({ success: false, error: "Error updating image." });
    }
}

// 🟢 **ลบรูปภาพ (DELETE)**
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, error: "ต้องระบุ ID ของรูปภาพที่ต้องการลบ!" });
    }

    try {
        await prisma.imageList.delete({ where: { id } });
        res.status(204).end();
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ success: false, error: "Error deleting image." });
    }
}
