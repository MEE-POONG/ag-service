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
        // Use a promise wrapper for multer middleware
        await new Promise<void>((resolve, reject) => {
            multerMiddleware(req as any, res as any, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const file = (req as any).file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const { modelName } = req.body;

        const filePath = file.path;
        const nameFile = file.originalname; // Get original file name

        // Check if nameFile already exists
        const existingImage = await prisma.imageList.findFirst({
            where: { nameFile, modelName }, // This works for non-unique fields
        });

        if (existingImage) {
            deleteFile(filePath); // Clean up the uploaded file

            return res.status(400).json({
                error: `A file with the same name (${nameFile}) already exists for modal: ${modelName}`,
            });
        }

        try {
            const formData = new FormData();
            formData?.append('file', fs.createReadStream(filePath));

            const cloudflareResponse = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1` as string, formData, {
                headers: {
                    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                    ...formData?.getHeaders(),
                },
            });

            const imageUrl = cloudflareResponse?.data?.result.id;

            const savedImage = await prisma.imageList.create({
                data: {
                    modelName,
                    imageUrl,
                    nameFile,
                    createdAt: new Date(),
                    createdBy: "system",
                    updatedAt: new Date(),
                    updatedBy: "system",
                    deleteBy: ""
                },
            });

            // Delete the file from local storage
            deleteFile(filePath);

            res.status(200).json({
                success: true,
                imageUrl, // จาก Cloudflare
            });
        } catch (error: any) {
            deleteFile(filePath);

            // ถ้าเป็น axios error จาก Cloudflare
            let message = "Error uploading to Cloudflare";

            if (axios.isAxiosError(error)) {
                const cloudflareError = error.response?.data?.errors?.[0]?.message || error.response?.data?.error;
                message = cloudflareError || error.message;
            } else if (error instanceof Error) {
                message = error.message;
            }

            console.error("❌ Cloudflare upload failed:", message);
            res.status(500).json({ error: message });
        }
    } catch (err: any) {
        let message = "Unexpected server error";

        if (axios.isAxiosError(err)) {
            message = err.response?.data?.error || err.message;
        } else if (err instanceof Error) {
            message = err.message;
        }

        console.error("❌ General upload error:", message);
        res.status(500).json({ error: message });
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
