import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const prisma = new PrismaClient();

const deleteImageFromCloudflare = async (imageId: string) => {
    try {

        const response = await axios.delete(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
            {
                headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
            }
        );
        return response.data;
    } catch (error) {
        // Narrow the type of error
        if (axios.isAxiosError(error)) {
            console.error("Failed to delete image from Cloudflare:", error.response?.data || error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        throw error; // Propagate the error to be handled by the caller
    }
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'DELETE':
            await handleDelete(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ success: false, error: "imageUrl is required." });
    }

    let cloudflareDeleted = false;

    try {
        const statusDel = await deleteImageFromCloudflare(imageUrl);

        // ✅ ถ้า Cloudflare ลบสำเร็จ
        if (statusDel?.success === true) {
            cloudflareDeleted = true;
        }
    } catch (error) {
        // ✅ ถ้า Cloudflare แจ้ง `Image not found (404)` ให้ถือว่าลบสำเร็จ
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`⚠️ Image ${imageUrl} not found in Cloudflare, skipping deletion.`);
            cloudflareDeleted = true;
        } else {
            console.error("❌ Cloudflare Delete Error:", error);
            return res.status(500).json({ success: false, error: "Failed to delete image from Cloudflare." });
        }
    }

    // ✅ ดำเนินการลบข้อมูลจากฐานข้อมูล `imageList` ต่อ
    try {
        const imageDeletionCount = await prisma.imageList.deleteMany({
            where: { imageUrl: imageUrl },
        });

        if (imageDeletionCount.count === 0) {
            // ✅ ไม่พบข้อมูลใน DB ก็ถือว่าลบสำเร็จ
            console.warn(`⚠️ No record found in database for imageUrl: ${imageUrl}. Consider it delete.`);
        }

        return res.status(200).json({
            success: true,
            message: `✅ Image delete successfully. Cloudflare: ${cloudflareDeleted ? "Deleted/Not Found" : "Skipped"}, Database: ${imageDeletionCount.count} row(s)`,
        });

    } catch (dbError) {
        console.error("❌ Error deleting image from database:", dbError);
        return res.status(500).json({ success: false, error: "Error deleting image from database." });
    }
}
