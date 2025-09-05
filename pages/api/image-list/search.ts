import { PrismaClient, Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { page = '1', pageSize = '10', keyword = "" } = req.query;

        const pageNum = parseInt(page as string, 10) || 1;
        const pageSizeNum = parseInt(pageSize as string, 10) || 10;
        const skip = (pageNum - 1) * pageSizeNum;

        const whereClause: Prisma.ImageListWhereInput = {
            deleteBy: '',
            OR: [
                { nameFile: { contains: keyword as string, mode: 'insensitive' } },
                { modelName: { contains: keyword as string, mode: 'insensitive' } },
            ],
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
                totalItems: totalImages,
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
