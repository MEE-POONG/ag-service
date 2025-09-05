import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (_, __, cb) {
        cb(null, uploadDir);
    },
    filename: function (_, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Disable Next.js built-in body parser for multer to work
export const config = { api: { bodyParser: false } };

// Helper function to delete a file from the local directory
const deleteFile = (filePath: string) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
    });
};

// Helper function to delete an image from Cloudflare
const deleteImageFromCloudflare = async (imageId: string) => {
    try {
        await axios.delete(`https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/${imageId}`, {
            headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
        });
    } catch (error) {
        console.error('Failed to delete image from Cloudflare:', error);
    }
};

// Multer middleware function
const multerMiddleware = upload.single('file');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET':
            // Handle GET requests to fetch image list
            await handleGet(req, res);
            break;

        case 'POST':
            // Handle POST requests for file upload
            await handlePost(req, res);
            break;

        case 'DELETE':
            // Handle POST requests for file upload
            await handleDelete(req, res);
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

// GET request handler to retrieve image list
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const images = await prisma.imageList.findMany();
        res.status(200).json({ success: true, data: images });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error retrieving images.' });
    }
};

// POST request handler to upload an image
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // ใช้ promise wrapper กับ multer middleware
        await new Promise<void>((resolve, reject) => {
            multerMiddleware(req as any, res as any, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const files = (req as any).files; // รับ array ของไฟล์
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const { modelName } = req.body;
        const uploadedImages: any[] = []; // เก็บข้อมูลของภาพที่อัปโหลดสำเร็จ

        for (const file of files) {
            const filePath = file.path;
            const nameFile = file.originalname;

            // ตรวจสอบว่ามีไฟล์ชื่อเดียวกันในฐานข้อมูลหรือไม่
            const existingImage = await prisma.imageList.findFirst({
                where: { nameFile },
            });

            if (existingImage) {
                deleteFile(filePath); // ลบไฟล์ซ้ำออกจาก local storage
                continue; // ข้ามไฟล์นี้
            }

            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(filePath));

                const cloudflareResponse = await axios.post(
                    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                            ...formData.getHeaders(),
                        },
                    }
                );

                const imageUrl = cloudflareResponse?.data?.result?.id;

                if (!imageUrl) {
                    deleteFile(filePath);
                    continue; // ข้ามไฟล์นี้
                }

                // บันทึกรายละเอียดภาพในฐานข้อมูล
                const savedImage = await prisma.imageList.create({
                    data: {
                        modelName,
                        imageUrl,
                        nameFile,
                        createdAt: new Date(),
                        createdBy: "system",
                        updatedAt: new Date(),
                        updatedBy: "system",
                        deleteBy: "",
                    },
                });

                // เพิ่มข้อมูลภาพที่อัปโหลดสำเร็จใน array
                uploadedImages.push(savedImage);

                // ลบไฟล์จาก local storage
                deleteFile(filePath);
            } catch (error) {
                deleteFile(filePath);
                console.error(`Error uploading file ${nameFile} to Cloudflare:`, error);
            }
        }

        if (uploadedImages.length === 0) {
            return res.status(500).json({ success: false, error: 'No files were successfully uploaded' });
        }

        res.status(200).json({ success: true, data: uploadedImages });
    } catch (err: any) {
        console.error('Error handling file upload:', err.message);
        res.status(500).json({ error: err.message });
    }
};


const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { imageId } = req.body;

        if (!imageId) {
            return res.status(400).json({ success: false, error: 'Image ID is required' });
        }

        // Retrieve the image details from the database
        const image = await prisma.imageList.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            return res.status(404).json({ success: false, error: 'Image not found' });
        }

        // Delete the image from Cloudflare
        await deleteImageFromCloudflare(image.imageUrl);

        // Delete the image record from the database
        await prisma.imageList.delete({
            where: { id: imageId },
        });

        res.status(200).json({ success: true, message: 'Image delete successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ success: false, error: 'Error deleting image' });
    }
};

export default handler;
