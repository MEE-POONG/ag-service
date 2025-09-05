import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { id } = req.query;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid or missing image ID" });
    }

    switch (method) {
        case 'GET':
            try {
                const image = await prisma.imageList.findUnique({ where: { id } });

                if (!image) {
                    return res.status(404).json({ error: "Image not found" });
                }

                res.status(200).json({ success: true, image });
            } catch (error) {
                console.error("Error fetching image:", error);
                res.status(500).json({ error: "Error fetching image" });
            }
            break;

        case 'PUT':
            try {
                const { imageUrl, modelName, nameFile, updatedBy } = req.body;

                if (!imageUrl || !nameFile) {
                    return res.status(400).json({ error: "imageUrl และ nameFile เป็นข้อมูลที่จำเป็น!" });
                }

                const updatedImage = await prisma.imageList.update({
                    where: { id },
                    data: { imageUrl, modelName, nameFile, updatedBy },
                });

                res.status(200).json({ success: true, updatedImage });
            } catch (error) {
                console.error("Error updating image:", error);
                res.status(500).json({ error: "Error updating image." });
            }
            break;

        case 'DELETE':
            try {
                await prisma.imageList.delete({ where: { id } });
                res.status(204).end();
            } catch (error) {
                console.error("Error deleting image:", error);
                res.status(500).json({ error: "Error deleting image." });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
